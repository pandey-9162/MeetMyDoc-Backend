const express = require('express');
const { getUser } = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', auth, getUser);

module.exports = router;
