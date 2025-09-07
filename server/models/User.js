const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  _id: String,
  username: { type: String, required: true, unique: true },
  name: String,
  email: String,
  password: { type: String, required: true },
  dateCreated: { type: Date, default: Date.now },
  descriptor: [Number]
});

// password hashing before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
