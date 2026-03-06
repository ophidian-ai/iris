const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");
const TOKEN_PATH = path.join(__dirname, "token.json");

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

function buildSinceDate(sinceStr) {
  // If provided, use it. Otherwise default to 7 days ago.
  if (sinceStr) {
    return sinceStr; // Expected format: YYYY/MM/DD
  }
  const d = new Date();
  d.setDate(d.getDate() - 7);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}/${mm}/${dd}`;
}

async function checkReplies(emails, since) {
  const auth = getAuth();
  const gmail = google.gmail({ version: "v1", auth });
  const sinceDate = buildSinceDate(since);

  const results = [];

  for (const email of emails) {
    const query = `from:${email} after:${sinceDate}`;
    const res = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults: 50,
    });

    const messageIds = res.data.messages || [];
    const messages = [];

    for (const msg of messageIds) {
      const full = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "metadata",
        metadataHeaders: ["From", "To", "Subject", "Date"],
      });

      const headers = full.data.payload.headers;
      const get = (name) => headers.find((h) => h.name === name)?.value || "";

      messages.push({
        id: msg.id,
        subject: get("Subject"),
        snippet: full.data.snippet,
        date: get("Date"),
      });
    }

    results.push({
      email,
      hasReplies: messages.length > 0,
      messages,
    });
  }

  console.log(JSON.stringify(results, null, 2));
}

async function main() {
  let emails = [];
  let since = null;

  // Parse --since argument
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--since" && args[i + 1]) {
      since = args[i + 1];
      args.splice(i, 2);
      break;
    }
  }

  // Input source: file argument, or stdin
  if (args.length > 0) {
    // Argument is a file path containing a JSON array of emails
    const content = fs.readFileSync(args[0], "utf8");
    emails = JSON.parse(content);
  } else {
    // Read from stdin
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    const input = Buffer.concat(chunks).toString("utf8").trim();
    if (!input) {
      console.error("Error: No input provided. Pass a JSON array of emails via stdin or a file path as argument.");
      process.exit(1);
    }
    emails = JSON.parse(input);
  }

  if (!Array.isArray(emails) || emails.length === 0) {
    console.error("Error: Input must be a non-empty JSON array of email addresses.");
    process.exit(1);
  }

  await checkReplies(emails, since);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
