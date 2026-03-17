/**
 * build_raw_email.js
 *
 * Builds an RFC 2822 MIME message and outputs JSON for gws gmail users messages send.
 * No googleapis dependency -- just MIME construction.
 *
 * Usage:
 *   echo '{"to":"x@y.com","subject":"Hi","body":"Hello"}' | node build_raw_email.js
 *   -> outputs: {"raw":"<base64url>"}  (pipe to gws gmail users messages send --json @-)
 *
 *   With threadId:
 *   echo '{"to":"x@y.com","subject":"Re: Hi","html":"<p>Reply</p>","threadId":"abc"}' | node build_raw_email.js
 *   -> outputs: {"raw":"<base64url>","threadId":"abc"}
 */

const fs = require("fs");
const path = require("path");

function buildRawMessage({ to, cc, from, subject, body, html, attachments, inReplyTo, references }) {
  if (attachments && attachments.length > 0) {
    const boundary = "boundary_" + Date.now();
    const contentType = html ? 'text/html; charset="UTF-8"' : 'text/plain; charset="UTF-8"';
    const lines = [
      from ? `From: ${from}` : null,
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
      const base64Data = fileData.toString("base64").replace(/.{76}/g, "$&\r\n");
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
    from ? `From: ${from}` : null,
    `To: ${to}`,
    cc ? `Cc: ${cc}` : null,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: ${contentType}`,
    inReplyTo ? `In-Reply-To: ${inReplyTo}` : null,
    references ? `References: ${references}` : null,
    "",
    html || body,
  ].filter(line => line !== null);

  return Buffer.from(lines.join("\r\n")).toString("base64url");
}

async function main() {
  const chunks = [];
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const input = JSON.parse(chunks.join(""));

  if (!input.to || !input.subject || (!input.body && !input.html)) {
    console.error("Required: to, subject, body or html");
    process.exit(1);
  }

  const raw = buildRawMessage(input);
  const output = { raw };
  if (input.threadId) output.threadId = input.threadId;

  console.log(JSON.stringify(output));
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
