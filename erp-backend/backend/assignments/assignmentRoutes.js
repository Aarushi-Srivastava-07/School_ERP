const express = require('express');
const controller = require('./assignmentController');

const {
  authenticateToken,
} = require('../auth/middleware/auth.middleware');

const {
  authorizeRoles,
} = require('../auth/middleware/role.middleware');

const router = express.Router();

/*
Assignment Routes
Students, Teachers, and Admins can view assignments.
Only Teachers and Admins can create, update, or delete assignments.
*/

// Create Assignment
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'teacher'),
  controller.createAssignment
);

// List Assignments
router.get(
  '/',
  authenticateToken,
  controller.listAssignments
);

// Get Single Assignment
router.get(
  '/:id',
  authenticateToken,
  controller.getAssignment
);

// Update Assignment
router.patch(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'teacher'),
  controller.updateAssignment
);

// Delete Assignment
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'teacher'),
  controller.deleteAssignment
);

module.exports = router;