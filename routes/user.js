const express = require('express');
const { getUser } = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET api/users
// @desc    Get user
// @access  Private
router.get('/', auth, getUser);

module.exports = router;
