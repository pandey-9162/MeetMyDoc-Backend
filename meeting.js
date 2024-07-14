const fs = require('fs');
const { google } = require('googleapis');
const opn = require('opn');
const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];
const TOKEN_PATH = process.env.TOKEN_PATH;
const dotenv = require("dotenv");
dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
        // process.env.CLIENT_ID,
        // process.env.CLIENT_SECRET,
        // process.env.REDIRECT_URI
);

function authorize() {
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken();
        oAuth2Client.setCredentials(JSON.parse(token));

        // Add event listener for token refresh
        oAuth2Client.on('tokens', (tokens) => {
            if (tokens.refresh_token) {
                // Store the refresh token in your database or file
                console.log('Refresh token:', tokens.refresh_token);
                fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
            }
            console.log('Access token:', tokens.access_token);
        });
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

function createEvent(eventDetails, callback) {
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    const event = {
        summary: eventDetails.summary,
        location: eventDetails.location,
        description: eventDetails.description,
        start: {
            dateTime: eventDetails.start.dateTime,
            timeZone: eventDetails.start.timeZone,
        },
        end: {
            dateTime: eventDetails.end.dateTime,
            timeZone: eventDetails.end.timeZone,
        },
        attendees: eventDetails.attendees,
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
                requestId: 'meetmydoc-meeting',
            },
        },
    };

    calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
    }, (err, event) => {
        if (err) {
            console.error('There was an error creating the calendar event:', err);
            return callback(err);  // Pass error to the callback
        }
        console.log('Event created: %s', event.data.htmlLink);
        callback(null, event);  // Pass event data to the callback
    });
}

module.exports = {
    authorize,
    createEvent,
    oAuth2Client,
};