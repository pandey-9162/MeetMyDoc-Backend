const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
    {
        name: { type: String, required: true,},
        email: { type: String, required: true, },
        speciality: { type: String, required: true,},
        experinence: { type: String, required: true, },
        rating: {type:String,},
        about: String,
        availableSlots: [String],
        photo: String
    }
);

const Doctor = mongoose.model("Doctor",doctorSchema);

module.exports = Doctor;