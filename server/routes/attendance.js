const express = require('express');
const router = express.Router();
const { startRecognition, getAttendance, downloadToday, downloadAll } = require('../controllers/attendanceController');
const {protect} = require('../middleware/authMiddleware');

router.get('/video-feed', protect, startRecognition); // stream frames
router.get('/sheet', protect, getAttendance);
router.get('/download/today', protect, downloadToday);
router.get('/download/all', protect, downloadAll);

module.exports = router;
