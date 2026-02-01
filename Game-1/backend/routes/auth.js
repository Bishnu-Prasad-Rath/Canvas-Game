const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const SECRET = "my_secret_key"; // move to .env later

// =====================
// REGISTER
// =====================
router.post("/register", async (req, res) => {
  console.log("REGISTER BODY:", req.body);

  const username = req.body?.username?.trim().toLowerCase();
  const password = req.body?.password?.trim();

  if (!username || !password) {
    return res.status(400).json({ error: "Missing username or password" });
  }

  if (password.length < 4) {
    return res.status(400).json({ error: "Password too short" });
  }

  const exists = await User.findOne({ username });
  if (exists) {
    return res.status(409).json({ error: "User already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ username, password: hashed });

  res.json({ message: "User registered" });
});

// =====================
// LOGIN
// =====================
router.post("/login", async (req, res) => {
  console.log("LOGIN BODY:", req.body);

  const username = req.body?.username?.trim().toLowerCase();
  const password = req.body?.password?.trim();

  if (!username || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({ error: "Wrong password" });
  }

  const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "1h" });
  res.json({ token, username });
});

module.exports = router;
