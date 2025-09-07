const User = require('../models/User');
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sendMail = require('../utils/email');

// Temporary OTP storage (can use MongoDB for persistence)
let otpStore = {};

exports.register = async (req, res) => {
  try {
    const { id, username, name, email, password, password2 } = req.body;

    if (password !== password2) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({
      $or: [{ _id: id }, { username }, { email }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🔹 Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      _id: id,
      username,
      name,
      email,
      password: hashedPassword,
    });
    await user.save();

    // const msg = `Hello ${name},\nYour owner account has been successfully created.\nThank You.`;
    // await sendMail(email, "Successfully Registered", msg);

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // 🔹 Create JWT Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token, // ✅ send token here
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.userProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.verifyOTP = (req, res) => {
  const { userId, otp } = req.body;
  if (otpStore[userId] && otpStore[userId] == otp) {
    return res.json({ message: "OTP verified" });
  }
  return res.status(400).json({ message: "Invalid OTP" });
};

exports.resetPassword = async (req, res) => {
  const { userId, password, password2 } = req.body;
  if (password !== password2) return res.status(400).json({ message: "Passwords do not match" });

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.password = await bcrypt.hash(password, 10);
  await user.save();
  delete otpStore[userId];

  res.json({ message: "Password reset successfully" });
};
