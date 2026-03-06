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

async function createEvent(eventData) {
  const auth = getAuth();
  const calendar = google.calendar({ version: "v3", auth });

  const event = {
    summary: eventData.summary,
    description: eventData.description || "",
    location: eventData.location || "",
    start: eventData.allDay
      ? { date: eventData.start }
      : { dateTime: eventData.start, timeZone: eventData.timeZone || "America/New_York" },
    end: eventData.allDay
      ? { date: eventData.end }
      : { dateTime: eventData.end, timeZone: eventData.timeZone || "America/New_York" },
    attendees: (eventData.attendees || []).map((email) => ({ email })),
    reminders: eventData.reminders || {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: 1440 },
        { method: "popup", minutes: 120 },
      ],
    },
  };

  if (eventData.recurrence) {
    event.recurrence = eventData.recurrence;
  }

  const res = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event,
    sendUpdates: eventData.sendInvites ? "all" : "none",
  });

  console.log(
    JSON.stringify(
      {
        success: true,
        id: res.data.id,
        htmlLink: res.data.htmlLink,
        summary: res.data.summary,
        start: res.data.start,
        end: res.data.end,
      },
      null,
      2
    )
  );
}

// Read event data from stdin or file
async function main() {
  let input;
  const arg = process.argv[2];

  if (arg && fs.existsSync(arg)) {
    input = fs.readFileSync(arg, "utf8");
  } else {
    const chunks = [];
    process.stdin.setEncoding("utf8");
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    input = chunks.join("");
  }

  const eventData = JSON.parse(input);

  if (!eventData.summary || !eventData.start || !eventData.end) {
    console.error("Required fields: summary, start, end");
    console.error("Optional: description, location, attendees, allDay, timeZone, recurrence, sendInvites");
    process.exit(1);
  }

  await createEvent(eventData);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
