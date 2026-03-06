const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

const CREDENTIALS_PATH = path.join(__dirname, "../../gmail/scripts/credentials.json");
const TOKEN_PATH = path.join(__dirname, "../../gmail/scripts/token.json");

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

async function listEvents(timeMin, timeMax, maxResults = 20) {
  const auth = getAuth();
  const calendar = google.calendar({ version: "v3", auth });

  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin,
    timeMax,
    maxResults,
    singleEvents: true,
    orderBy: "startTime",
  });

  const events = (res.data.items || []).map((e) => ({
    id: e.id,
    summary: e.summary,
    description: e.description || "",
    start: e.start.dateTime || e.start.date,
    end: e.end.dateTime || e.end.date,
    location: e.location || "",
    status: e.status,
    attendees: (e.attendees || []).map((a) => ({
      email: a.email,
      name: a.displayName || "",
      status: a.responseStatus,
    })),
    htmlLink: e.htmlLink,
  }));

  console.log(JSON.stringify(events, null, 2));
}

// Parse args: [date] or [startDate endDate]
const args = process.argv.slice(2);
let timeMin, timeMax;

if (args.length === 0) {
  // Today
  const now = new Date();
  timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  timeMax = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
} else if (args.length === 1) {
  // Specific date
  const d = new Date(args[0]);
  timeMin = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
  timeMax = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString();
} else {
  // Date range
  timeMin = new Date(args[0]).toISOString();
  timeMax = new Date(args[1]).toISOString();
}

const maxResults = parseInt(process.env.MAX_RESULTS) || 20;
listEvents(timeMin, timeMax, maxResults).catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
