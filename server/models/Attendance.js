const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, default: Date.now },
  time: {
    punch_in: { 
      type: String, 
      default: () => new Date().toTimeString().split(' ')[0] 
    },
    punch_out: { 
      type: String, 
      default: null 
    }
  },
  status: { type: String, enum: ['Present', 'Absent'], default: 'Present' },
});


module.exports = mongoose.model('Attendance', attendanceSchema);
