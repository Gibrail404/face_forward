const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  _id: String,
  name: { type: String, required: true },
  department: { type: String, required: true },
  email: { type: String, required: true },
  hiringDate: { type: Date, default: Date.now },
  faceEncoding: { type: [Number] }, // store face embeddings
});

module.exports = mongoose.model('Employee', employeeSchema);
