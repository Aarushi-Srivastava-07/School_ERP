const express = require('express');
const router = express.Router();
const { getTimetable, updateTimetable } = require('./timetableController');
const { authenticateToken } = require('../auth/middleware/auth.middleware');
const { authorizeRoles } = require('../auth/middleware/role.middleware');

// GET /api/timetable/:classId — fetch the full schedule for a class (any authenticated user)
router.get('/:classId', authenticateToken, getTimetable);

// POST /api/timetable/update — upsert a timetable slot (admins/teachers/principals only)
router.post('/update', authenticateToken, authorizeRoles('admin', 'teacher', 'principal'), updateTimetable);

module.exports = router;
