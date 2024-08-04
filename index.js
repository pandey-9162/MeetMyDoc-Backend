const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/conn');
const User = require('./models/User');
const cors = require('cors');
const fs = require('fs');
const { authorize, createEvent, oAuth2Client } = require('./meeting');
const Doctor = require('./models/Doctor');
const Meeting = require('./models/Meeting');
const dotenv = require('dotenv');
const { sendMail, sendMailToDoctor } = require('./server'); 
dotenv.config();
const TOKEN_PATH = process.env.TOKEN_PATH;
const app = express();
const port = process.env.PORT;

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(bodyParser.json());

const allowedOrigins = ['https://meetmydoc-vaidya.netlify.app','https://meeturdoc.com'];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable preflight requests for all routes

authorize();

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
  });
});

const userRoute = require('./routes/user');
app.use('/api', userRoute);

app.use('/api', require('./routes/auth'));
app.post('/api/schedule-meeting', async (req, res) => {
  const { userEmail, doctorId, slot } = req.body;

  try {
    if (!userEmail || !doctorId || !slot) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findOne({ email: userEmail });
    const doctor = await Doctor.findById(doctorId);

    if (!user || !doctor) {
      return res.status(404).json({ message: 'User or Doctor not found' });
    }

    const [time, date] = slot.split(' ');
    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60000); // assuming 30 min duration

    const eventDetails = {
      summary: `Appointment with ${doctor.name}`,
      location: 'Google Meet',
      description: `${user.name} has scheduled an appointment with Dr. ${doctor.name}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      attendees: [
        { email: userEmail },
        { email: doctor.email }
      ],
    };

    oAuth2Client.getAccessToken().then(() => {
      createEvent(eventDetails, 
        async (err, event) => {
          if (err) {
            return res.status(500).json({ message: 'Failed to create calendar event', error: err });
          }

          try {
            const newMeeting = new Meeting({
              user: user._id,
              doctor: doctor._id,
              slot,
              eventLink: event.data.htmlLink,
            });

            await newMeeting.save();

            try {
              const doctor = await Doctor.findById(doctorId);
              if (!Array.isArray(doctor.availableSlots)) {
                console.error('availableSlots is not an array or is undefined');
              }
          
              const updatedSlots = doctor.availableSlots.map(s => {
                if (s === slot) {
                  return 'booked';
                }
                return s;
              });
          
              doctor.availableSlots = updatedSlots;
              await doctor.save();
            } catch (error) {
              console.error('Error updating doctor:', error);
            }

            // Send email notifications
            try {
              await sendMail(userEmail, startDateTime, user.name, doctor.name, event.data.htmlLink);
              await sendMailToDoctor(doctor.email, startDateTime, user.name, doctor.name, event.data.htmlLink);
            } catch (emailErr) {
              console.error('Error sending email:', emailErr);
            }

            res.status(200).json({ message: 'Meeting scheduled successfully', eventLink: event.data.htmlLink });
          } catch (saveErr) {
            res.status(500).json({ message: 'Failed to save meeting', error: saveErr });
          }
        });
    }).catch(err => {
      console.error('Error refreshing access token:', err);
      res.status(500).json({ message: 'Failed to refresh access token', error: err });
    });

  } catch (error) {
    console.error('Error scheduling meeting:', error);
    res.status(500).json({ message: 'Failed to schedule meeting', error });
  }
});

// appointment Route
app.get('/api/appointments', async (req, res) => {
  const { userId } = req.query;

  try {
    const appointments = await Meeting.find({ user: userId }).populate('doctor').populate('user');
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`));
