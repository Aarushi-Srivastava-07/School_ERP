const express = require('express');
const { authenticateToken, authorizeRoles, injectScopedClasses } = require('../middleware/auth');
const { getResultsReport } = require('../controllers/resultReport');
const { getDashboardReport } = require('../controllers/dashboardReport');
const { getAttendanceReport } = require('../controllers/attendanceReport');
const { getStudentPerformanceReport } = require('../controllers/studentPerformanceReport');

const router = express.Router();

// Apply authentication to all reports routes
router.use(authenticateToken);

// 1. Attendance Reports - Scoped to classes for Teachers
router.get('/attendance', authorizeRoles('admin', 'principal', 'teacher'), injectScopedClasses, getAttendanceReport);

// 2. Result Reports - Scoped to classes for Teachers
router.get('/results', authorizeRoles('admin', 'principal', 'teacher'), injectScopedClasses, getResultsReport);

// 3. Student Performance - Scoped to classes for Teachers
router.get('/student-performance/:studentId', authorizeRoles('admin', 'principal', 'teacher'), injectScopedClasses, getStudentPerformanceReport);

// 4. Dashboard Statistics - Admin/Principal only
router.get('/dashboard', authorizeRoles('admin', 'principal'), getDashboardReport);

module.exports = router;
