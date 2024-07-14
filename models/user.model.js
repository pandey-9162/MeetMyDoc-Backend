
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password :{
        type:String,
        required:true
    },
    phone :{
        type:Number
    },
    address :{
        type:String
    },
});

const UserDb = mongoose.model("UserDb",userSchema);
module.exports = UserDb;