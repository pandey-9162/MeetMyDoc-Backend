const express = require('express');
const { register, login } = require('../controllers/authController');
const User = require('../models/User');
const Doctor = require("../models/Doctor")
const router = express.Router();
router.post('/register', register);
router.post('/login', login);
const basicAuth = require('../middleware/basicAuth');
const Point = require("../models/points");
const Meeting = require('../models/Meeting');
const Prescription = require('../models/prescrip');
const mongoose = require("mongoose");



router.post('/recharge', basicAuth, async (req, res) => {
  const { userId, amount } = req.body;
  
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const creditsToAdd = Math.floor(amount / 100); // 1 credit = 100 INR
    user.credits += creditsToAdd;

    await user.save();
    res.json({ credits: user.credits });
  } catch (error) {
    console.error('Error processing recharge:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/point',basicAuth, async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const point = await Point.findOne({ user: userId });

    if (!point) {
      return res.status(404).json({ message: 'Point document not found' });
    }

    res.status(200).json({
      credit: point.credit,
      last_recharge: point.last_recharge
    });
  } catch (error) {
    console.error('Error fetching point:', error);
    res.status(500).json({ message: 'Failed to fetch point' });
  }
});

router.get('/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/appointments', basicAuth, async (req, res) => {
  const { userId } = req.query;
  try {
    const appointments = await Meeting.find({ user: userId }).populate('doctor').populate('user');
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

router.get('/prescription', basicAuth, async (req, res) => {
  const userId = req.query.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid userId' });
}
  if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
  }

  try {
      const prescription = await Prescription.findOne({ userId });

      if (!prescription) {
          return res.status(404).json({ message: 'No prescription found for this user' });
          // console.log("No data");
        }

      res.json(prescription);
  } catch (error) {
      console.error('Error fetching prescription:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
