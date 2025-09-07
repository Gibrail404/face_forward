const Employee = require('../models/Employee');
const fs = require('fs');
const path = require('path');
const sendMail = require('../utils/email');
const faceUtil = require('../utils/faceRecognition');

// Add new employee
exports.addEmployee = async (req, res) => {
  try {
    const { emp_id, name, department, email,faceEncoding } = req.body;
    
    const existing = await Employee.findOne({ emp_id });
    if (existing) return res.status(400).json({ message: "Employee ID already exists" });


    const employee = new Employee({ emp_id, name, department, email, faceEncoding: faceEncoding });
    await employee.save();

    const msg = `Hi ${name},\nWelcome to the organization. You have been successfully registered.`;
    await sendMail.sendMail(email, 'Employee Registered', msg);

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
    const { faceEncoding } = req.body; // embedding array from client
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
          index: "faceEncoding_index" // index name you created in Atlas
        }
      }
    ]);

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
