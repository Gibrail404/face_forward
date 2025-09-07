const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  emp_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  hiringDate: { type: Date, default: Date.now },
  faceEncoding: {
    type: [Number],  // store as array of floats
    index: "vector"  // MongoDB Atlas Vector Search index
  },
});

module.exports = mongoose.model('Employee', employeeSchema);
