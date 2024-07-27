const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorName: {
        type: String,
        required: true,
    },
    doctorContact: {
        type: String,
        required: true,
    },
    medications: [
        {
            name: {
                type: String,
                required: true,
            },
            dosage: {
                type: String,
                required: true,
            },
            instructions: {
                type: String,
                required: true,
            },
        },
    ],
    date: {
        type: Date,
        default: Date.now,
    }
});

const Prescrip= mongoose.model('Prescrip', prescriptionSchema);

module.exports = Prescrip;
