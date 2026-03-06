const fs = require("fs");
const path = require("path");
const http = require("http");
const { google } = require("googleapis");

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
];

const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");
const TOKEN_PATH = path.join(__dirname, "token.json");

async function authorize() {
  const content = fs.readFileSync(CREDENTIALS_PATH, "utf8");
  const { installed } = JSON.parse(content);
  const { client_id, client_secret } = installed;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    "http://localhost:3000/oauth2callback"
  );

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  console.log("Opening browser for authorization...");
  console.log("If browser doesn't open, visit this URL:\n");
  console.log(authUrl);
  console.log("");

  // Open browser
  const { exec } = require("child_process");
  exec(`start "" "${authUrl}"`);

  // Start local server to catch the callback
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url, "http://localhost:3000");
      if (url.pathname === "/oauth2callback") {
        const code = url.searchParams.get("code");
        if (code) {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end("<h1>Authorization successful!</h1><p>You can close this tab.</p>");
          server.close();

          try {
            const { tokens } = await oAuth2Client.getToken(code);
            oAuth2Client.setCredentials(tokens);
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
            console.log("Token saved to", TOKEN_PATH);
            resolve(oAuth2Client);
          } catch (err) {
            reject(err);
          }
        } else {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end("<h1>Authorization failed</h1><p>No code received.</p>");
          server.close();
          reject(new Error("No authorization code received"));
        }
      }
    });

    server.listen(3000, () => {
      console.log("Waiting for authorization on http://localhost:3000...");
    });

    setTimeout(() => {
      server.close();
      reject(new Error("Authorization timed out after 120 seconds"));
    }, 120000);
  });
}

authorize()
  .then(() => {
    console.log("Google authorization complete (Gmail + Calendar).");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Authorization failed:", err.message);
    process.exit(1);
  });
