/**
 * gmail_read.js
 *
 * Read Gmail messages using googleapis directly (bypasses gws CLI keyring bug).
 * Uses OAuth2 tokens from ~/.config/gws/gmail-tokens.json
 *
 * Usage:
 *   node gmail_read.js --query "in:inbox newer_than:2h" --max 20
 *   node gmail_read.js --id <messageId>           # read single message
 */

const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const http = require("http");
const { execFile } = require("child_process");
const { URL } = require("url");

const TOKEN_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE,
  ".config/gws/gmail-tokens.json"
);
const SECRET_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE,
  ".config/gws/client_secret.json"
);

function loadClient() {
  const secret = JSON.parse(fs.readFileSync(SECRET_PATH, "utf8"));
  const key = Object.keys(secret)[0];
  const { client_id, client_secret, redirect_uris } = secret[key];
  const redirect = redirect_uris
    ? redirect_uris.find((u) => u.includes("localhost")) || redirect_uris[0]
    : "http://localhost:3000/oauth2callback";
  return new google.auth.OAuth2(client_id, client_secret, redirect);
}

async function getAuthClient() {
  const oauth2 = loadClient();

  if (fs.existsSync(TOKEN_PATH)) {
    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
    oauth2.setCredentials(tokens);

    // Auto-refresh if expired
    if (tokens.expiry_date && Date.now() > tokens.expiry_date - 60000) {
      try {
        const { credentials } = await oauth2.refreshAccessToken();
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(credentials, null, 2));
        oauth2.setCredentials(credentials);
      } catch (e) {
        console.error("Token refresh failed, re-authorizing...");
        return authorize(oauth2);
      }
    }
    return oauth2;
  }
  return authorize(oauth2);
}

function authorize(oauth2) {
  return new Promise((resolve, reject) => {
    const authUrl = oauth2.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/gmail.readonly"],
      prompt: "consent",
    });

    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url, "http://localhost:3000");
        const code = url.searchParams.get("code");
        if (!code) {
          res.end("No code received");
          return;
        }
        const { tokens } = await oauth2.getToken(code);
        oauth2.setCredentials(tokens);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
        res.end("Authenticated! You can close this tab.");
        server.close();
        resolve(oauth2);
      } catch (err) {
        res.end("Error: " + err.message);
        server.close();
        reject(err);
      }
    });

    server.listen(3000, () => {
      console.error("Opening browser for auth...");
      // Use execFile with 'cmd' to safely open the URL in the default browser
      execFile("cmd", ["/c", "start", "", authUrl]);
    });
  });
}

function parseHeaders(headers) {
  const get = (name) => {
    const h = headers.find(
      (h) => h.name.toLowerCase() === name.toLowerCase()
    );
    return h ? h.value : "";
  };
  return {
    from: get("From"),
    to: get("To"),
    subject: get("Subject"),
    date: get("Date"),
    messageId: get("Message-ID"),
  };
}

function getBody(payload) {
  if (payload.body && payload.body.data) {
    return Buffer.from(payload.body.data, "base64url").toString("utf8");
  }
  if (payload.parts) {
    const plain = payload.parts.find((p) => p.mimeType === "text/plain");
    if (plain && plain.body && plain.body.data) {
      return Buffer.from(plain.body.data, "base64url").toString("utf8");
    }
    const html = payload.parts.find((p) => p.mimeType === "text/html");
    if (html && html.body && html.body.data) {
      return Buffer.from(html.body.data, "base64url").toString("utf8");
    }
    for (const part of payload.parts) {
      const body = getBody(part);
      if (body) return body;
    }
  }
  return "";
}

async function main() {
  const args = process.argv.slice(2);
  const getArg = (flag) => {
    const idx = args.indexOf(flag);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
  };

  const auth = await getAuthClient();
  const gmail = google.gmail({ version: "v1", auth });

  const messageId = getArg("--id");
  if (messageId) {
    const res = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full",
    });
    const headers = parseHeaders(res.data.payload.headers);
    const body = getBody(res.data.payload);
    console.log(
      JSON.stringify({ id: res.data.id, threadId: res.data.threadId, ...headers, snippet: res.data.snippet, body }, null, 2)
    );
    return;
  }

  const query = getArg("--query") || "in:inbox newer_than:2h";
  const max = parseInt(getArg("--max") || "20", 10);

  const list = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: max,
  });

  if (!list.data.messages || list.data.messages.length === 0) {
    console.log(JSON.stringify({ messages: [], count: 0 }));
    return;
  }

  const messages = [];
  for (const msg of list.data.messages) {
    const res = await gmail.users.messages.get({
      userId: "me",
      id: msg.id,
      format: "full",
    });
    const headers = parseHeaders(res.data.payload.headers);
    const body = getBody(res.data.payload);
    messages.push({
      id: res.data.id,
      threadId: res.data.threadId,
      labelIds: res.data.labelIds,
      ...headers,
      snippet: res.data.snippet,
      body: body.substring(0, 2000),
    });
  }

  console.log(JSON.stringify({ messages, count: messages.length }, null, 2));
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
