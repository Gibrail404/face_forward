const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

const faceapi = require('face-api.js');
const canvas = require('canvas');
const { Canvas, Image, ImageData } = canvas;

// Convert MongoDB encodings (Float32Array) back to descriptors
function buildLabeledDescriptors(employees) {
    return employees.map(e => new faceapi.LabeledFaceDescriptors(
        e._id.toString(),
        [new Float32Array(e.faceEncoding)]  // stored descriptor
    ));
}

// 📌 Recognize faces (from uploaded image, not webcam stream)
// exports.startRecognition = async (req, res) => {
//     try {
//         const imgBuffer = req.file.buffer; // assuming multer upload
//         const img = await canvas.loadImage(imgBuffer);

//         const detections = await faceapi
//             .detectAllFaces(img)
//             .withFaceLandmarks()
//             .withFaceDescriptors();

//         if (!detections.length) {
//             return res.status(404).json({ message: "No faces detected" });
//         }

//         const employees = await Employee.find();
//         const labeledDescriptors = buildLabeledDescriptors(employees);
//         const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);

//         let results = [];
//         for (let d of detections) {
//             const bestMatch = faceMatcher.findBestMatch(d.descriptor);
//             if (bestMatch.label !== "unknown") {
//                 const empId = bestMatch.label;
//                 const today = new Date().toDateString();

//                 const alreadyMarked = await Attendance.findOne({
//                     employeeId: empId,
//                     date: today
//                 });

//                 if (!alreadyMarked) {
//                     await Attendance.create({ employeeId: empId, status: 'On Service', date: today });
//                 }

//                 results.push({ employeeId: empId, match: true });
//             }
//         }

//         res.json({ matches: results });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Server Error" });
//     }
// };

exports.startRecognition = async (req, res) => {
  try {
    const employees = await Employee.find();

    if (!employees.length) {
      return res.status(404).json({ message: "No employees found in DB" });
    }

    // Build matcher from DB encodings
    const labeledDescriptors = buildLabeledDescriptors(employees);
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);

    // Descriptor received from client (instead of uploaded image)
    const { descriptor } = req.body; // <-- send Float32Array[] from frontend

    if (!descriptor || !descriptor.length) {
      return res.status(400).json({ message: "No descriptor received" });
    }

    // Convert descriptor to Float32Array
    const queryDescriptor = new Float32Array(descriptor);
    const bestMatch = faceMatcher.findBestMatch(queryDescriptor);

    if (bestMatch.label === "unknown") {
      return res.status(404).json({ message: "Face not recognized" });
    }

    const empId = bestMatch.label;
    const emp = await Employee.findById(empId);

    const today = new Date();
    const dateOnly = new Date(today.toDateString()); // strip time
    let attendance = await Attendance.findOne({ employeeId: empId, date: dateOnly });

    const currentTime = new Date().toTimeString().split(" ")[0]; // HH:MM:SS

    if (!attendance) {
      // First recognition -> punch_in
      attendance = await Attendance.create({
        employeeId: empId,
        date: dateOnly,
        time: { punch_in: currentTime, punch_out: null },
        status: "Pending",
      });

      await sendMail(emp.email, "Punch In Successful", `Hello ${emp.name}, you punched in at ${currentTime}`);
    } else if (!attendance.time.punch_out) {
      // Second recognition -> punch_out
      attendance.time.punch_out = currentTime;

      // Calculate total working hours
      const [h1, m1, s1] = attendance.time.punch_in.split(":").map(Number);
      const [h2, m2, s2] = attendance.time.punch_out.split(":").map(Number);

      const punchInDate = new Date(today.setHours(h1, m1, s1, 0));
      const punchOutDate = new Date(new Date().setHours(h2, m2, s2, 0));

      const diffMs = punchOutDate - punchInDate;
      const diffHrs = diffMs / (1000 * 60 * 60);

      attendance.status = diffHrs >= 8 ? "Present" : "Absent";
      await attendance.save();

      await sendMail(emp.email, "Punch Out Successful", `Hello ${emp.name}, you punched out at ${currentTime}. Total worked: ${diffHrs.toFixed(2)} hrs`);
    }

    res.json({ employeeId: empId, match: true });
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
