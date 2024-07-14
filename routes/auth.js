const express = require('express');
const { register, login } = require('../controllers/authController');
const User = require('../models/User');
const Doctor = require("../models/Doctor")
const router = express.Router();
router.post('/register', register);
router.post('/login', login);
const basicAuth = require('../middleware/basicAuth');

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


router.get('/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
