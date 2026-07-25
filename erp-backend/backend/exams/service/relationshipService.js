const AppError = require('../errors/AppError');
const { getSupabaseClient, runQuery } = require('../utils/supabaseClient');
const { normalizeIds } = require('../utils/queryUtils');

const getCacheTtlMs = () => Number(process.env.EXAMS_METADATA_CACHE_TTL_MS || 300000);

const cache = {
  exams: new Map(),
  subjects: new Map(),
};

const getCachedValue = (cacheStore, id) => {
  const entry = cacheStore.get(id);
  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(id);
    return null;
  }

  return entry.value;
};

const setCachedValue = (cacheStore, id, value) => {
  cacheStore.set(id, {
    value,
    expiresAt: Date.now() + getCacheTtlMs(),
  });
};

const fetchRowsByIds = async (table, ids, selectColumns, user) => {
  const client = getSupabaseClient(user);
  if (!client) {
    return null;
  }

  const normalizedIds = normalizeIds(ids);
  if (normalizedIds.length === 0) {
    return [];
  }

  const response = await runQuery(
    client.from(table)
      .select(selectColumns)
      .in('id', normalizedIds)
  );

  if (response?.error) {
    const message = String(response.error?.message || '').toLowerCase();
    if (message.includes('does not exist') || message.includes('relation') || message.includes('not found')) {
      return [];
    }

    throw new AppError(`Unable to fetch ${table} metadata`, 500, response.error);
  }

  return response?.data || [];
};

const fetchExamsByIds = async (ids, user) => {
  const normalizedIds = normalizeIds(ids);
  const cachedResults = normalizedIds
    .map((id) => getCachedValue(cache.exams, id))
    .filter((value) => value !== null);
  const missingIds = normalizedIds.filter((id) => getCachedValue(cache.exams, id) === null);

  const fetchedResults = missingIds.length > 0
    ? await fetchRowsByIds('exams', missingIds, 'id,name,term,academic_year,class_id', user)
    : [];
  if (fetchedResults === null) {
    return null;
  }

  for (const exam of fetchedResults) {
    setCachedValue(cache.exams, String(exam.id), exam);
  }

  return [...cachedResults, ...fetchedResults];
};

const fetchSubjectsByIds = async (ids, user) => {
  const normalizedIds = normalizeIds(ids);
  const cachedResults = normalizedIds
    .map((id) => getCachedValue(cache.subjects, id))
    .filter((value) => value !== null);
  const missingIds = normalizedIds.filter((id) => getCachedValue(cache.subjects, id) === null);

  const fetchedResults = missingIds.length > 0
    ? await fetchRowsByIds('subjects', missingIds, 'id,name,class_id,sub_code', user)
    : [];
  if (fetchedResults === null) {
    return null;
  }

  for (const subject of fetchedResults) {
    setCachedValue(cache.subjects, String(subject.id), subject);
  }

  return [...cachedResults, ...fetchedResults];
};

const isParentOfStudent = async (parentId, studentId, user) => {
  if (!parentId || !studentId) {
    throw new AppError('Invalid parent/student identifiers', 400);
  }

  const client = getSupabaseClient(user);
  if (!client) {
    return false;
  }

  const response = await runQuery(
    client.from('parent_students')
      .select('id')
      .eq('parent_id', parentId)
      .eq('student_id', studentId)
      .maybeSingle()
  );

  if (response?.error) {
    throw new AppError('Unable to resolve parent-student relationship', 500, response.error);
  }

  return Boolean(response?.data);
};

const getParentStudentIds = async (parentId, user) => {
  if (!parentId) {
    throw new AppError('Invalid parent identifier', 400);
  }

  const client = getSupabaseClient(user);
  if (!client) {
    return [];
  }

  const response = await runQuery(
    client.from('parent_students')
      .select('student_id')
      .eq('parent_id', parentId)
  );

  if (response?.error) {
    throw new AppError('Unable to fetch parent-student relationships', 500, response.error);
  }

  return (response?.data || [])
    .map((row) => row?.student_id)
    .filter((value) => value !== null && value !== undefined)
    .map((value) => String(value));
};

const getTeacherClassIds = async (teacherId, user) => {
  if (!teacherId) {
    throw new AppError('Invalid teacher identifier', 400);
  }

  const client = getSupabaseClient(user);
  if (!client) {
    return [];
  }

  const response = await runQuery(
    client.from('class_teachers')
      .select('class_id')
      .eq('teacher_id', teacherId)
  );

  if (response?.error) {
    const message = String(response.error?.message || '').toLowerCase();
    if (message.includes('does not exist') || message.includes('relation') || message.includes('not found')) {
      return [];
    }

    throw new AppError('Unable to fetch teacher-class relationships', 500, response.error);
  }

  return (response?.data || [])
    .map((row) => row?.class_id)
    .filter((value) => value !== null && value !== undefined)
    .map((value) => String(value));
};

const isTeacherAssignedToClass = async (teacherId, classId, user) => {
  if (!teacherId || !classId) {
    return false;
  }

  const teacherClassIds = await getTeacherClassIds(teacherId, user);
  return teacherClassIds.includes(String(classId));
};

const invalidateExamCache = (id) => {
  if (!id) return;
  cache.exams.delete(String(id));
};

const invalidateSubjectCache = (id) => {
  if (!id) return;
  cache.subjects.delete(String(id));
};

module.exports = {
  isParentOfStudent,
  getParentStudentIds,
  getTeacherClassIds,
  isTeacherAssignedToClass,
  fetchExamsByIds,
  fetchSubjectsByIds,
  invalidateExamCache,
  invalidateSubjectCache,
};
