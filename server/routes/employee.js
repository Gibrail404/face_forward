// routes/employee.js
const express = require('express');
const router = express.Router();
const { addEmployee, updateEmployee, deleteEmployee, listEmployees, getAllQdrantUsers } = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee management endpoints
 */

/**
 * @swagger
 * /api/employees/add:
 *   post:
 *     summary: Add a new employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - position
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               position:
 *                 type: string
 *                 example: "Software Engineer"
 *     responses:
 *       201:
 *         description: Employee added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/add', protect, addEmployee);

/**
 * @swagger
 * /api/employees/update/{id}:
 *   put:
 *     summary: Update an existing employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               position:
 *                 type: string
 *                 example: "Senior Engineer"
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found
 */
router.put('/update/:id', protect, updateEmployee);

/**
 * @swagger
 * /api/employees/delete/{id}:
 *   delete:
 *     summary: Delete an employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found
 */
router.delete('/delete/:id', protect, deleteEmployee);

/**
 * @swagger
 * /api/employees/list:
 *   get:
 *     summary: Get list of all employees
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of employees
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   position:
 *                     type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/list', listEmployees);

router.get("/qdrant-users", getAllQdrantUsers);


module.exports = router;
