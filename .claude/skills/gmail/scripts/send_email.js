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

function buildRawMessage({ to, cc, subject, body, html, attachments, inReplyTo, references, threadId }) {
  if (attachments && attachments.length > 0) {
    const boundary = "boundary_" + Date.now();
    const contentType = html ? 'text/html; charset="UTF-8"' : 'text/plain; charset="UTF-8"';
    const lines = [
      `To: ${to}`,
      cc ? `Cc: ${cc}` : null,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      inReplyTo ? `In-Reply-To: ${inReplyTo}` : null,
      references ? `References: ${references}` : null,
      "",
      `--${boundary}`,
      `Content-Type: ${contentType}`,
      "",
      html || body,
    ].filter(line => line !== null);

    for (const att of attachments) {
      const fileData = fs.readFileSync(att.path);
      const base64Data = fileData.toString("base64");
      const filename = att.filename || path.basename(att.path);
      const mimeType = att.mimeType || "application/octet-stream";
      lines.push(`--${boundary}`);
      lines.push(`Content-Type: ${mimeType}; name="${filename}"`);
      lines.push(`Content-Disposition: attachment; filename="${filename}"`);
      lines.push(`Content-Transfer-Encoding: base64`);
      lines.push("");
      lines.push(base64Data);
    }
    lines.push(`--${boundary}--`);

    return Buffer.from(lines.join("\r\n")).toString("base64url");
  }

  const contentType = html ? 'text/html; charset="UTF-8"' : 'text/plain; charset="UTF-8"';
  const lines = [
    `To: ${to}`,
    cc ? `Cc: ${cc}` : null,
    `Subject: ${subject}`,
    `Content-Type: ${contentType}`,
    inReplyTo ? `In-Reply-To: ${inReplyTo}` : null,
    references ? `References: ${references}` : null,
    "",
    html || body,
  ].filter(line => line !== null);

  return Buffer.from(lines.join("\r\n")).toString("base64url");
}

async function sendEmail(options) {
  const auth = getAuth();
  const gmail = google.gmail({ version: "v1", auth });

  const raw = buildRawMessage(options);
  const params = { userId: "me", requestBody: { raw } };
  if (options.threadId) params.requestBody.threadId = options.threadId;

  const res = await gmail.users.messages.send(params);
  console.log(JSON.stringify({ success: true, id: res.data.id, threadId: res.data.threadId }));
}

// Read options from JSON on stdin or from a JSON file argument
async function main() {
  let input;
  const arg = process.argv[2];

  if (arg && fs.existsSync(arg)) {
    input = fs.readFileSync(arg, "utf8");
  } else {
    // Read from stdin
    const chunks = [];
    process.stdin.setEncoding("utf8");
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    input = chunks.join("");
  }

  const options = JSON.parse(input);

  if (!options.to || !options.subject || (!options.body && !options.html)) {
    console.error("Required fields: to, subject, body");
    console.error("Optional fields: cc, inReplyTo, references, threadId");
    process.exit(1);
  }

  await sendEmail(options);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
