const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());

// ---------------- SCHEMAS ----------------
const Category = mongoose.model(
  "Category",
  new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: String,
    createdAt: { type: Date, default: Date.now },
  })
);

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: String,
  })
);

const Product = mongoose.model(
  "Product",
  new mongoose.Schema({
    title: String,
    price: Number,
    description: String,
  })
);

// ---------------- MIDDLEWARE ----------------
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  jwt.verify(token, "SECRET_KEY", (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
};

// ---------------- CATEGORY CRUD ----------------
app.post("/categories", async (req, res, next) => {
  try {
    const cat = await Category.create(req.body);
    res.json(cat);
  } catch (err) {
    next(err);
  }
});

app.get("/categories", async (req, res, next) => {
  try {
    const cats = await Category.find();
    res.json(cats);
  } catch (err) {
    next(err);
  }
});

app.get("/categories/:id", async (req, res, next) => {
  try {
    const cat = await Category.findById(req.params.id);
    res.json(cat || { message: "Not found" });
  } catch (err) {
    next(err);
  }
});

app.put("/categories/:id", async (req, res, next) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(cat || { message: "Not found" });
  } catch (err) {
    next(err);
  }
});

app.delete("/categories/:id", async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
});

// ---------------- PASSWORD RESET ----------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: "YOUR_EMAIL@gmail.com", pass: "YOUR_PASSWORD" },
});

app.post("/forgot-password", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await user.save();

    await transporter.sendMail({
      from: "YOUR_EMAIL@gmail.com",
      to: user.email,
      subject: "OTP for Reset",
      text: `Your OTP: ${otp}`,
    });

    res.json({ message: "OTP sent" });
  } catch (err) {
    next(err);
  }
});

app.post("/reset-password", async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp) return res.json({ message: "Invalid OTP" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    await user.save();
    res.json({ message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
});

// ---------------- PRODUCTS ----------------
app.get("/products", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const total = await Product.countDocuments();
    const products = await Product.find()
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({ products, currentPage: page, totalPages: Math.ceil(total / limit), total });
  } catch (err) {
    next(err);
  }
});

app.get("/products/search", async (req, res, next) => {
  try {
    const { query = "", minPrice = 0, maxPrice = 100000 } = req.query;
    const products = await Product.find({
      title: { $regex: query, $options: "i" },
      price: { $gte: minPrice, $lte: maxPrice },
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

app.delete("/deleteproduct/:id", authenticateToken, async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
});

// ---------------- GLOBAL ERROR ----------------
app.use(errorHandler);

// ---------------- DB & SERVER ----------------
mongoose
  .connect("mongodb://127.0.0.1:27017/test-sece")
  .then(() => app.listen(5000, () => console.log("Server running on 5000")))
  .catch(console.error);
