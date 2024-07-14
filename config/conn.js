const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const url = process.env.DB_URL;
const connectDB = () => {
  try {
    mongoose.connect(url
    );
    console.log('MongoDB connected');
  }
  catch(err){
    console.error(err);
    console.log(' MongoDB connection failed');
  }
}

module.exports = connectDB;