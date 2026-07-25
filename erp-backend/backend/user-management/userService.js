const store = require('./userStore');
const ROLES = require('../auth/constants/roles');
const AUTH_MESSAGES = require('../auth/constants/authMessages');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const adminRoles = [ROLES.ADMIN];
const validRoles = Object.values(ROLES);

const sensitiveFields = [
  'password',
  'passwordHash',
  'password_hash',
  'token',
  'refreshToken',
  'refresh_token',
  'failedLoginAttempts',
  'failed_login_attempts',
  'accountLockedUntil',
  'account_locked_until',
];


const namePattern = /^[\p{L}\s.\-']+$/u;

function cleanText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function readUser(req) {
  return req.user || req.currentUser || {};
}


function sanitizeUser(user) {
  if (!user) {
    return user;
  }

  const clean = { ...user };

  for (const field of sensitiveFields) {
    delete clean[field];
  }

  return clean;
}

function sanitizeUsers(users) {
  return users.map(sanitizeUser);
}

function requireAdmin(user) {
  const role = String(user.role || '').toLowerCase();

  if (!adminRoles.includes(role)) {
    const error = new Error(AUTH_MESSAGES.FORBIDDEN);
    error.statusCode = 403;
    throw error;
  }
}

function validateName(name) {
  if (!name) {
    const error = new Error('Full name is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!namePattern.test(name)) {
    const error = new Error(
      'Full name can only contain letters, spaces, hyphens, apostrophes, and periods.'
    );
    error.statusCode = 400;
    throw error;
  }

  if (name.length < 2 || name.length > 100) {
    const error = new Error('Full name must be between 2 and 100 characters.');
    error.statusCode = 400;
    throw error;
  }
}

function validateUser(payload) {
  const fullName = cleanText(payload.fullName);
  const email = cleanText(payload.email);
  const role = payload.role ? String(payload.role).toLowerCase().trim() : '';

  validateName(fullName);

  if (!email) {
    const error = new Error("Email is required.");
    error.statusCode = 400;
    throw error;
  }

  const at = email.indexOf("@");
  const dot = email.lastIndexOf(".");

  if (
    at <= 0 ||
    dot <= at + 1 ||
    dot === email.length - 1 ||
    at !== email.lastIndexOf("@") ||
    email.includes(" ") ||
    email.includes("..")
  ) {
    const error = new Error("Invalid email format.");
    error.statusCode = 400;
    throw error;
  }


  if (!role) {
    const error = new Error('Role is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!validRoles.includes(role)) {
    const error = new Error(
      'Role must be one of: ' + validRoles.join(', ') + '.'
    );
    error.statusCode = 400;
    throw error;
  }

  return { fullName, email, role };
}

async function createUser(payload, currentUser, supabase) {
  requireAdmin(currentUser);

  const validated = validateUser(payload);

  // Step 1: Create the auth user via the Supabase Admin API.
  // This requires the service role key; the anon key does not have admin rights.
  const DATABASE_CONFIG = require('../config/database.config');
  const { URL, SERVICE_ROLE_KEY } = DATABASE_CONFIG.SUPABASE;

  if (!SERVICE_ROLE_KEY) {
    const error = new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not configured. Cannot create auth users without it.'
    );
    error.statusCode = 500;
    throw error;
  }

  const adminClient = createClient(URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: validated.email,
    password: crypto.randomBytes(12).toString('base64url') + 'A1!', // temporary password
    email_confirm: true,
  });

  if (authError) {
    const err = new Error(authError.message || 'Failed to create auth user.');
    err.statusCode = authError.status === 422 ? 409 : 500;
    throw err;
  }

  // Step 2: Insert the profile row in public.users using the auth user's ID.
  const user = await store.addUser(
    {
      id: authData.user.id,
      fullName: validated.fullName,
      email: validated.email,
      role: validated.role,
      createdBy: String(
        currentUser.id || currentUser._id || currentUser.email || 'unknown'
      ),
    },
    supabase
  );

  return sanitizeUser(user);
}

async function updateUser(id, payload, currentUser, supabase) {
  requireAdmin(currentUser);

  const existing = await store.findUser(id, supabase);

  if (!existing) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const fullName = cleanText(payload.fullName || existing.fullName);

  validateName(fullName);

  const user = await store.updateUser(id, { fullName }, supabase);
  return sanitizeUser(user);
}

async function deleteUser(id, currentUser, supabase) {
  requireAdmin(currentUser);

  const existing = await store.findUser(id, supabase);

  if (!existing) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const removed = await store.removeUser(id, supabase);
  return sanitizeUser(removed);
}

async function getUserById(id, supabase) {
  const user = await store.findUser(id, supabase);

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return sanitizeUser(user);
}

async function listUsers(filters, supabase) {
  const users = await store.listUsers(filters, supabase);
  return sanitizeUsers(users);
}

async function toggleStatus(id, currentUser, supabase) {
  requireAdmin(currentUser);

  const existing = await store.findUser(id, supabase);

  if (!existing) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const newStatus =
    existing.accountStatus === 'active' ? 'inactive' : 'active';

  const user = await store.updateUser(id, { accountStatus: newStatus }, supabase);
  return sanitizeUser(user);
}

module.exports = {
  createUser,
  deleteUser,
  getUserById,
  listUsers,
  readUser,
  requireAdmin,
  sanitizeUser,
  sanitizeUsers,
  toggleStatus,
  updateUser,
};
