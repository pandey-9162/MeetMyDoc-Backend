const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is require"],
  },
  email: {
    type: String,
    required: [true, "email is require"],
  },
  password: {
    type: String,
    required: [true, "password is require"],
  },
  mobile_no: {
    type: Number,
    default: 0
  },
  age:{
    type:Number
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;


