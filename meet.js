const fs = require('fs');
const { google } = require('googleapis');
const express = require('express');
const opn = require('open');
const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];
const TOKEN_PATH = process.env.TOKEN_PATH;

const app = express();
const port = process.env.PORT;

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

app.get('/oauth2callback', (req, res) => {
  const code = req.query.code;
  oAuth2Client.getToken(code, (err, token) => {
    if (err) {
      console.error('Error retrieving access token:', err.message);
      return res.status(400).send('Error retrieving access token');
    }
    oAuth2Client.setCredentials(token);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
    res.send('Authorization successful! You can close this tab.');
    createEvent(oAuth2Client);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  authorize();
});

function authorize() {
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken();
    oAuth2Client.setCredentials(JSON.parse(token));
    createEvent(oAuth2Client);
  });
}

function getAccessToken() {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  opn(authUrl, { wait: false });
}

async function createEvent(auth) {
  const calendar = google.calendar({ version: 'v3', auth });

  const attendeesEmails = [
    { email: 'emailofdoctor@gmail.com' },
    { email: 'emailofuser@gmail.com' }
  ];

  // Calculate start and end times dynamically
  const startTime = new Date();
  startTime.setMinutes(startTime.getMinutes() + 5); // Schedule the meeting 5 minutes from now
  const endTime = new Date(startTime.getTime() + 30 * 60000); // End time is 30 minutes after start time

  const event = {
    summary: 'Appointment Booked With Dr. Pandey',
    location: 'Virtual / Google Meet',
    description: 'Pandey Will help you',
    start: {
      dateTime: startTime.toISOString(),
      timeZone: 'Asia/Kolkata',
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: 'Asia/Kolkata',
    },
    attendees: attendeesEmails,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 10 },
      ],
    },
    conferenceData: {
      createRequest: {
        conferenceSolutionKey: {
          type: 'hangoutsMeet',
        },
        requestId: 'coding-calendar-demo',
      },
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
    });

    const { summary, location, start, end, attendees } = response.data;
    const conferenceData = response.data.conferenceData;
    const uri = conferenceData && conferenceData.entryPoints && conferenceData.entryPoints[0] && conferenceData.entryPoints[0].uri;

    console.log(`📅 Calendar event created: ${summary} at ${location}, from ${start.dateTime} to ${end.dateTime}, attendees:\n${attendees.map(person => `🧍 ${person.email}`).join('\n')} \n 💻 Join conference call link: ${uri}`);
    return uri;
  } catch (error) {
    console.error('Error creating calendar event:', error);
  }
}

async function scheduleMeeting(patientId, doctorId) {
    try {
        const auth = await getAuth();
        const id = createEvent(auth);
    } catch (error) {
        console.error('Error scheduling meeting:', error);
        throw error; // Propagate the error back to the caller
    }
}

async function getAuth() {
    const token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
}

module.exports = {
    scheduleMeeting
};
