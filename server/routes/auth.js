const express = require('express');
const router = express.Router();
const { register, login, resetRequest, verifyOTP, resetPassword } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/reset-request', resetRequest);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
