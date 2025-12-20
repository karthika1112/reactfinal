// -B
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(express.json());

/* ================= DATABASE ================= */
mongoose.connect("mongodb://127.0.0.1:27017/testsece");

/* ================= RATE LIMIT (BONUS 1) ================= */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20
});

app.use((req, res, next) => {
  if (req.headers.authorization) {
    authLimiter(req, res, next);
  } else {
    publicLimiter(req, res, next);
  }
});

/* ================= USER SCHEMA ================= */
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  otp: String
});
const User = mongoose.model("users", userSchema);

/* ================= CATEGORY SCHEMA ================= */
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  createdAt: { type: Date, default: Date.now }
});
const Category = mongoose.model("categories", categorySchema);

/* ================= PRODUCT SCHEMA ================= */
const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  image: String
});
const Product = mongoose.model("products", productSchema);

/* ================= JWT MIDDLEWARE ================= */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token missing" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, "secretkey", (err, user) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

/* ================= CATEGORY CRUD ================= */
app.post("/categories", async (req, res) => {
  const category = new Category(req.body);
  await category.save();
  res.json(category);
});

app.get("/categories", async (req, res) => {
  res.json(await Category.find());
});

app.get("/categories/:id", async (req, res) => {
  res.json(await Category.findById(req.params.id));
});

app.put("/categories/:id", async (req, res) => {
  res.json(await Category.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});

app.delete("/categories/:id", async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

/* ================= FORGOT PASSWORD ================= */
app.post("/forgot-password", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  await user.save();

  res.json({ message: "OTP sent to email", otp }); // exam purpose
});

/* ================= RESET PASSWORD ================= */
app.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email, otp });
  if (!user) return res.status(400).json({ message: "Invalid OTP" });

  user.password = await bcrypt.hash(newPassword, 10);
  user.otp = null;
  await user.save();

  res.json({ message: "Password reset successful" });
});

/* ================= MULTER (BONUS 2) ================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.use("/uploads", express.static("uploads"));

/* ================= PRODUCT APIs ================= */
app.post("/products", upload.single("image"), async (req, res) => {
  const product = new Product({
    title: req.body.title,
    price: req.body.price,
    image: req.file.path
  });
  await product.save();
  res.json(product);
});

app.get("/products", async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const totalProducts = await Product.countDocuments();
  const products = await Product.find()
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    products,
    currentPage: page,
    totalPages: Math.ceil(totalProducts / limit),
    totalProducts
  });
});

app.get("/products/search", async (req, res) => {
  const { query, minPrice, maxPrice } = req.query;

  const filter = {
    title: { $regex: query || "", $options: "i" },
    price: { $gte: minPrice || 0, $lte: maxPrice || Infinity }
  };

  res.json(await Product.find(filter));
});

/* ================= PROTECTED DELETE ================= */
app.delete("/deleteproduct/:id", authenticateToken, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
});

/* ================= GLOBAL ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  console.error(new Date(), err.message);
  res.status(500).json({ message: "Server error" });
});

/* ================= SERVER ================= */
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
