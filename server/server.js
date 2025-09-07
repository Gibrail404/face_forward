// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config');
const { initQdrant } = require("./utils/qdrant");

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employee');
const attendanceRoutes = require('./routes/attendance');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));
// server.js
app.use(cors({ origin: '*' })); // allow requests from any origin

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

(async () => {
  await initQdrant();
})();

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Attendance API', version: '1.0.0', description: 'API documentation' },
    servers: [{ url: 'http://localhost:5000' }],
  },
  apis: ['./routes/auth.js', './routes/employee.js'], // make sure path matches your file
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
