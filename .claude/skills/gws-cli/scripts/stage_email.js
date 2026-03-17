/**
 * stage_email.js
 *
 * Creates a Gmail draft and adds it to the local staging manifest.
 * Input: JSON on stdin with to, subject, body (or html), and prospect metadata.
 * Output: Draft ID and confirmation.
 *
 * Usage:
 *   echo '{"to":"x@y.com","subject":"Hi","body":"Hello","prospect":"business-name","template":"CI1","scheduledDate":"2026-03-19","niche":"restaurant","city":"Greensburg, IN"}' | node stage_email.js
 *
 * The script:
 *   1. Builds the MIME message
 *   2. Creates a Gmail draft via gws cli
 *   3. Appends to the staging manifest at sales/lead-generation/staged-emails.json
 */

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const MANIFEST_PATH = path.resolve(__dirname, "../../../sales/lead-generation/staged-emails.json");

function buildRawMessage({ to, cc, from, subject, body, html, inReplyTo, references }) {
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

function loadManifest() {
  if (fs.existsSync(MANIFEST_PATH)) {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  }
  return { staged: [] };
}

function saveManifest(manifest) {
  const dir = path.dirname(MANIFEST_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
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

  // Build MIME
  const raw = buildRawMessage(input);

  // Create Gmail draft via gws cli
  const draftJson = JSON.stringify({ message: { raw } });
  const gwsArgs = ["gmail", "users", "drafts", "create", "--params", '{"userId":"me"}', "--json", draftJson];
  const result = process.platform === "win32"
    ? execFileSync("cmd", ["/c", "gws", ...gwsArgs], { encoding: "utf8" })
    : execFileSync("gws", gwsArgs, { encoding: "utf8" });

  const draft = JSON.parse(result);
  const draftId = draft.id;

  // Add to manifest
  const manifest = loadManifest();
  manifest.staged.push({
    draftId,
    to: input.to,
    subject: input.subject,
    prospect: input.prospect || "unknown",
    template: input.template || "unknown",
    scheduledDate: input.scheduledDate || "",
    niche: input.niche || "",
    city: input.city || "",
    stagedAt: new Date().toISOString(),
  });
  saveManifest(manifest);

  console.log(JSON.stringify({
    status: "staged",
    draftId,
    to: input.to,
    subject: input.subject,
    prospect: input.prospect,
    template: input.template,
    totalStaged: manifest.staged.length,
  }, null, 2));
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
