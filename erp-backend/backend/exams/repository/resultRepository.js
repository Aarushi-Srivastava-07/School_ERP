const AppError = require('../errors/AppError');
const { normalizeResultShape } = require('../utils/resultUtils');
const { getSupabaseClient, runQuery } = require('../utils/supabaseClient');
const {
  applyMemoryFilters,
  sortRows,
  paginateRows,
  applySupabaseFilters,
  applySupabaseSortAndRange,
} = require('../utils/queryUtils');

let results = [];
let nextId = 1;

const normalizeResult = (result) => normalizeResultShape(result);
const isDevelopmentMode = () => process.env.NODE_ENV !== 'production';

const mapFilterKey = (key) => {
  const map = {
    studentId: 'student_id',
    teacherId: 'teacher_id',
    classId: 'class_id',
    examId: 'exam_id',
    subjectId: 'subject_id',
    status: 'status',
  };

  return map[key] || key;
};


const create = async (resultData, user) => {
  const client = getSupabaseClient(user);
  if (!client) {
    if (!isDevelopmentMode()) {
      throw new AppError('Supabase client is not configured', 500);
    }

    const result = normalizeResult({
      id: String(nextId++),
      ...resultData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    results.push(result);
    return result;
  }

  const response = await runQuery(
    client.from('exam_marks')
      .insert(resultData)
      .select('*')
      .single()
  );

  if (response?.error) {
    throw new AppError('Unable to create result', 500, response.error);
  }

  return normalizeResult(response.data);
};

const update = async (id, updates, user) => {
  const client = getSupabaseClient(user);
  if (!client) {
    if (!isDevelopmentMode()) {
      throw new AppError('Supabase client is not configured', 500);
    }

    const index = results.findIndex((result) => result.id === String(id));
    if (index === -1) {
      return null;
    }

    const existingResult = results[index];
    const updatedResult = normalizeResult({
      ...existingResult,
      ...updates,
      updated_at: new Date().toISOString(),
    });

    results[index] = updatedResult;
    return updatedResult;
  }

  const response = await runQuery(
    client.from('exam_marks')
      .update(updates)
      .eq('id', String(id))
      .select('*')
      .single()
  );

  if (response?.error) {
    throw new AppError('Unable to update result', 500, response.error);
  }

  return response.data ? normalizeResult(response.data) : null;
};

const findById = async (id, user) => {
  const client = getSupabaseClient(user);
  if (!client) {
    if (!isDevelopmentMode()) {
      throw new AppError('Supabase client is not configured', 500);
    }

    const result = results.find((item) => item.id === String(id));
    return result ? normalizeResult(result) : null;
  }

  const response = await runQuery(
    client.from('exam_marks')
      .select('*')
      .eq('id', String(id))
      .maybeSingle()
  );

  if (response?.error) {
    throw new AppError('Unable to fetch result', 500, response.error);
  }

  return response.data ? normalizeResult(response.data) : null;
};

const findAll = async (filters = {}, options = {}, user) => {
  const client = getSupabaseClient(user);
  if (!client) {
    if (!isDevelopmentMode()) {
      throw new AppError('Supabase client is not configured', 500);
    }

    const allResults = (results || []).map((result) => normalizeResult(result));
    const filteredResults = applyMemoryFilters(allResults, filters, mapFilterKey);
    const sortedResults = sortRows(filteredResults, options.sortBy, options.order, ['id', 'student_id', 'teacher_id', 'class_id', 'exam_id', 'subject_id', 'marks_obtained', 'max_marks', 'passing_marks', 'status', 'created_at', 'updated_at'], 'created_at');
    return paginateRows(sortedResults, options.page, options.limit);
  }

  let query = client.from('exam_marks').select('*', { count: 'exact', head: false });
  query = applySupabaseFilters(query, filters, mapFilterKey);

  const { query: orderedQuery, safePage, safeLimit } = applySupabaseSortAndRange(
    query,
    options.sortBy,
    options.order,
    ['id', 'student_id', 'teacher_id', 'class_id', 'exam_id', 'subject_id', 'marks_obtained', 'max_marks', 'passing_marks', 'status', 'created_at', 'updated_at'],
    'created_at',
    options.page,
    options.limit
  );

  const response = await runQuery(orderedQuery);
  if (response?.error) {
    throw new AppError('Unable to fetch results', 500, response.error);
  }

  const data = (response.data || []).map((result) => normalizeResult(result));
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

module.exports = {
  create,
  update,
  findById,
  findAll,
};
