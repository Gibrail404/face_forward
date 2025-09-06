const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: String, ref: 'Employee' },
  date: { type: Date, default: Date.now },
  time: { type: String, default: () => new Date().toTimeString().split(' ')[0] },
  status: { type: String, enum: ['On Service', 'Terminated'], default: 'On Service' },
});

module.exports = mongoose.model('Attendance', attendanceSchema);
