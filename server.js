const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID2;
const CLIENT_SECRET = process.env.CLIENT_SECRET2;
const REDIRECT_URI = process.env.REDIRECT_URI2;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function createTransport() {
  const accessToken = await oAuth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: 'abhishek.916221@gmail.com',
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });
}

async function sendMail(userEmail, startDateTime, userName, doctorName, url) {
  try {
    const transport = await createTransport();

    const mailOptions = {
      from: 'MeetMyDoc <meeymydoc100@gmail.com>',
      to: userEmail,
      subject: 'New Appointment Booking',
      text: `Hello, \n\nYou have a new appointment scheduled.\n\nPatient Name: ${userName}\nDoctor Name: Dr. ${doctorName}\nAppointment Date: ${startDateTime}\n\nBest regards,\nMeetMyDoc Team`,
      html: `
        <h1>Dear ${userName},</h1>
        <p>We are pleased to inform your that your new appointment has been booked.</p>
        <p><strong>Doctor Name:</strong> Dr. ${doctorName}</p>
        <p><strong>Appointment Date:</strong> ${startDateTime}</p>
        <p><strong>Join Link:</strong> <a href="${url}">${url}</a></p>
        <p>Please be prepared for the consultation and let us know if you have any questions.</p>
        <p>Best regards,</p>
        <p>MeetMyDoc Team</p>
      `,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Error sending email to user:', error);
    throw error;
  }
}

async function sendMailToDoctor(doctorEmail, startDateTime, userName, doctorName, url) {
  try {
    const transport = await createTransport();

    const mailOptions = {
      from: 'MeetMyDoc <meeymydoc100@gmail.com>',
      to: doctorEmail,
      subject: 'New Appointment Booking',
      text: `Hello, \n\nYou have a new appointment scheduled.\n\nPatient Name: ${userName}\nDoctor Name: Dr. ${doctorName}\nAppointment Date: ${startDateTime}\n\nBest regards,\nMeetMyDoc Team`,
      html: `
        <h1>Dear Dr. ${doctorName},</h1>
        <p>We are pleased to inform you that a new appointment has been booked.</p>
        <p><strong>Patient Name:</strong> ${userName}</p>
        <p><strong>Appointment Date:</strong> ${startDateTime}</p>
        <p><strong>Join Link:</strong> <a href="${url}">${url}</a></p>
        <p>Please be prepared for the consultation and let us know if you have any questions.</p>
        <p>Best regards,</p>
        <p>MeetMyDoc Team</p>
      `,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Error sending email to doctor:', error);
    throw error;
  }
}

module.exports = { sendMail, sendMailToDoctor };
