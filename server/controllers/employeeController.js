const Employee = require('../models/Employee');
const fs = require('fs');
const path = require('path');
const sendMail = require('../utils/email');
const faceUtil = require('../utils/faceRecognition');
const Attendance = require('../models/Attendance');

// Add new employee
exports.addEmployee = async (req, res) => {
  try {
    const { emp_id, name, department, email, faceEncoding } = req.body;

    const existing = await Employee.findOne({ emp_id });
    if (existing) return res.status(400).json({ message: "Employee ID already exists" });


    const employee = new Employee({ emp_id, name, department, email, faceEncoding: faceEncoding });
    await employee.save();

    const msg = `Hi ${name},\nWelcome to the organization. You have been successfully registered.`;
    await sendMail(email, 'Employee Registered', msg);

    res.status(200).json({ message: "Employee added successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Server Error" });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department, email } = req.body;
    const employee = await Employee.findById(id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    employee.name = name;
    employee.department = department;
    employee.email = email;

    await employee.save();
    res.json({ message: "Employee updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};


// get employee
exports.getEmployee = async (req, res) => {
  try {
    const { descriptor } = req.body; // embedding array from client
    const faceEncoding = descriptor;
    if (!faceEncoding || !faceEncoding.length) {
      return res.status(400).json({ message: "Face encoding required" });
    }

    // Run MongoDB Atlas vector search
    const result = await Employee.aggregate([
      {
        $vectorSearch: {
          queryVector: faceEncoding,  // the input embedding
          path: "faceEncoding",       // field in schema
          numCandidates: 50,          // how many to compare internally
          limit: 1,                   // top 1 match
          index: "vector_index_1" // index name you created in Atlas
        }
      },
      {
        $project: {
          emp_id: 1,
          name: 1,
          department: 1,
          email: 1,
          hiringDate: 1,
          score: { $meta: "vectorSearchScore" }   // 👈 add this
        }
      }
    ]).exec();

    if (result.length > 0) {
      const bestMatch = result[0];
      const distance = bestMatch.score; // similarity/distance value

      if (distance > 0.96) {
        console.log("Matched user:", bestMatch);
        const empId = bestMatch._id;
        const emp = await Employee.findById(empId);

        const today = new Date();
        const dateOnly = new Date(today.toDateString()); // strip time
        let attendance = await Attendance.findOne({ emp_id: bestMatch.emp_id, date: dateOnly });
        const currentTime = new Date().toTimeString().split(" ")[0]; // HH:MM:SS

        if (!attendance) {
          // First recognition -> punch_in
          attendance = await Attendance.create({
            emp_id: bestMatch.emp_id,
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

          await sendMail(
            emp.email,
            "Punch Out Successful",
            `Hello ${emp.name}, you punched out at ${currentTime}. Total worked: ${diffHrs.toFixed(2)} hrs`
          );
        }
      } else {
        console.log("No registered user found (too different)");
      }

    } else {
      console.log("No matches at all");
    }

    if (!result.length) {
      return res.status(404).json({ message: "Employee not recognized" });
    }

    const bestMatch = result[0];

    res.status(200).json({
      message: "Employee recognized",
      employee: {
        id: bestMatch._id,
        emp_id: bestMatch.emp_id,
        name: bestMatch.name,
        department: bestMatch.department,
        email: bestMatch.email
      },
      similarityScore: bestMatch.score // lower = closer for euclidean
    });
  } catch (err) {
    console.error("Error in getEmployee:", err);
    res.status(500).json({ message: "Server Error" });
  }
};


// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    await Employee.findByIdAndDelete(id);
    const photoPath = path.join(__dirname, '../uploads/', id + '.jpg');
    if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);

    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// List all employees
exports.listEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
