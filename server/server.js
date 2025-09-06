const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config');

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employee');
const attendanceRoutes = require('./routes/attendance');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
