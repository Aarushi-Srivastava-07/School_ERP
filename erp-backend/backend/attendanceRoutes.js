const express = require('express');
const router = express.Router();
const {
  getRecentAttendance,
  getAttendanceSummary,
  getAttendanceCalendar,
} = require('./attendance/attendanceController');

router.get('/recent', getRecentAttendance);
router.get('/summary', getAttendanceSummary);
router.get('/calendar', getAttendanceCalendar);

module.exports = router;
