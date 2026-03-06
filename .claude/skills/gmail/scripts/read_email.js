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

function decodeBody(body) {
  if (!body?.data) return "";
  return Buffer.from(body.data, "base64url").toString("utf8");
}

function extractText(payload) {
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return decodeBody(payload.body);
  }
  if (payload.parts) {
    // Prefer plain text, fall back to HTML
    const plain = payload.parts.find((p) => p.mimeType === "text/plain");
    if (plain) return decodeBody(plain.body);

    const html = payload.parts.find((p) => p.mimeType === "text/html");
    if (html) return decodeBody(html.body);

    // Recurse into nested multipart
    for (const part of payload.parts) {
      const text = extractText(part);
      if (text) return text;
    }
  }
  return "";
}

async function readEmail(messageId) {
  const auth = getAuth();
  const gmail = google.gmail({ version: "v1", auth });

  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  const headers = res.data.payload.headers;
  const get = (name) => headers.find((h) => h.name === name)?.value || "";

  const body = extractText(res.data.payload);

  const result = {
    id: res.data.id,
    threadId: res.data.threadId,
    from: get("From"),
    to: get("To"),
    cc: get("Cc"),
    subject: get("Subject"),
    date: get("Date"),
    labels: res.data.labelIds,
    body: body,
  };

  console.log(JSON.stringify(result, null, 2));
}

async function readThread(threadId) {
  const auth = getAuth();
  const gmail = google.gmail({ version: "v1", auth });

  const res = await gmail.users.threads.get({
    userId: "me",
    id: threadId,
    format: "full",
  });

  const messages = res.data.messages.map((msg) => {
    const headers = msg.payload.headers;
    const get = (name) => headers.find((h) => h.name === name)?.value || "";
    return {
      id: msg.id,
      from: get("From"),
      to: get("To"),
      cc: get("Cc"),
      subject: get("Subject"),
      date: get("Date"),
      labels: msg.labelIds,
      body: extractText(msg.payload),
    };
  });

  console.log(JSON.stringify(messages, null, 2));
}

const args = process.argv.slice(2);
if (args[0] === "--thread" && args[1]) {
  readThread(args[1]).catch((err) => {
    console.error("Error:", err.message);
    process.exit(1);
  });
} else if (args[0]) {
  readEmail(args[0]).catch((err) => {
    console.error("Error:", err.message);
    process.exit(1);
  });
} else {
  console.error("Usage: node read_email.js <messageId>");
  console.error("       node read_email.js --thread <threadId>");
  process.exit(1);
}
