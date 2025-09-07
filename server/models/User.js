const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  _id: String,
  username: { type: String, required: true, unique: true },
  name: String,
  email: String,
  password: { type: String, required: true },
  dateCreated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
