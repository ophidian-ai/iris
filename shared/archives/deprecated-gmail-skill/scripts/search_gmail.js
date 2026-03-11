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

async function searchGmail(query, maxResults = 20) {
  const auth = getAuth();
  const gmail = google.gmail({ version: "v1", auth });

  const res = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults,
  });

  const messages = res.data.messages || [];
  if (messages.length === 0) {
    console.log("No messages found.");
    return;
  }

  const results = [];
  for (const msg of messages) {
    const full = await gmail.users.messages.get({
      userId: "me",
      id: msg.id,
      format: "metadata",
      metadataHeaders: ["From", "To", "Subject", "Date"],
    });

    const headers = full.data.payload.headers;
    const get = (name) => headers.find((h) => h.name === name)?.value || "";

    results.push({
      id: msg.id,
      threadId: msg.threadId,
      from: get("From"),
      to: get("To"),
      subject: get("Subject"),
      date: get("Date"),
      snippet: full.data.snippet,
      labels: full.data.labelIds,
    });
  }

  console.log(JSON.stringify(results, null, 2));
}

const query = process.argv.slice(2).join(" ") || "in:inbox";
const maxResults = parseInt(process.env.MAX_RESULTS) || 20;
searchGmail(query, maxResults).catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
