const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const cv = require('opencv4nodejs');
const faceUtil = require('../utils/faceRecognition');

// Stream webcam feed for recognition
exports.startRecognition = async (req, res) => {
    try {
        const wCap = new cv.VideoCapture(0); // webcam
        const knownEmployees = await Employee.find();
        const encodings = knownEmployees.map(e => e.faceEncoding);

        res.writeHead(200, {
            'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
        });

        setInterval(async () => {
            let frame = wCap.read();
            frame = frame.flip(1); // mirror
            const matches = await faceUtil.detectFaces(frame, encodings);
            
            matches.forEach(async (match) => {
                const empId = knownEmployees[match.index]._id;
                const alreadyMarked = await Attendance.findOne({ employeeId: empId, date: new Date().toDateString() });
                if (!alreadyMarked) {
                    await Attendance.create({ employeeId: empId, status: 'On Service' });
                }
            });

            const image = cv.imencode('.jpg', frame);
            res.write(`--frame\r\nContent-Type: image/jpeg\r\n\r\n`);
            res.write(image);
            res.write('\r\n');
        }, 100);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get attendance sheet
exports.getAttendance = async (req, res) => {
    try {
        const records = await Attendance.find().populate('employeeId');
        res.json(records);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Download today attendance
exports.downloadToday = async (req, res) => {
    const today = new Date().toDateString();
    const records = await Attendance.find({ date: today }).populate('employeeId');
    res.json(records);
};

// Download all attendance
exports.downloadAll = async (req, res) => {
    const records = await Attendance.find().populate('employeeId');
    res.json(records);
};
