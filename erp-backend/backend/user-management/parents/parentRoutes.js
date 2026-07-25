const express = require('express');
const { authenticateToken } = require('../../auth/middleware/auth.middleware');
const { authorizeRoles } = require('../../auth/middleware/role.middleware');
const ROLES = require('../../auth/constants/roles');
const { createRoleController } = require('../userController');
const { getClientFromRequest } = require('../userStore');
const service = require('../userService');

const router = express.Router();
const ctrl = createRoleController('parent');

router.use(authenticateToken);

router.post('/', authorizeRoles(ROLES.ADMIN), ctrl.create);

router.get('/', ctrl.list);

router.get('/:id', async (req, res) => {
  try {
    const supabase = getClientFromRequest(req);
    const user = await service.getUserById(req.params.id, supabase);

    if (user.role !== 'parent') {
      return res.status(404).json({ success: false, message: 'Parent not found.' });
    }

    const { data: linkedRows, error: linkError } = await supabase
      .from('parent_students')
      .select('student_id')
      .eq('parent_id', req.params.id);

    if (linkError) throw linkError;

    const studentIds = (linkedRows || []).map(r => r.student_id);

    let children = [];
    if (studentIds.length > 0) {
      const { data: studentRows, error: studentError } = await supabase
        .from('users')
        .select('id, full_name')
        .in('id', studentIds);

      if (studentError) throw studentError;
      children = (studentRows || []).map(s => ({ id: s.id, full_name: s.full_name }));
    }

    return res.status(200).json({
      success: true,
      data: { ...user, children },
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
