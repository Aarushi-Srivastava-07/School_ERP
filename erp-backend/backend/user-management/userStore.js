// Lazy-loaded at request-time to avoid boot crash when env vars are missing.
// database.config.js throws on import if SUPABASE_URL / SUPABASE_ANON_KEY are not set.

/**
 * Column map: DB (snake_case) → service layer (camelCase).
 */
function toServiceShape(row) {
  if (!row) return null;

  return {
    id: row.id,
    fullName: row.full_name ?? null,
    email: row.email ?? null,
    role: row.role,
    accountStatus: row.account_status ?? 'active',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Column map: service layer (camelCase) → DB (snake_case).
 * Only includes keys that are present in `changes`.
 */
function toDbShape(changes) {
  const map = {
    fullName: 'full_name',
    accountStatus: 'account_status',
    role: 'role',
  };

  const dbChanges = {};

  for (const [key, value] of Object.entries(changes)) {
    const dbKey = map[key];
    if (dbKey) {
      dbChanges[dbKey] = value;
    }
  }

  return dbChanges;
}

/**
 * Create a new user row in public.users.
 *
 * Email is NOT stored in public.users (it lives in auth.users),
 * so this inserts only the profile columns.
 */
async function addUser(data, supabase) {
  const { data: inserted, error } = await supabase
    .from('users')
    .insert({
      id: data.id,
      full_name: data.fullName,
      role: data.role,
      account_status: data.accountStatus || 'active',
    })
    .select('*')
    .single();

  if (error) {
    const err = new Error(error.message || 'Failed to create user.');
    err.statusCode = error.code === '23505' ? 409 : 500;
    throw err;
  }

  return toServiceShape({ ...inserted, email: data.email });
}

/**
 * Find a single user by UUID.
 */
async function findUser(id, supabase) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    const err = new Error(error.message || 'Failed to fetch user.');
    err.statusCode = 500;
    throw err;
  }

  return toServiceShape(data);
}

/**
 * Update a user row in public.users.
 */
async function updateUser(id, changes, supabase) {
  const dbChanges = toDbShape(changes);

  // Nothing to update in public.users
  if (Object.keys(dbChanges).length === 0) {
    return findUser(id, supabase);
  }

  dbChanges.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('users')
    .update(dbChanges)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    const err = new Error(error.message || 'Failed to update user.');
    err.statusCode = 500;
    throw err;
  }

  return toServiceShape(data);
}

/**
 * Delete a user row from public.users.
 *
 * Because public.users.id references auth.users(id) ON DELETE CASCADE,
 * deleting from public.users does NOT remove the auth account.
 * To fully delete a user the auth admin API would need to be called separately.
 */
async function removeUser(id, supabase) {
  const existing = await findUser(id, supabase);

  if (!existing) return null;

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) {
    const err = new Error(error.message || 'Failed to delete user.');
    err.statusCode = 500;
    throw err;
  }

  return existing;
}

/**
 * List users with optional role / account_status filters.
 */
async function listUsers(filters = {}, supabase) {
  let query = supabase.from('users').select('*');

  if (filters.role) {
    query = query.eq('role', filters.role);
  }

  if (filters.accountStatus) {
    query = query.eq('account_status', filters.accountStatus);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    const err = new Error(error.message || 'Failed to list users.');
    err.statusCode = 500;
    throw err;
  }

  return (data || []).map(toServiceShape);
}

/**
 * Extract the caller's JWT from the request and return a per-user
 * Supabase client.  This keeps RLS enforced on every query.
 */
function getClientFromRequest(req) {
  const authHeader = req.get('Authorization') || '';
  const [, token] = authHeader.split(' ');

  if (!token) {
    const err = new Error('Authentication token is required.');
    err.statusCode = 401;
    throw err;
  }

  const { getClientForUser } = require('../services/database.service');
  return getClientForUser(token);
}

module.exports = {
  addUser,
  findUser,
  updateUser,
  removeUser,
  listUsers,
  getClientFromRequest,
  toServiceShape,
};
