/**
 * send_raw_email.js
 *
 * Sends a raw MIME email via Gmail API using stored OAuth2 credentials.
 * Bypasses gws CLI's --json stdin limitation for large payloads (attachments).
 *
 * Usage:
 *   Pipe build_raw_email.js output:
 *     echo '{"to":"x@y.com","subject":"Hi","html":"<p>Hello</p>","attachments":[...]}' \
 *       | node build_raw_email.js \
 *       | node send_raw_email.js
 *
 *   Or pass a JSON file path:
 *     node send_raw_email.js /path/to/raw_email.json
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const GWS_DIR = path.join(process.env.HOME || process.env.USERPROFILE, ".config", "gws");
const TOKENS_PATH = path.join(GWS_DIR, "gmail-tokens.json");
const CLIENT_PATH = path.join(GWS_DIR, "client_secret.json");

function loadTokens() {
  return JSON.parse(fs.readFileSync(TOKENS_PATH, "utf8"));
}

function saveTokens(tokens) {
  fs.writeFileSync(TOKENS_PATH, JSON.stringify(tokens, null, 2));
}

function loadClientSecret() {
  const data = JSON.parse(fs.readFileSync(CLIENT_PATH, "utf8"));
  return data.installed || data.web;
}

function refreshAccessToken(client, tokens) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      client_id: client.client_id,
      client_secret: client.client_secret,
      refresh_token: tokens.refresh_token,
      grant_type: "refresh_token",
    }).toString();

    const req = https.request(
      {
        hostname: "oauth2.googleapis.com",
        path: "/token",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (d) => (body += d));
        res.on("end", () => {
          if (res.statusCode !== 200) {
            return reject(new Error(`Token refresh failed: ${body}`));
          }
          const newTokens = JSON.parse(body);
          tokens.access_token = newTokens.access_token;
          tokens.expiry_date = Date.now() + newTokens.expires_in * 1000;
          saveTokens(tokens);
          resolve(tokens);
        });
      }
    );
    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

function sendMessage(accessToken, rawJson) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(rawJson);
    const req = https.request(
      {
        hostname: "gmail.googleapis.com",
        path: "/gmail/v1/users/me/messages/send",
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (d) => (data += d));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`Gmail API ${res.statusCode}: ${data}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  let input;

  // Read from file arg or stdin
  if (process.argv[2] && process.argv[2] !== "-") {
    input = fs.readFileSync(process.argv[2], "utf8");
  } else {
    const chunks = [];
    process.stdin.setEncoding("utf8");
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    input = chunks.join("");
  }

  const rawJson = JSON.parse(input);

  // Load and refresh tokens if needed
  const client = loadClientSecret();
  let tokens = loadTokens();

  if (!tokens.expiry_date || Date.now() >= tokens.expiry_date - 60000) {
    tokens = await refreshAccessToken(client, tokens);
  }

  const result = await sendMessage(tokens.access_token, rawJson);
  console.log(JSON.stringify(result));
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
