const AppError = require('../errors/AppError');
const { getSupabaseClient, runQuery } = require('../utils/supabaseClient');
const {
  applyMemoryFilters,
  sortRows,
  paginateRows,
  applySupabaseFilters,
  applySupabaseSortAndRange,
} = require('../utils/queryUtils');

let subjects = [];
let nextId = 1;

const isDevelopmentMode = () => process.env.NODE_ENV !== 'production';

const normalizeSubject = (subject) => {
  if (!subject || typeof subject !== 'object') {
    return null;
  }

  return {
    id: String(subject.id),
    name: subject.name,
    class_id: subject.class_id ?? subject.classId,
    sub_code: subject.sub_code ?? subject.subCode,
    created_at: subject.created_at ?? subject.createdAt ?? new Date().toISOString(),
  };
};

const mapFilterKey = (key) => {
  const map = {
    classId: 'class_id',
    subCode: 'sub_code',
  };

  return map[key] || key;
};


const createSubject = async (subjectData, user) => {
  const client = getSupabaseClient(user);

  if (!client) {
    if (!isDevelopmentMode()) {
      throw new AppError('Supabase client is not configured', 500);
    }

    const subject = normalizeSubject({
      id: String(nextId++),
      ...subjectData,
      created_at: new Date().toISOString(),
    });

    subjects.push(subject);
    return subject;
  }

  const response = await runQuery(
    client.from('subjects').insert(subjectData).select('*').single()
  );

  if (response?.error) {
    throw new AppError('Unable to create subject', 500, response.error);
  }

  return normalizeSubject(response.data);
};

const updateSubject = async (id, updates, user) => {
  const client = getSupabaseClient(user);

  if (!client) {
    if (!isDevelopmentMode()) {
      throw new AppError('Supabase client is not configured', 500);
    }

    const index = subjects.findIndex((subject) => subject.id === String(id));
    if (index === -1) {
      return null;
    }

    const updated = normalizeSubject({
      ...subjects[index],
      ...updates,
    });

    subjects[index] = updated;
    return updated;
  }

  const response = await runQuery(
    client.from('subjects').update(updates).eq('id', String(id)).select('*').single()
  );

  if (response?.error) {
    throw new AppError('Unable to update subject', 500, response.error);
  }

  return response.data ? normalizeSubject(response.data) : null;
};

const getSubjectById = async (id, user) => {
  const client = getSupabaseClient(user);

  if (!client) {
    if (!isDevelopmentMode()) {
      throw new AppError('Supabase client is not configured', 500);
    }

    const subject = subjects.find((item) => item.id === String(id));
    return subject ? normalizeSubject(subject) : null;
  }

  const response = await runQuery(
    client.from('subjects').select('*').eq('id', String(id)).maybeSingle()
  );

  if (response?.error) {
    throw new AppError('Unable to fetch subject', 500, response.error);
  }

  return response.data ? normalizeSubject(response.data) : null;
};

const getAllSubjects = async (filters = {}, options = {}, user) => {
  const client = getSupabaseClient(user);

  if (!client) {
    if (!isDevelopmentMode()) {
      throw new AppError('Supabase client is not configured', 500);
    }

    const allSubjects = subjects.map((subject) => normalizeSubject(subject));
    const filtered = applyMemoryFilters(allSubjects, filters, mapFilterKey);
    const sorted = sortRows(filtered, options.sortBy, options.order, ['id', 'name', 'class_id', 'sub_code', 'created_at'], 'created_at');
    return paginateRows(sorted, options.page, options.limit);
  }

  let query = client.from('subjects').select('*', { count: 'exact', head: false });
  query = applySupabaseFilters(query, filters, mapFilterKey);

  const { query: orderedQuery, safePage, safeLimit } = applySupabaseSortAndRange(
    query,
    options.sortBy,
    options.order,
    ['id', 'name', 'class_id', 'sub_code', 'created_at'],
    'created_at',
    options.page,
    options.limit
  );

  const response = await runQuery(orderedQuery);
  if (response?.error) {
    throw new AppError('Unable to fetch subjects', 500, response.error);
  }

  const data = (response.data || []).map((subject) => normalizeSubject(subject));
  const total = typeof response.count === 'number' ? response.count : data.length;

  return {
    success: true,
    page: safePage,
    limit: safeLimit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / safeLimit),
    data,
  };
};

const deleteSubject = async (id, user) => {
  const client = getSupabaseClient(user);

  if (!client) {
    if (!isDevelopmentMode()) {
      throw new AppError('Supabase client is not configured', 500);
    }

    const index = subjects.findIndex((subject) => subject.id === String(id));
    if (index === -1) {
      return null;
    }

    const [deleted] = subjects.splice(index, 1);
    return normalizeSubject(deleted);
  }

  const response = await runQuery(
    client.from('subjects').delete().eq('id', String(id)).select('*').single()
  );

  if (response?.error) {
    throw new AppError('Unable to delete subject', 500, response.error);
  }

  return response.data ? normalizeSubject(response.data) : null;
};

module.exports = {
  createSubject,
  updateSubject,
  getSubjectById,
  getAllSubjects,
  deleteSubject,
};
