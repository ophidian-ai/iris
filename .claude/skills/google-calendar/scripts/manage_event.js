const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

const CREDENTIALS_PATH = path.join(__dirname, "../../gmail/scripts/credentials.json");
const TOKEN_PATH = path.join(__dirname, "../../gmail/scripts/token.json");

function getAuth() {
  const { installed } = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
  const oAuth2Client = new google.auth.OAuth2(
    installed.client_id,
    installed.client_secret,
    "http://localhost:3000/oauth2callback"
  );
  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
  oAuth2Client.setCredentials(tokens);
  return oAuth2Client;
}

async function updateEvent(eventId, updates) {
  const auth = getAuth();
  const calendar = google.calendar({ version: "v3", auth });

  const existing = await calendar.events.get({
    calendarId: "primary",
    eventId,
  });

  const event = { ...existing.data, ...updates };

  if (updates.start) {
    event.start = updates.allDay
      ? { date: updates.start }
      : { dateTime: updates.start, timeZone: updates.timeZone || "America/New_York" };
  }
  if (updates.end) {
    event.end = updates.allDay
      ? { date: updates.end }
      : { dateTime: updates.end, timeZone: updates.timeZone || "America/New_York" };
  }

  const res = await calendar.events.update({
    calendarId: "primary",
    eventId,
    requestBody: event,
  });

  console.log(JSON.stringify({ success: true, action: "updated", id: res.data.id, summary: res.data.summary }, null, 2));
}

async function deleteEvent(eventId) {
  const auth = getAuth();
  const calendar = google.calendar({ version: "v3", auth });

  await calendar.events.delete({
    calendarId: "primary",
    eventId,
  });

  console.log(JSON.stringify({ success: true, action: "deleted", id: eventId }, null, 2));
}

// Usage: node manage_event.js update <eventId> < updates.json
//        node manage_event.js delete <eventId>
async function main() {
  const action = process.argv[2];
  const eventId = process.argv[3];

  if (!action || !eventId) {
    console.error("Usage:");
    console.error("  node manage_event.js update <eventId> < updates.json");
    console.error("  node manage_event.js delete <eventId>");
    process.exit(1);
  }

  if (action === "delete") {
    await deleteEvent(eventId);
  } else if (action === "update") {
    const chunks = [];
    process.stdin.setEncoding("utf8");
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    const updates = JSON.parse(chunks.join(""));
    await updateEvent(eventId, updates);
  } else {
    console.error("Unknown action:", action, "(use 'update' or 'delete')");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
