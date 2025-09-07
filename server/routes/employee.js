const express = require('express');
const router = express.Router();
const { addEmployee, updateEmployee, getEmployee, deleteEmployee, listEmployees } = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, addEmployee);
router.post('/match', getEmployee);
router.put('/update/:id', protect, updateEmployee);
router.delete('/delete/:id', protect, deleteEmployee);
router.get('/list', listEmployees);

module.exports = router;
