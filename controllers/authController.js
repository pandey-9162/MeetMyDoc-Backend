const User = require('../models/User');
const Point = require('../models/points');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();

const register = async (req, res) => {
  const { name, email, password, mobile_no, age } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
      mobile_no,
      age
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const point = new Point({
      user: user._id,
      credit: 0, 
      last_recharge: null 
    });

    await point.save();

    res.json(user);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send('Server error');
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Incorrect password' });
    }

    res.json(user);
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { register, login };
