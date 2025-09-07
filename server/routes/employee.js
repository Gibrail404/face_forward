const express = require('express');
const router = express.Router();
const { addEmployee, updateEmployee, deleteEmployee, listEmployees } = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', addEmployee);
router.put('/update/:id', protect, updateEmployee);
router.delete('/delete/:id', protect, deleteEmployee);
router.get('/list', listEmployees);

module.exports = router;
