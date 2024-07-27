
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    merchantTransactionId: {
      type: String,
      required: true,
      unique: true
    },
    amount: {
      type: Number,
      required: true
    }
  }, { timestamps: true }); 
  
  const Transaction = mongoose.model('Transaction', transactionSchema);
  
  module.exports = Transaction;
  