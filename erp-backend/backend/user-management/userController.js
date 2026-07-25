const service = require('./userService');
const { getClientFromRequest } = require('./userStore');

function sendResponse(res, statusCode, data) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

function handleError(res, error) {
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Something went wrong.',
  });
}

async function createUser(req, res) {
  try {
    const supabase = getClientFromRequest(req);
    const currentUser = service.readUser(req);
    const user = await service.createUser(req.body, currentUser, supabase);

    return sendResponse(res, 201, user);
  } catch (error) {
    return handleError(res, error);
  }
}

async function updateUser(req, res) {
  try {
    const supabase = getClientFromRequest(req);
    const currentUser = service.readUser(req);
    const user = await service.updateUser(req.params.id, req.body, currentUser, supabase);

    return sendResponse(res, 200, user);
  } catch (error) {
    return handleError(res, error);
  }
}

async function deleteUser(req, res) {
  try {
    const supabase = getClientFromRequest(req);
    const currentUser = service.readUser(req);
    const user = await service.deleteUser(req.params.id, currentUser, supabase);

    return sendResponse(res, 200, user);
  } catch (error) {
    return handleError(res, error);
  }
}

async function getUser(req, res) {
  try {
    const supabase = getClientFromRequest(req);
    const user = await service.getUserById(req.params.id, supabase);

    return sendResponse(res, 200, user);
  } catch (error) {
    return handleError(res, error);
  }
}

async function listUsers(req, res) {
  try {
    const supabase = getClientFromRequest(req);
    const users = await service.listUsers({
      role: req.query.role,
      accountStatus: req.query.status,
    }, supabase);

    return sendResponse(res, 200, users);
  } catch (error) {
    return handleError(res, error);
  }
}

async function toggleStatus(req, res) {
  try {
    const supabase = getClientFromRequest(req);
    const currentUser = service.readUser(req);
    const user = await service.toggleStatus(req.params.id, currentUser, supabase);

    return sendResponse(res, 200, user);
  } catch (error) {
    return handleError(res, error);
  }
}

function createRoleController(role) {
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  return {
    async create(req, res) {
      try {
        const supabase = getClientFromRequest(req);
        const currentUser = service.readUser(req);
        const user = await service.createUser(
          { ...req.body, role },
          currentUser,
          supabase
        );

        return sendResponse(res, 201, user);
      } catch (error) {
        return handleError(res, error);
      }
    },

    async list(req, res) {
      try {
        const supabase = getClientFromRequest(req);
        const users = await service.listUsers({
          role,
          accountStatus: req.query.status,
        }, supabase);

        return sendResponse(res, 200, users);
      } catch (error) {
        return handleError(res, error);
      }
    },

    async getById(req, res) {
      try {
        const supabase = getClientFromRequest(req);
        const user = await service.getUserById(req.params.id, supabase);

        if (user.role !== role) {
          return res.status(404).json({
            success: false,
            message: roleLabel + ' not found.',
          });
        }

        return sendResponse(res, 200, user);
      } catch (error) {
        return handleError(res, error);
      }
    },

    async update(req, res) {
      try {
        const supabase = getClientFromRequest(req);
        const currentUser = service.readUser(req);

        const target = await service.getUserById(req.params.id, supabase);

        if (target.role !== role) {
          return res.status(404).json({
            success: false,
            message: roleLabel + ' not found.',
          });
        }

        const user = await service.updateUser(req.params.id, req.body, currentUser, supabase);

        return sendResponse(res, 200, user);
      } catch (error) {
        return handleError(res, error);
      }
    },

    async remove(req, res) {
      try {
        const supabase = getClientFromRequest(req);
        const currentUser = service.readUser(req);

        const target = await service.getUserById(req.params.id, supabase);

        if (target.role !== role) {
          return res.status(404).json({
            success: false,
            message: roleLabel + ' not found.',
          });
        }

        const user = await service.deleteUser(req.params.id, currentUser, supabase);

        return sendResponse(res, 200, user);
      } catch (error) {
        return handleError(res, error);
      }
    },
  };
}

module.exports = {
  createRoleController,
  createUser,
  deleteUser,
  getUser,
  listUsers,
  toggleStatus,
  updateUser,
};
