const express = require('express');
const { authenticateToken } = require('../../auth/middleware/auth.middleware');
const { authorizeRoles } = require('../../auth/middleware/role.middleware');
const ROLES = require('../../auth/constants/roles');
const { createRoleController } = require('../userController');
const { getClientFromRequest } = require('../userStore');
const service = require('../userService');

const router = express.Router();
const ctrl = createRoleController('student');

router.use(authenticateToken);

router.post('/', authorizeRoles(ROLES.ADMIN), ctrl.create);

router.get('/', ctrl.list);

router.get('/:id', async (req, res) => {
  try {
    const supabase = getClientFromRequest(req);
    const user = await service.getUserById(req.params.id, supabase);

    if (user.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const { data: classRows, error } = await supabase
      .from('class_students')
      .select('class_id, classes(id, class_name, section)')
      .eq('student_id', req.params.id);

    if (error) throw error;

    const classes = (classRows || [])
      .map(row => row.classes)
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      data: { ...user, classes },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Something went wrong.',
    });
  }
});

router.patch('/:id', authorizeRoles(ROLES.ADMIN), ctrl.update);
router.delete('/:id', authorizeRoles(ROLES.ADMIN), ctrl.remove);

module.exports = router;
