const AppError = require('../errors/AppError');
const { getSupabaseClient, runQuery } = require('../utils/supabaseClient');
const {
  applyMemoryFilters,
  sortRows,
  paginateRows,
  applySupabaseFilters,
  applySupabaseSortAndRange,
} = require('../utils/queryUtils');

let exams = [];
let nextId = 1;

const isDevelopmentMode = () => process.env.NODE_ENV !== 'production';

const normalizeExam = (exam) => {
  if (!exam || typeof exam !== 'object') {
    return null;
  }

  return {
    id: String(exam.id),
    name: exam.name,
    term: exam.term,
    academic_year: exam.academic_year ?? exam.academicYear,
    class_id: exam.class_id ?? exam.classId,
    created_at: exam.created_at ?? exam.createdAt ?? new Date().toISOString(),
  };
};

const mapFilterKey = (key) => {
  const map = {
    classId: 'class_id',
    academicYear: 'academic_year',
  };

  return map[key] || key;
};

const createExam = async (examData, user) => {
  const client = getSupabaseClient(user);

  if (!client) {
    if (!isDevelopmentMode()) {
      throw new AppError('Supabase client is not configured', 500);
    }

    const exam = normalizeExam({
      id: String(nextId++),
      ...examData,
      created_at: new Date().toISOString(),
    });

    exams.push(exam);
    return exam;
  }

  const response = await runQuery(
    client.from('exams').insert(examData).select('*').single()
  );

  if (response?.error) {
    throw new AppError('Unable to create exam', 500, response.error);
  }

  return normalizeExam(response.data);
};

const updateExam = async (id, updates, user) => {
  const client = getSupabaseClient(user);

  if (!client) {
    if (!isDevelopmentMode()) {
      throw new AppError('Supabase client is not configured', 500);
    }

    const index = exams.findIndex((exam) => exam.id === String(id));
    if (index === -1) {
      return null;
    }

    const updated = normalizeExam({
      ...exams[index],
      ...updates,
    });

    exams[index] = updated;
    return updated;
  }

  const response = await runQuery(
    client.from('exams').update(updates).eq('id', String(id)).select('*').single()
  );

  if (response?.error) {
    throw new AppError('Unable to update exam', 500, response.error);
  }

  return response.data ? normalizeExam(response.data) : null;
};

const getExamById = async (id, user) => {
  const client = getSupabaseClient(user);

  if (!client) {
    if (!isDevelopmentMode()) {
      throw new AppError('Supabase client is not configured', 500);
    }

    const exam = exams.find((item) => item.id === String(id));
    return exam ? normalizeExam(exam) : null;
  }

  const response = await runQuery(
    client.from('exams').select('*').eq('id', String(id)).maybeSingle()
  );

  if (response?.error) {
    throw new AppError('Unable to fetch exam', 500, response.error);
  }

  return response.data ? normalizeExam(response.data) : null;
};

const getAllExams = async (filters = {}, options = {}, user) => {
  const client = getSupabaseClient(user);
  const allowedColumns = ['id', 'name', 'term', 'academic_year', 'class_id', 'created_at'];

  if (!client) {
    if (!isDevelopmentMode()) {
      throw new AppError('Supabase client is not configured', 500);
    }

    const allExams = exams.map((exam) => normalizeExam(exam));
    const filtered = applyMemoryFilters(allExams, filters, mapFilterKey);
    const sorted = sortRows(filtered, options.sortBy, options.order, allowedColumns, 'created_at');
    return paginateRows(sorted, options.page, options.limit);
  }

  let query = client.from('exams').select('*', { count: 'exact', head: false });
  query = applySupabaseFilters(query, filters, mapFilterKey);
  const { query: orderedQuery, safePage, safeLimit } = applySupabaseSortAndRange(
    query,
    options.sortBy,
    options.order,
    allowedColumns,
    'created_at',
    options.page,
    options.limit
  );

  const response = await runQuery(orderedQuery);
  if (response?.error) {
    throw new AppError('Unable to fetch exams', 500, response.error);
  }

  const data = (response.data || []).map((exam) => normalizeExam(exam));
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

const deleteExam = async (id, user) => {
  const client = getSupabaseClient(user);

  if (!client) {
    if (!isDevelopmentMode()) {
      throw new AppError('Supabase client is not configured', 500);
    }

    const index = exams.findIndex((exam) => exam.id === String(id));
    if (index === -1) {
      return null;
    }

    const [deleted] = exams.splice(index, 1);
    return normalizeExam(deleted);
  }

  const response = await runQuery(
    client.from('exams').delete().eq('id', String(id)).select('*').single()
  );

  if (response?.error) {
    throw new AppError('Unable to delete exam', 500, response.error);
  }

  return response.data ? normalizeExam(response.data) : null;
};

module.exports = {
  createExam,
  updateExam,
  getExamById,
  getAllExams,
  deleteExam,
};
