const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  emp_id: { type: String, required: true },  // using employee code, not ObjectId
  date: { 
    type: Date, 
    default: () => new Date().setHours(0, 0, 0, 0)  // store only the date
  },
  time: {
    punch_in: { type: String, default: null },   // set when punching in
    punch_out: { type: String, default: null }   // set when punching out
  },
  status: { 
    type: String, 
    enum: ['Present', 'Absent', 'Pending'], 
    default: 'Pending' 
  },
});

module.exports = mongoose.model('Attendance', attendanceSchema);
