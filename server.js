const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/conn');
const User = require('./models/User');
const cors = require('cors');
const fs = require('fs');
const Doctor = require('./models/Doctor');
const Meeting = require('./models/Meeting');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const port = process.env.PORT;
const Point = require('./models/points');
const paymentRoutes = require("./routes/payment");
connectDB();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.BASE_URL
}));
app.use(bodyParser.json());


app.use("/payment", paymentRoutes);
app.use('/api', require('./routes/auth'));



app.listen(port, () => console.log(`Server running on port ${port}`));
