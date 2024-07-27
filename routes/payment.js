const express = require("express");
const cors = require("cors");
const axios = require("axios");
const sha256 = require("sha256");
const uniqid = require("uniqid");
const router = express.Router();
const basicAuth = require('../middleware/basicAuth');
const  User  = require("../models/User");
const Point = require('../models/points');
const Transaction = require('../models/Transaction');
const app = express();


const getUserIdFromTransactionId = async (merchantTransactionId) => {
  try {
    const transaction = await Transaction.findOne({ merchantTransactionId });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    return transaction.userId;
  } catch (error) {
    console.error('Error retrieving user ID from transaction:', error.message || error);
    throw error;
  }
};
const corsOptions = {
  origin: 'http://localhost:3000', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type, Authorization',
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
router.use(cors(corsOptions));

// const MERCHANT_ID = "PGTESTPAYUAT115";
// const PHONE_PE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
// const SALT_KEY = "f94f0bb9-bcfb-4077-adc0-3f8408a17bf7";
// const APP_BE_URL = "http://localhost:3000";

const generateChecksum = (payload, endpoint) => {
  const string = `${payload}${endpoint}${SALT_KEY}`;
  const sha256_val = sha256(string);
  return `${sha256_val}###1`; 
};


router.post("/pay", basicAuth, async (req, res) => {
  const { userId, amount} = req.body;
  const merchantTransactionId = uniqid();

  // const payload = {
  //   merchantId: MERCHANT_ID,
  //   merchantTransactionId,
  //   merchantUserId: userId,
  //   amount: amount * 100, 
  //   redirectUrl: `${APP_BE_URL}/payment/validate/${merchantTransactionId}`,
  //   redirectMode: "REDIRECT",
  //   mobileNumber: "9999999999",
  //   paymentInstrument: { type: "PAY_PAGE" },
  // };

  const base64EncodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
  const xVerifyChecksum = generateChecksum(base64EncodedPayload, '/pg/v1/pay');

  try {
    const response = await axios.post(
      `${PHONE_PE_HOST_URL}/pg/v1/pay`,
      { request: base64EncodedPayload },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerifyChecksum,
          "accept": "application/json",
        },
      }
    );
    

    if (response.data.success) {
      await Transaction.create({
        userId,
        merchantTransactionId,
        amount
      });

      res.json({ redirectUrl: response.data.data.instrumentResponse.redirectInfo.url });
    } else {
      res.status(400).json({ error: response.data.message });
    }
  } catch (error) {
    console.error("Payment initiation error:", error.message || error);
    res.status(500).send("Payment initiation failed: " + (error.response ? JSON.stringify(error.response.data) : error.message));
  }
});



router.get("/validate/:merchantTransactionId", async (req, res) => {
  const { merchantTransactionId } = req.params;

  if (!merchantTransactionId) {
    return res.status(400).send("Invalid merchant transaction ID");
  }

  const statusUrl = `${PHONE_PE_HOST_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`;
  const xVerifyChecksum = generateChecksum('', `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`);

  try {
    const response = await axios.get(statusUrl, {
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerifyChecksum,
        "accept": "application/json",
      },
    });

    const { success, data, message } = response.data;
    const { amount, state } = data;
    if (success && state === "COMPLETED") {
      const userId = await getUserIdFromTransactionId(merchantTransactionId);

      if (!userId) {
        return res.status(404).send("User not found for this transaction.");
      }

      const creditsToAdd = Math.floor(amount/20000); 
      const point = await Point.findOne({ user: userId });
      
      if (!point) {
        return res.status(404).send("Point document not found.");
      }
      point.credit += creditsToAdd; 
      point.last_recharge = new Date();
      await point.save(); 
      return res.send(response.data);
    } else {
      return res.status(400).send(`Payment failed: ${message}`);
    }
  } catch (error) {
    console.error("Payment status error:", error.message || error);
    if (!res.headersSent) {
      return res.status(500).send("Failed to check payment status: " + (error.response ? JSON.stringify(error.response.data) : error.message));
    }
  }
});


module.exports = router;
