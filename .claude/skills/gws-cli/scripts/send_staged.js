/**
 * send_staged.js
 *
 * Sends all staged cold email drafts from the manifest with spacing between sends.
 * Reads sales/lead-generation/staged-emails.json, sends each draft, and clears the manifest.
 *
 * Usage:
 *   node send_staged.js                  # Send all staged emails (5min spacing)
 *   node send_staged.js --spacing 300    # Custom spacing in seconds
 *   node send_staged.js --dry-run        # Show what would be sent without sending
 *   node send_staged.js --list           # List staged emails without sending
 */

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const MANIFEST_PATH = path.resolve(__dirname, "../../../sales/lead-generation/staged-emails.json");
const DEFAULT_SPACING_SEC = 300; // 5 minutes

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return { staged: [] };
  }
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
}

function saveManifest(manifest) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { dryRun: false, list: false, spacing: DEFAULT_SPACING_SEC };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--dry-run") opts.dryRun = true;
    if (args[i] === "--list") opts.list = true;
    if (args[i] === "--spacing" && args[i + 1]) {
      opts.spacing = parseInt(args[i + 1], 10);
      i++;
    }
  }
  return opts;
}

async function main() {
  const opts = parseArgs();
  const manifest = loadManifest();

  if (manifest.staged.length === 0) {
    console.log("No staged emails to send.");
    return;
  }

  // List mode
  if (opts.list) {
    console.log(`\n${manifest.staged.length} staged email(s):\n`);
    for (const entry of manifest.staged) {
      console.log(`  [${entry.template}] ${entry.prospect} -> ${entry.to}`);
      console.log(`        Subject: ${entry.subject}`);
      console.log(`        Staged: ${entry.stagedAt}`);
      console.log(`        Draft ID: ${entry.draftId}\n`);
    }
    return;
  }

  // Dry run mode
  if (opts.dryRun) {
    console.log(`\nDRY RUN -- would send ${manifest.staged.length} email(s) with ${opts.spacing}s spacing:\n`);
    for (const entry of manifest.staged) {
      console.log(`  [${entry.template}] ${entry.prospect} -> ${entry.to} -- "${entry.subject}"`);
    }
    console.log(`\nEstimated time: ${Math.round((manifest.staged.length - 1) * opts.spacing / 60)} minutes`);
    return;
  }

  // Send mode
  console.log(`Sending ${manifest.staged.length} staged email(s) with ${opts.spacing}s spacing...\n`);
  const sent = [];
  const failed = [];

  for (let i = 0; i < manifest.staged.length; i++) {
    const entry = manifest.staged[i];

    // Wait between sends (not before the first one)
    if (i > 0) {
      console.log(`  Waiting ${opts.spacing}s before next send...`);
      await sleep(opts.spacing * 1000);
    }

    try {
      const sendJson = JSON.stringify({ id: entry.draftId });
      const paramsJson = '{"userId":"me"}';
      // Use shell with single-quoted JSON to prevent shell interpretation
      const cmd = `gws gmail users drafts send --params '${paramsJson}' --json '${sendJson}'`;
      execFileSync("bash", ["-c", cmd], { encoding: "utf8" });

      console.log(`  SENT [${entry.template}] ${entry.prospect} -> ${entry.to}`);
      sent.push(entry);
    } catch (err) {
      console.error(`  FAILED [${entry.template}] ${entry.prospect} -> ${entry.to}: ${err.message}`);
      failed.push(entry);
    }
  }

  // Update manifest -- only keep failed ones for retry
  manifest.staged = failed;
  saveManifest(manifest);

  console.log(`\nDone. Sent: ${sent.length}, Failed: ${failed.length}`);

  if (sent.length > 0) {
    console.log("\nSent emails:");
    for (const entry of sent) {
      console.log(`  [${entry.template}] ${entry.prospect} -> ${entry.to}`);
    }
  }

  if (failed.length > 0) {
    console.log("\nFailed emails (still in manifest for retry):");
    for (const entry of failed) {
      console.log(`  [${entry.template}] ${entry.prospect} -> ${entry.to}`);
    }
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
