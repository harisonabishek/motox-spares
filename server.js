const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");
const dotenv = require("dotenv");
const Razorpay = require("razorpay");
const Order = require("./models/Order");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

if (!process.env.MONGO_URI) console.error("MONGO_URI is missing in .env");
if (!process.env.RAZORPAY_KEY_ID) console.error("RAZORPAY_KEY_ID is missing in .env");
if (!process.env.RAZORPAY_KEY_SECRET) console.error("RAZORPAY_KEY_SECRET is missing in .env");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected: bikeSparePartsDB"))
  .catch(err => console.error("MongoDB connection failed:", err.message));

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/api/test", (req, res) => res.json({ success: true, message: "MOTOX server is working" }));

app.post("/api/payment/create-order", async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, message: "Invalid payment amount" });
    const order = await razorpay.orders.create({ amount: Math.round(amount * 100), currency: "INR", receipt: `MOTOX_${Date.now()}` });
    res.json({ success: true, keyId: process.env.RAZORPAY_KEY_ID, order });
  } catch (err) {
    console.error("Razorpay create order error:", err);
    res.status(500).json({ success: false, message: "Unable to create Razorpay order", error: err.message });
  }
});

app.post("/api/payment/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderData) return res.status(400).json({ success: false, message: "Payment details are missing" });
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    if (expected !== razorpay_signature) return res.status(400).json({ success: false, message: "Payment verification failed" });
    const order = await Order.create({
      customer: orderData.customer,
      shippingAddress: orderData.shippingAddress,
      items: orderData.items.map(i => ({ ...i, productId: String(i.productId) })),
      totalAmount: Number(orderData.totalAmount),
      paymentMethod: "ONLINE",
      orderStatus: "Confirmed",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature
    });
    res.json({ success: true, message: "Payment verified and order saved", order });
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ success: false, message: "Unable to verify payment", error: err.message });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const order = await Order.create({
      customer: req.body.customer,
      shippingAddress: req.body.shippingAddress,
      items: (req.body.items || []).map(i => ({ ...i, productId: String(i.productId) })),
      totalAmount: Number(req.body.totalAmount),
      paymentMethod: "COD",
      orderStatus: "Pending"
    });
    console.log("COD order saved:", order._id.toString());
    res.status(201).json({ success: true, message: "Order placed successfully", order });
  } catch (err) {
    console.error("COD order error:", err);
    res.status(500).json({ success: false, message: "Failed to place order", error: err.message });
  }
});

app.get("/api/orders", async (req, res) => {
  try { res.json({ success: true, count: await Order.countDocuments(), orders: await Order.find().sort({ createdAt: -1 }) }); }
  catch (err) { res.status(500).json({ success: false, message: "Failed to fetch orders", error: err.message }); }
});

app.listen(PORT, "0.0.0.0", () => console.log(`MOTOX running at http://localhost:${PORT}`));
