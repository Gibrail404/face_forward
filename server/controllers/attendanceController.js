// const Employee = require('../models/Employee');
// const Attendance = require('../models/Attendance');
// const cv = require('opencv4nodejs');
// const faceUtil = require('../utils/faceRecognition');

// // Stream webcam feed for recognition
// exports.startRecognition = async (req, res) => {
//     try {
//         const wCap = new cv.VideoCapture(0); // webcam
//         const knownEmployees = await Employee.find();
//         const encodings = knownEmployees.map(e => e.faceEncoding);

//         res.writeHead(200, {
//             'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
//         });

//         setInterval(async () => {
//             let frame = wCap.read();
//             frame = frame.flip(1); // mirror
//             const matches = await faceUtil.detectFaces(frame, encodings);
            
//             matches.forEach(async (match) => {
//                 const empId = knownEmployees[match.index]._id;
//                 const alreadyMarked = await Attendance.findOne({ employeeId: empId, date: new Date().toDateString() });
//                 if (!alreadyMarked) {
//                     await Attendance.create({ employeeId: empId, status: 'On Service' });
//                 }
//             });

//             const image = cv.imencode('.jpg', frame);
//             res.write(`--frame\r\nContent-Type: image/jpeg\r\n\r\n`);
//             res.write(image);
//             res.write('\r\n');
//         }, 100);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Server Error" });
//     }
// };

// // Get attendance sheet
// exports.getAttendance = async (req, res) => {
//     try {
//         const records = await Attendance.find().populate('employeeId');
//         res.json(records);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Server Error" });
//     }
// };

// // Download today attendance
// exports.downloadToday = async (req, res) => {
//     const today = new Date().toDateString();
//     const records = await Attendance.find({ date: today }).populate('employeeId');
//     res.json(records);
// };

// // Download all attendance
// exports.downloadAll = async (req, res) => {
//     const records = await Attendance.find().populate('employeeId');
//     res.json(records);
// };


const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

const faceapi = require('face-api.js');
const canvas = require('canvas');
const { Canvas, Image, ImageData } = canvas;

// Load models once at server start
// (async () => {
//     // await faceapi.nets.ssdMobilenetv1.loadFromDisk('./models');       // face detection
//     await faceapi.nets.faceRecognitionNet.loadFromDisk('./models');   // face recognition
//     await faceapi.nets.faceLandmark68Net.loadFromDisk('./models');    // landmarks
// })();

// Convert MongoDB encodings (Float32Array) back to descriptors
function buildLabeledDescriptors(employees) {
    return employees.map(e => new faceapi.LabeledFaceDescriptors(
        e._id.toString(),
        [new Float32Array(e.faceEncoding)]  // stored descriptor
    ));
}

// 📌 Recognize faces (from uploaded image, not webcam stream)
exports.startRecognition = async (req, res) => {
    try {
        const imgBuffer = req.file.buffer; // assuming multer upload
        const img = await canvas.loadImage(imgBuffer);

        const detections = await faceapi
            .detectAllFaces(img)
            .withFaceLandmarks()
            .withFaceDescriptors();

        if (!detections.length) {
            return res.status(404).json({ message: "No faces detected" });
        }

        const employees = await Employee.find();
        const labeledDescriptors = buildLabeledDescriptors(employees);
        const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);

        let results = [];
        for (let d of detections) {
            const bestMatch = faceMatcher.findBestMatch(d.descriptor);
            if (bestMatch.label !== "unknown") {
                const empId = bestMatch.label;
                const today = new Date().toDateString();

                const alreadyMarked = await Attendance.findOne({
                    employeeId: empId,
                    date: today
                });

                if (!alreadyMarked) {
                    await Attendance.create({ employeeId: empId, status: 'On Service', date: today });
                }

                results.push({ employeeId: empId, match: true });
            }
        }

        res.json({ matches: results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// 📌 Get attendance sheet
exports.getAttendance = async (req, res) => {
    try {
        const records = await Attendance.find().populate('employeeId');
        res.json(records);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// 📌 Download today attendance
exports.downloadToday = async (req, res) => {
    const today = new Date().toDateString();
    const records = await Attendance.find({ date: today }).populate('employeeId');
    res.json(records);
};

// 📌 Download all attendance
exports.downloadAll = async (req, res) => {
    const records = await Attendance.find().populate('employeeId');
    res.json(records);
};
