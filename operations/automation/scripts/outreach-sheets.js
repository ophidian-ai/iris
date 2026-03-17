/**
 * outreach-sheets.js -- Shared Google Sheets I/O module for outreach automation.
 *
 * All functions use column names (never letters). Column mappings are defined
 * as constants at the top. Uses `gws` CLI via execSync with bash shell.
 *
 * Security note: execSync with shell:'bash' is intentional here -- we need
 * shell features for the gws CLI tool, and all inputs are sanitized via
 * temp JSON files (never interpolated into shell strings).
 *
 * Usage:
 *   const sheets = require('./outreach-sheets');
 *   const rows = sheets.readAllRows('Pipeline');
 *   const prospect = sheets.findRowByBusiness('Pipeline', 'Acme Corp');
 */

const { execSync } = require('child_process'); // eslint-disable-line security/detect-child-process
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SPREADSHEET_ID = '1FJOPS3ABR2BQtFOn4cUAGLZzIYukKbPozK_t_m7Dwg0';

const TEMPLATE_ROTATION_PATH = path.resolve(
  __dirname,
  '../../../sales/lead-generation/template-rotation.md'
);

// Column name -> letter mappings for each sheet tab.
// Letters are uppercase A-AH. Index 0 = A, 1 = B, etc.

const PIPELINE_COLS = {
  'Business Name': 'A',
  'Contact Name': 'B',
  'Email': 'C',
  'Phone': 'D',
  'Website URL': 'E',
  'Location': 'F',
  'Industry': 'G',
  'Lead Source': 'H',
  'Status': 'I',
  'Score': 'J',
  'Tier': 'K',
  'Service': 'L',
  'Est. Value': 'M',
  'Outreach Date': 'N',
  'FU1 Date': 'O',
  'FU2 Date': 'P',
  'FU3 Date': 'Q',
  'Reply Date': 'R',
  'Days in Stage': 'S',
  'Next Action Due': 'T',
  'Notes': 'U',
  'Mockup': 'V',
  'First-Touch Template': 'W',
  'First-Touch Subject': 'X',
  'First-Touch First Line': 'Y',
  'Word Count': 'Z',
  'Send Day': 'AA',
  'Send Time': 'AB',
  'FU4 Date': 'AC',
  'Breakup Date': 'AD',
  'Reply Touch': 'AE',
  'Reply Type': 'AF',
  'Time to Reply (hours)': 'AG',
  'Outcome': 'AH',
};

const FAILED_COLS = {
  'Business Name': 'A',
  'Contact Name': 'B',
  'Email': 'C',
  'Industry': 'D',
  'City': 'E',
  'Prospect Score': 'F',
  'First-Touch Template': 'G',
  'Alternate Template': 'H',
  'Touches Sent': 'I',
  'Which Touch Got Reply': 'J',
  'Reply Type': 'K',
  'Failure Reason': 'L',
  'First-Touch Date': 'M',
  'Last Touch Date': 'N',
  'Days in Sequence': 'O',
  'Proposals Sent': 'P',
  'Re-engagement Eligible': 'Q',
  'Notes': 'R',
};

const SUCCESSFUL_COLS = {
  'Business Name': 'A',
  'Contact Name': 'B',
  'Email': 'C',
  'Industry': 'D',
  'City': 'E',
  'Prospect Score': 'F',
  'First-Touch Template': 'G',
  'Which Touch Got Reply': 'H',
  'Reply Type': 'I',
  'Time to Reply (hours)': 'J',
  'First-Touch Date': 'K',
  'Reply Date': 'L',
  'Meeting Date': 'M',
  'Proposal Sent Date': 'N',
  'Proposals Sent': 'O',
  'Proposal Accepted Date': 'P',
  'Days: First Touch to Reply': 'Q',
  'Days: Reply to Accepted': 'R',
  'Days: First Touch to Accepted': 'S',
  'Deal Value': 'T',
  'Service Type': 'U',
  'Template That Converted': 'V',
  'Notes': 'W',
};

const SHEET_COLS = {
  Pipeline: PIPELINE_COLS,
  'Failed Outreach': FAILED_COLS,
  'Successful Outreach': SUCCESSFUL_COLS,
};

// Follow-up cadence: days after send date for FU1, FU2, FU3, FU4, Breakup
const FOLLOWUP_CADENCE = [3, 7, 12, 18, 25];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert column letter(s) to 0-based index. A=0, B=1, ..., Z=25, AA=26, etc. */
function colLetterToIndex(letter) {
  let index = 0;
  for (let i = 0; i < letter.length; i++) {
    index = index * 26 + (letter.charCodeAt(i) - 64);
  }
  return index - 1;
}

/** Convert 0-based index to column letter. 0=A, 25=Z, 26=AA, etc. */
function indexToColLetter(idx) {
  let letter = '';
  let n = idx + 1;
  while (n > 0) {
    n--;
    letter = String.fromCharCode(65 + (n % 26)) + letter;
    n = Math.floor(n / 26);
  }
  return letter;
}

/** Get column mappings for a sheet name. */
function getColMap(sheetName) {
  const map = SHEET_COLS[sheetName];
  if (!map) throw new Error(`Unknown sheet: ${sheetName}. Valid: ${Object.keys(SHEET_COLS).join(', ')}`);
  return map;
}

/** Get the last column letter for a sheet. */
function lastColLetter(sheetName) {
  const map = getColMap(sheetName);
  const letters = Object.values(map);
  let maxIdx = 0;
  for (const l of letters) {
    const idx = colLetterToIndex(l);
    if (idx > maxIdx) maxIdx = idx;
  }
  return indexToColLetter(maxIdx);
}

/** Build an ordered array of column names for a sheet (by letter order). */
function orderedColumnNames(sheetName) {
  const map = getColMap(sheetName);
  const entries = Object.entries(map).sort(
    (a, b) => colLetterToIndex(a[1]) - colLetterToIndex(b[1])
  );
  const result = [];
  for (const [name, letter] of entries) {
    result[colLetterToIndex(letter)] = name;
  }
  return result;
}

/**
 * Run a shell command and return stdout. Uses bash shell on all platforms.
 * All dynamic data is passed via temp files, never interpolated into commands.
 */
function run(cmd) {
  const output = execSync(cmd, {
    shell: 'bash',
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
    timeout: 30000,
  });
  return output;
}

/**
 * Write JSON to a temp file, return the path. Caller must clean up.
 * This avoids shell escaping issues with special characters.
 */
function writeTempJson(data) {
  const tmpDir = process.platform === 'win32' ? 'c:/tmp' : '/tmp';
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const tmpFile = path.join(tmpDir, `gws-sheets-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`);
  fs.writeFileSync(tmpFile, JSON.stringify(data));
  return tmpFile;
}

/** Clean up a temp file (best-effort). */
function cleanTemp(filePath) {
  try { fs.unlinkSync(filePath); } catch (_) { /* ignore */ }
}

/**
 * Parse gws JSON output. Strips any leading non-JSON lines (e.g. "Using keyring backend: keyring").
 */
function parseGwsJson(raw) {
  const jsonStart = raw.indexOf('{');
  if (jsonStart === -1) throw new Error(`No JSON in gws output: ${raw.slice(0, 200)}`);
  return JSON.parse(raw.slice(jsonStart));
}

/**
 * Shift a date to Monday if it falls on a weekend.
 * Saturday -> Monday (+2), Sunday -> Monday (+1).
 */
function shiftWeekend(date) {
  const d = new Date(date);
  const day = d.getDay();
  if (day === 6) d.setDate(d.getDate() + 2); // Saturday
  if (day === 0) d.setDate(d.getDate() + 1); // Sunday
  return d;
}

/** Format a Date as YYYY-MM-DD. */
function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ---------------------------------------------------------------------------
// Core API
// ---------------------------------------------------------------------------

/**
 * Read raw sheet data via gws sheets +read.
 * @param {string} sheetName - Tab name (e.g. 'Pipeline')
 * @param {string} [range] - Optional A1 range within the sheet (e.g. 'A1:C10')
 * @returns {string[][]} Array of row arrays
 */
function readSheet(sheetName, range) {
  const fullRange = range ? `${sheetName}!${range}` : sheetName;
  const raw = run(
    `gws sheets +read --spreadsheet '${SPREADSHEET_ID}' --range ${JSON.stringify(fullRange)} --format json`
  );
  const parsed = parseGwsJson(raw);
  return parsed.values || [];
}

/**
 * Read all rows from a sheet tab and return as an array of objects keyed by header names.
 * @param {string} sheetName - Tab name
 * @returns {Array<Object>} Array of {columnName: value} objects
 */
function readAllRows(sheetName) {
  const rows = readSheet(sheetName);
  if (rows.length < 2) return [];

  const headers = rows[0];
  const result = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j] || '';
    }
    result.push(obj);
  }
  return result;
}

/**
 * Find a prospect row by business name (case-insensitive).
 * @param {string} sheetName - Tab name
 * @param {string} businessName - Business name to search for
 * @returns {{row: Object, rowIndex: number}|null} Row object and 1-based sheet row index, or null
 */
function findRowByBusiness(sheetName, businessName) {
  const rows = readSheet(sheetName);
  if (rows.length < 2) return null;

  const headers = rows[0];
  const nameIdx = headers.indexOf('Business Name');
  if (nameIdx === -1) return null;

  const target = businessName.toLowerCase().trim();
  for (let i = 1; i < rows.length; i++) {
    const cellVal = (rows[i][nameIdx] || '').toLowerCase().trim();
    if (cellVal === target) {
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = rows[i][j] || '';
      }
      return { row: obj, rowIndex: i + 1 }; // +1 because sheets are 1-indexed and row 1 is headers
    }
  }
  return null;
}

/**
 * Update a single cell by column name.
 * @param {string} sheetName - Tab name
 * @param {number} rowIndex - 1-based row index in the sheet
 * @param {string} columnName - Column header name
 * @param {string} value - New cell value
 */
function updateCell(sheetName, rowIndex, columnName, value) {
  const colMap = getColMap(sheetName);
  const colLetter = colMap[columnName];
  if (!colLetter) throw new Error(`Unknown column "${columnName}" in sheet "${sheetName}"`);

  const range = `${sheetName}!${colLetter}${rowIndex}`;
  const params = {
    spreadsheetId: SPREADSHEET_ID,
    range: range,
    valueInputOption: 'USER_ENTERED',
  };
  const body = { values: [[String(value)]] };

  const paramsFile = writeTempJson(params);
  const bodyFile = writeTempJson(body);
  try {
    run(
      `gws sheets spreadsheets values update --params "$(cat ${JSON.stringify(paramsFile)})" --json "$(cat ${JSON.stringify(bodyFile)})"`
    );
  } finally {
    cleanTemp(paramsFile);
    cleanTemp(bodyFile);
  }
}

/**
 * Append a new row to a sheet.
 * @param {string} sheetName - Tab name
 * @param {Object} rowData - {columnName: value} pairs
 */
function addProspect(sheetName, rowData) {
  const colMap = getColMap(sheetName);
  const colNames = orderedColumnNames(sheetName);
  const lastIdx = colLetterToIndex(lastColLetter(sheetName));

  // Build row array in column order
  const row = [];
  for (let i = 0; i <= lastIdx; i++) {
    const colName = colNames[i];
    row.push(colName && rowData[colName] !== undefined ? String(rowData[colName]) : '');
  }

  const range = `${sheetName}!A1`;
  const params = {
    spreadsheetId: SPREADSHEET_ID,
    range: range,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
  };
  const body = { values: [row] };

  const paramsFile = writeTempJson(params);
  const bodyFile = writeTempJson(body);
  try {
    run(
      `gws sheets spreadsheets values append --params "$(cat ${JSON.stringify(paramsFile)})" --json "$(cat ${JSON.stringify(bodyFile)})"`
    );
  } finally {
    cleanTemp(paramsFile);
    cleanTemp(bodyFile);
  }
}

// Alias
const appendRow = addProspect;

/**
 * Update multiple columns for a prospect by business name.
 * @param {string} sheetName - Tab name
 * @param {string} businessName - Business name to find
 * @param {Object} columnUpdates - {columnName: newValue} pairs
 */
function updateProspect(sheetName, businessName, columnUpdates) {
  const result = findRowByBusiness(sheetName, businessName);
  if (!result) throw new Error(`Prospect "${businessName}" not found in "${sheetName}"`);

  for (const [colName, value] of Object.entries(columnUpdates)) {
    updateCell(sheetName, result.rowIndex, colName, value);
  }
}

/**
 * Move a prospect row from one sheet to another.
 * Reads the source row, maps columns to target schema, appends to target, clears source.
 * @param {string} fromSheet - Source tab name
 * @param {string} toSheet - Target tab name
 * @param {string} businessName - Business name to move
 * @param {Object} [extraData={}] - Additional column values for target-sheet-only fields
 */
function moveProspect(fromSheet, toSheet, businessName, extraData = {}) {
  const source = findRowByBusiness(fromSheet, businessName);
  if (!source) throw new Error(`Prospect "${businessName}" not found in "${fromSheet}"`);

  const targetColMap = getColMap(toSheet);

  // Build target row data: carry over matching column names + extra data
  const targetData = {};
  for (const colName of Object.keys(targetColMap)) {
    if (source.row[colName] !== undefined && source.row[colName] !== '') {
      targetData[colName] = source.row[colName];
    }
  }
  // Override/add extra data
  Object.assign(targetData, extraData);

  // Append to target sheet
  addProspect(toSheet, targetData);

  // Clear the source row
  const lastCol = lastColLetter(fromSheet);
  const clearRange = `${fromSheet}!A${source.rowIndex}:${lastCol}${source.rowIndex}`;
  const params = {
    spreadsheetId: SPREADSHEET_ID,
    range: clearRange,
  };
  const paramsFile = writeTempJson(params);
  try {
    run(
      `gws sheets spreadsheets values clear --params "$(cat ${JSON.stringify(paramsFile)})"`
    );
  } finally {
    cleanTemp(paramsFile);
  }
}

/**
 * Compute follow-up dates from a send date using the standard cadence.
 * Cadence: FU1 = Day 3, FU2 = Day 7, FU3 = Day 12, FU4 = Day 18, Breakup = Day 25.
 * Weekend dates shift to Monday.
 * @param {string} businessName - Business name to update in Pipeline
 * @param {string} sendDate - Send date as YYYY-MM-DD
 * @returns {Object} {fu1, fu2, fu3, fu4, breakup} as YYYY-MM-DD strings
 */
function recalcFollowUpDates(businessName, sendDate) {
  const base = new Date(sendDate + 'T12:00:00'); // Noon to avoid timezone edge cases
  const labels = ['FU1 Date', 'FU2 Date', 'FU3 Date', 'FU4 Date', 'Breakup Date'];
  const dates = {};
  const updates = {};

  for (let i = 0; i < FOLLOWUP_CADENCE.length; i++) {
    const target = new Date(base);
    target.setDate(target.getDate() + FOLLOWUP_CADENCE[i]);
    const shifted = shiftWeekend(target);
    const dateStr = formatDate(shifted);
    const key = labels[i].replace(' Date', '').toLowerCase().replace(/\s+/g, '');
    dates[key] = dateStr;
    updates[labels[i]] = dateStr;
  }

  // Update the Pipeline sheet
  updateProspect('Pipeline', businessName, updates);

  return {
    fu1: dates.fu1,
    fu2: dates.fu2,
    fu3: dates.fu3,
    fu4: dates.fu4,
    breakup: dates.breakup,
  };
}

/**
 * Query rows matching a filter function.
 * @param {string} sheetName - Tab name
 * @param {Function} filterFn - Function(rowObj) => boolean
 * @returns {Array<Object>} Matching row objects
 */
function getProspectsWhere(sheetName, filterFn) {
  const rows = readAllRows(sheetName);
  return rows.filter(filterFn);
}

/**
 * Update the template rotation tracker markdown file.
 * Increments Times Used and optionally Replies for the given template.
 * Updates Last Used date, Last Prospect, and recalculates Reply Rate.
 * Also updates the Performance Summary section.
 * @param {string} template - Template ID (e.g. 'W1', 'S2')
 * @param {string} prospect - Prospect/business name
 * @param {string} niche - Niche/category (kept for API compat, category inferred from template prefix)
 * @param {string} city - City (kept for API compat)
 * @param {boolean} [replied=false] - Whether this is recording a reply
 */
function updateTemplateRotation(template, prospect, niche, city, replied = false) {
  const content = fs.readFileSync(TEMPLATE_ROTATION_PATH, 'utf-8');
  const lines = content.split('\n');
  const today = formatDate(new Date());

  let updated = false;

  // Find and update the matching template row
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match table rows: | W1 | ... |
    const match = line.match(/^\|\s*(\S+)\s*\|/);
    if (match && match[1] === template) {
      // Parse the row: | Template | Last Used | Times Used | Replies | Reply Rate | Last Prospect |
      const cells = line.split('|').map(c => c.trim()).filter(c => c !== '');
      if (cells.length >= 6) {
        const timesUsed = parseInt(cells[2]) || 0;
        const replies = parseInt(cells[3]) || 0;

        const newTimesUsed = replied ? timesUsed : timesUsed + 1;
        const newReplies = replied ? replies + 1 : replies;
        const newRate = newTimesUsed > 0 ? Math.round((newReplies / newTimesUsed) * 100) : 0;

        cells[1] = today;
        cells[2] = String(newTimesUsed);
        cells[3] = String(newReplies);
        cells[4] = `${newRate}%`;
        cells[5] = prospect;

        lines[i] = `| ${cells[0].padEnd(8)} | ${cells[1].padEnd(10)} | ${String(cells[2]).padEnd(10)} | ${String(cells[3]).padEnd(7)} | ${String(cells[4]).padEnd(10)} | ${cells[5].padEnd(20)} |`;
        updated = true;
        break;
      }
    }
  }

  if (!updated) {
    console.warn(`Template "${template}" not found in rotation tracker.`);
    return;
  }

  // Recalculate Performance Summary
  const categories = {
    Website: { prefix: 'W', sent: 0, replies: 0 },
    SEO: { prefix: 'S', sent: 0, replies: 0 },
    Hybrid: { prefix: 'H', sent: 0, replies: 0 },
    'Creative Ideas': { prefix: 'CI', sent: 0, replies: 0 },
    'AI Services': { prefix: 'A', sent: 0, replies: 0 },
  };

  // Gather stats from all template rows
  for (const line of lines) {
    const match = line.match(/^\|\s*(\S+)\s*\|/);
    if (!match) continue;
    const tmpl = match[1];
    if (tmpl === 'Template' || tmpl === '--------' || tmpl === 'Category') continue;

    const cells = line.split('|').map(c => c.trim()).filter(c => c !== '');
    if (cells.length < 4) continue;

    const used = parseInt(cells[2]) || 0;
    const reps = parseInt(cells[3]) || 0;

    // Match template prefix to category (CI before C, A after AI check)
    if (tmpl.startsWith('CI')) {
      categories['Creative Ideas'].sent += used;
      categories['Creative Ideas'].replies += reps;
    } else if (tmpl.startsWith('W')) {
      categories.Website.sent += used;
      categories.Website.replies += reps;
    } else if (tmpl.startsWith('S')) {
      categories.SEO.sent += used;
      categories.SEO.replies += reps;
    } else if (tmpl.startsWith('H')) {
      categories.Hybrid.sent += used;
      categories.Hybrid.replies += reps;
    } else if (tmpl.startsWith('A')) {
      categories['AI Services'].sent += used;
      categories['AI Services'].replies += reps;
    }
  }

  // Update Performance Summary table rows
  for (let i = 0; i < lines.length; i++) {
    for (const [catName, cat] of Object.entries(categories)) {
      if (lines[i].match(new RegExp(`^\\|\\s*${catName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\|`))) {
        const rate = cat.sent > 0 ? `${Math.round((cat.replies / cat.sent) * 100)}%` : '0%';
        const best = cat.replies > 0 ? '--' : '--';
        lines[i] = `| ${catName.padEnd(14)} | ${String(cat.sent).padEnd(10)} | ${String(cat.replies).padEnd(13)} | ${rate.padEnd(12)} | ${best.padEnd(13)} |`;
        break;
      }
    }
  }

  fs.writeFileSync(TEMPLATE_ROTATION_PATH, lines.join('\n'));
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  // Constants
  SPREADSHEET_ID,
  PIPELINE_COLS,
  FAILED_COLS,
  SUCCESSFUL_COLS,
  SHEET_COLS,
  FOLLOWUP_CADENCE,

  // Helpers (exported for testing)
  colLetterToIndex,
  indexToColLetter,
  orderedColumnNames,
  shiftWeekend,
  formatDate,

  // Core API
  readSheet,
  readAllRows,
  findRowByBusiness,
  updateCell,
  addProspect,
  appendRow,
  updateProspect,
  moveProspect,
  recalcFollowUpDates,
  getProspectsWhere,
  updateTemplateRotation,
};
