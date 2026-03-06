const fs = require("fs");
const path = require("path");
const https = require("https");

// Load token from .env file
function getToken() {
  const envPath = path.join(__dirname, "../../../../.env");
  const content = fs.readFileSync(envPath, "utf8");
  const match = content.match(/CLICKUP_API_TOKEN=(.+)/);
  if (!match) throw new Error("CLICKUP_API_TOKEN not found in .env");
  return match[1].trim();
}

function request(method, endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const token = getToken();
    const url = new URL(`https://api.clickup.com/api/v2${endpoint}`);

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// --- Commands ---

async function listSpaces() {
  const teams = await request("GET", "/team");
  const results = [];
  for (const team of teams.teams) {
    const spaces = await request("GET", `/team/${team.id}/space`);
    for (const space of spaces.spaces) {
      results.push({ id: space.id, name: space.name, teamId: team.id, teamName: team.name });
    }
  }
  return results;
}

async function listFolders(spaceId) {
  const res = await request("GET", `/space/${spaceId}/folder`);
  return (res.folders || []).map((f) => ({
    id: f.id,
    name: f.name,
    lists: (f.lists || []).map((l) => ({ id: l.id, name: l.name })),
  }));
}

async function listLists(spaceId) {
  // Get folderless lists
  const res = await request("GET", `/space/${spaceId}/list`);
  return (res.lists || []).map((l) => ({ id: l.id, name: l.name, folder: null }));
}

async function getTasks(listId, options = {}) {
  const params = new URLSearchParams();
  if (options.statuses) options.statuses.forEach((s) => params.append("statuses[]", s));
  if (options.assignees) options.assignees.forEach((a) => params.append("assignees[]", a));
  if (options.subtasks) params.set("subtasks", "true");
  if (options.includeArchived) params.set("archived", "true");
  const qs = params.toString() ? `?${params.toString()}` : "";
  const res = await request("GET", `/list/${listId}/task${qs}`);
  return (res.tasks || []).map((t) => ({
    id: t.id,
    name: t.name,
    status: t.status?.status,
    priority: t.priority?.priority,
    assignees: (t.assignees || []).map((a) => a.username || a.email),
    dueDate: t.due_date ? new Date(parseInt(t.due_date)).toISOString() : null,
    url: t.url,
    tags: (t.tags || []).map((tag) => tag.name),
  }));
}

async function createTask(listId, taskData) {
  const body = {
    name: taskData.name,
    description: taskData.description || "",
    priority: taskData.priority || null,
    due_date: taskData.dueDate ? new Date(taskData.dueDate).getTime() : null,
    tags: taskData.tags || [],
    status: taskData.status || null,
  };
  const res = await request("POST", `/list/${listId}/task`, body);
  return { id: res.id, name: res.name, url: res.url, status: res.status?.status };
}

async function updateTask(taskId, updates) {
  const body = {};
  if (updates.name) body.name = updates.name;
  if (updates.description) body.description = updates.description;
  if (updates.status) body.status = updates.status;
  if (updates.priority !== undefined) body.priority = updates.priority;
  if (updates.dueDate) body.due_date = new Date(updates.dueDate).getTime();
  const res = await request("PUT", `/task/${taskId}`, body);
  return { id: res.id, name: res.name, status: res.status?.status, url: res.url };
}

async function getTask(taskId) {
  const res = await request("GET", `/task/${taskId}`);
  return {
    id: res.id,
    name: res.name,
    description: res.description,
    status: res.status?.status,
    priority: res.priority?.priority,
    assignees: (res.assignees || []).map((a) => a.username || a.email),
    dueDate: res.due_date ? new Date(parseInt(res.due_date)).toISOString() : null,
    url: res.url,
    tags: (res.tags || []).map((tag) => tag.name),
    list: { id: res.list?.id, name: res.list?.name },
  };
}

// --- CLI ---

async function main() {
  const [command, ...args] = process.argv.slice(2);

  switch (command) {
    case "spaces":
      console.log(JSON.stringify(await listSpaces(), null, 2));
      break;

    case "folders":
      if (!args[0]) { console.error("Usage: clickup.js folders <spaceId>"); process.exit(1); }
      console.log(JSON.stringify(await listFolders(args[0]), null, 2));
      break;

    case "lists":
      if (!args[0]) { console.error("Usage: clickup.js lists <spaceId>"); process.exit(1); }
      const folders = await listFolders(args[0]);
      const folderless = await listLists(args[0]);
      console.log(JSON.stringify({ folders, folderlessLists: folderless }, null, 2));
      break;

    case "tasks":
      if (!args[0]) { console.error("Usage: clickup.js tasks <listId>"); process.exit(1); }
      console.log(JSON.stringify(await getTasks(args[0]), null, 2));
      break;

    case "task":
      if (!args[0]) { console.error("Usage: clickup.js task <taskId>"); process.exit(1); }
      console.log(JSON.stringify(await getTask(args[0]), null, 2));
      break;

    case "create": {
      if (!args[0]) { console.error("Usage: clickup.js create <listId> < task.json"); process.exit(1); }
      const chunks = [];
      process.stdin.setEncoding("utf8");
      for await (const chunk of process.stdin) chunks.push(chunk);
      const taskData = JSON.parse(chunks.join(""));
      console.log(JSON.stringify(await createTask(args[0], taskData), null, 2));
      break;
    }

    case "update": {
      if (!args[0]) { console.error("Usage: clickup.js update <taskId> < updates.json"); process.exit(1); }
      const chunks = [];
      process.stdin.setEncoding("utf8");
      for await (const chunk of process.stdin) chunks.push(chunk);
      const updates = JSON.parse(chunks.join(""));
      console.log(JSON.stringify(await updateTask(args[0], updates), null, 2));
      break;
    }

    default:
      console.error("Commands: spaces, folders, lists, tasks, task, create, update");
      console.error("Run with --help after any command for usage.");
      process.exit(1);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
