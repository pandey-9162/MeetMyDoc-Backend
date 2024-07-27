const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PointSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    credit:{
        type: Number,
        default: 0
    },
    last_recharge:{
        type: Date,
        default:null
    }
});

module.exports = mongoose.model('Point', PointSchema);
