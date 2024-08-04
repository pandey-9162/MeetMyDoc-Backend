// middleware/basicAuth.js
const User = require('../models/User');

const basicAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ msg: 'Authorization header missing or malformed' });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [email, password] = credentials.split(':');

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    };

    const isMatch = (password === user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    req.user = user; 
    next();
  } catch (error) {
    console.error('Error in Basic Auth middleware:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};
module.exports = basicAuth;
