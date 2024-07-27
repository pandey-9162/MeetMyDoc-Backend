const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/authMiddleware');  // Middleware to authenticate the user

// Get appointments
router.get('/api/appointments', auth, [
  check('_id', 'User ID is required').not().isEmpty(),
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { _id } = req.query;

  try {
    // Fetch appointments
    const appointments = await Meeting.find({ user: _id }).populate('doctor').populate('user');

    if (!appointments.length) {
      return res.status(404).json({ message: 'No appointments found' });
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

module.exports = router;
