const User = require('../models/User');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sendMail = require('../utils/email');
const { upsertUserEmbedding } = require('../utils/qdrant');

// Temporary OTP storage (can use MongoDB for persistence)
let otpStore = {};

exports.register = async (req, res) => {
    try {
        const { id, username, name, email, password, password2 } = req.body;

        if (password !== password2) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const existingUser = await User.findOne({ $or: [{ _id: id }, { username }] });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const user = new User({ _id: id, username, name, email, password });
        await user.save();

        // qdrant embedding upsert
        await upsertUserEmbedding(user._id, descriptor, { name, email, username });

        const msg = `Hello ${name},\nYour owner account has been successfully created.\nThank You.`;
        // await sendMail(email, 'Successfully Registered', msg);

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
        if (!user) return res.status(400).json({ message: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        res.status(200).json({ message: "Login successful", userId: user._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.resetRequest = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not found" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[user._id] = otp;

    await sendMail(email, 'Reset Password OTP', `Your OTP is: ${otp}`);
    res.json({ message: "OTP sent", userId: user._id });
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
