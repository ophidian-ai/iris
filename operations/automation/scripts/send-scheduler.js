/**
 * send-scheduler.js -- Automated email sending scheduler for OphidianAI outreach.
 *
 * Runs at 10:00 AM ET weekdays via Windows Task Scheduler. Reads the staged-emails
 * manifest, sends emails scheduled for today, and updates tracking.
 *
 * Policy: Auto-send is intentional. Eric reviews/edits/deletes drafts before 10am.
 * Anything still staged at 10am sends automatically.
 *
 * Security note: execSync with shell:'bash' is intentional here -- we need shell
 * features for the gws CLI tool. Draft IDs come from the staged manifest (written
 * by our own staging script), not from external user input. This matches the
 * pattern used in outreach-sheets.js throughout this codebase.
 *
 * Usage:
 *   node operations/automation/scripts/send-scheduler.js           # Normal run
 *   node operations/automation/scripts/send-scheduler.js --dry-run # Preview only
 */

const { execSync } = require('child_process'); // eslint-disable-line security/detect-child-process
const fs = require('fs');
const path = require('path');

const sheets = require('./outreach-sheets.js');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const MANIFEST_PATH = path.join(PROJECT_ROOT, 'sales', 'lead-generation', 'staged-emails.json');
const LOG_DIR = path.join(PROJECT_ROOT, 'operations', 'automation', 'logs');

const DRY_RUN = process.argv.includes('--dry-run');

// Send spacing: 5 minutes between emails (in ms)
const SEND_INTERVAL_MS = 5 * 60 * 1000;

// Template -> Status mapping
const STATUS_MAP = {
  CI1: 'Email Sent',
  ALT: 'Email Sent',
  FU1: 'FU1 Sent',
  FU2: 'FU2 Sent',
  FU3: 'FU3 Sent',
  FU4: 'FU4 Sent',
  Breakup: 'Breakup Sent',
};

// First-touch templates that trigger follow-up date calculation
const FIRST_TOUCH_TEMPLATES = ['CI1', 'ALT'];

// ---------------------------------------------------------------------------
// Timing helpers (ET timezone)
// ---------------------------------------------------------------------------

function getTodayET() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
}

function getTimeET() {
  return new Date().toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour12: true,
    hour: 'numeric',
    minute: '2-digit',
  }) + ' ET';
}

function getDayET() {
  return new Date().toLocaleDateString('en-US', {
    timeZone: 'America/New_York',
    weekday: 'long',
  });
}

function isoTimestamp() {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

let logStream = null;

function initLog() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
  const logFile = path.join(LOG_DIR, `send-scheduler-${getTodayET()}.log`);
  logStream = fs.createWriteStream(logFile, { flags: 'a' });
}

function log(message) {
  const line = `[${isoTimestamp()}] ${message}`;
  console.log(line);
  if (logStream) {
    logStream.write(line + '\n');
  }
}

function closeLog() {
  if (logStream) {
    logStream.end();
    logStream = null;
  }
}

// ---------------------------------------------------------------------------
// Gmail draft sending via gws CLI
//
// Uses execSync with bash shell, matching the pattern in outreach-sheets.js.
// The draftId is read from our own staged manifest file (not external input).
// ---------------------------------------------------------------------------

function sendDraft(draftId) {
  const paramsJson = JSON.stringify({ userId: 'me' });
  const bodyJson = JSON.stringify({ id: draftId });
  const cmd = `gws gmail users drafts send --params '${paramsJson}' --json '${bodyJson}'`;
  const output = execSync(cmd, {
    shell: 'bash',
    encoding: 'utf8',
    timeout: 30000,
  });
  return output;
}

// ---------------------------------------------------------------------------
// Manifest I/O
// ---------------------------------------------------------------------------

function readManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return null;
  }
  const raw = fs.readFileSync(MANIFEST_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeManifest(manifest) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
}

// ---------------------------------------------------------------------------
// Status resolution
// ---------------------------------------------------------------------------

function resolveStatus(template) {
  // Direct match first
  if (STATUS_MAP[template]) {
    return STATUS_MAP[template];
  }
  // For any other first-touch templates (W1, W2, S1, H1, etc.), treat as "Email Sent"
  return 'Email Sent';
}

function isFirstTouch(template) {
  // CI1 and ALT are explicit first-touch templates
  if (FIRST_TOUCH_TEMPLATES.includes(template)) return true;
  // Any non-FU, non-Breakup template is a first-touch send
  if (!template.startsWith('FU') && template !== 'Breakup') return true;
  return false;
}

// ---------------------------------------------------------------------------
// Sheet update helpers
// ---------------------------------------------------------------------------

function updateSheetAfterSend(entry, todayStr) {
  const { prospect, template, niche, city } = entry;
  const status = resolveStatus(template);
  const sendDay = getDayET();
  const sendTime = getTimeET();

  // Build column updates
  const updates = { Status: status };

  if (isFirstTouch(template)) {
    updates['Outreach Date'] = todayStr;
  }

  updates['Send Day'] = sendDay;
  updates['Send Time'] = sendTime;

  // Update Pipeline sheet
  try {
    sheets.updateProspect('Pipeline', prospect, updates);
    log(`  Sheet updated: ${prospect} -> ${status}`);
  } catch (err) {
    log(`  WARNING: Sheet update failed for ${prospect}: ${err.message}`);
    log(`  (Email was sent successfully -- sheet is out of sync)`);
  }

  // Update template rotation
  try {
    sheets.updateTemplateRotation(template, prospect, niche || '', city || '', false);
    log(`  Template rotation updated: ${template}`);
  } catch (err) {
    log(`  WARNING: Template rotation update failed for ${template}: ${err.message}`);
  }

  // Recalculate follow-up dates for first-touch sends
  if (isFirstTouch(template)) {
    try {
      const fuDates = sheets.recalcFollowUpDates(prospect, todayStr);
      log(`  Follow-up dates set: FU1=${fuDates.fu1}, FU2=${fuDates.fu2}, FU3=${fuDates.fu3}, FU4=${fuDates.fu4}, Breakup=${fuDates.breakup}`);
    } catch (err) {
      log(`  WARNING: Follow-up date calc failed for ${prospect}: ${err.message}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Sleep helper
// ---------------------------------------------------------------------------

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  initLog();

  const todayStr = getTodayET();
  log(`=== Send Scheduler ${DRY_RUN ? '(DRY RUN) ' : ''}started ===`);
  log(`Date: ${todayStr} (${getDayET()}) | Time: ${getTimeET()}`);

  // Read manifest
  const manifest = readManifest();
  if (!manifest) {
    log('No staged emails manifest found. Nothing to send.');
    closeLog();
    return;
  }

  const allEntries = manifest.staged || [];
  if (allEntries.length === 0) {
    log('Manifest is empty. Nothing to send.');
    closeLog();
    return;
  }

  // Filter to today's scheduled emails
  const todaysEntries = allEntries.filter(e => e.scheduledDate === todayStr);
  const futureEntries = allEntries.filter(e => e.scheduledDate !== todayStr);

  log(`Total staged: ${allEntries.length} | Scheduled for today: ${todaysEntries.length} | Future/other: ${futureEntries.length}`);

  if (todaysEntries.length === 0) {
    log('No emails scheduled for today.');
    closeLog();
    return;
  }

  // Process each email
  const sent = [];
  const failed = [];

  for (let i = 0; i < todaysEntries.length; i++) {
    const entry = todaysEntries[i];
    const label = `[${i + 1}/${todaysEntries.length}]`;

    log(`${label} Processing: ${entry.prospect} (${entry.template}) -> ${entry.to}`);
    log(`${label}   Subject: ${entry.subject}`);
    log(`${label}   Draft ID: ${entry.draftId}`);

    if (DRY_RUN) {
      log(`${label}   DRY RUN -- would send draft ${entry.draftId}`);
      log(`${label}   Status would be: ${resolveStatus(entry.template)}`);
      if (isFirstTouch(entry.template)) {
        log(`${label}   Would recalculate follow-up dates`);
      }
      sent.push(entry);
    } else {
      try {
        sendDraft(entry.draftId);
        log(`${label}   SENT successfully`);
        sent.push(entry);

        // Update tracking
        updateSheetAfterSend(entry, todayStr);
      } catch (err) {
        log(`${label}   FAILED: ${err.message}`);
        failed.push(entry);
      }
    }

    // Wait between sends (skip delay after the last one)
    if (!DRY_RUN && i < todaysEntries.length - 1) {
      log(`${label}   Waiting 5 minutes before next send...`);
      await sleep(SEND_INTERVAL_MS);
    }
  }

  // Update manifest: keep future entries + failed entries (for retry)
  const remaining = [...futureEntries, ...failed];

  if (!DRY_RUN) {
    writeManifest({ staged: remaining });
    log(`Manifest updated: ${remaining.length} entries remaining (${futureEntries.length} future + ${failed.length} failed)`);
  }

  // Summary
  log('');
  log('=== Summary ===');
  log(`Sent: ${sent.length}`);
  log(`Failed: ${failed.length}`);
  log(`Remaining in manifest: ${remaining.length}`);

  if (failed.length > 0) {
    log('');
    log('Failed entries (will retry next run):');
    for (const f of failed) {
      log(`  - ${f.prospect} (${f.template}) -> ${f.to}`);
    }
  }

  log(`=== Send Scheduler ${DRY_RUN ? '(DRY RUN) ' : ''}complete ===`);
  closeLog();
}

main().catch(err => {
  log(`FATAL: ${err.message}`);
  log(err.stack);
  closeLog();
  process.exit(1);
});
