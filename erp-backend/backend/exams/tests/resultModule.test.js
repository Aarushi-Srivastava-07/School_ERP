const test = require('node:test');
const assert = require('node:assert/strict');

const resultService = require('../service/resultService');
const resultRepository = require('../repository/resultRepository');
const relationshipService = require('../service/relationshipService');
const ROLES = require('../constants/roles');

const makeUser = (overrides = {}) => ({
  id: 'teacher-1',
  role: ROLES.TEACHER,
  ...overrides,
});

test('createResult normalizes legacy input to reporting-friendly fields', async () => {
  const created = await resultService.createResult(
    {
      studentId: 'student-1',
      teacherId: 'teacher-1',
      subject: 'math',
      exam_id: 'midterm',
      marks: 82,
      classId: 'class-7',
    },
    makeUser()
  );

  assert.equal(created.student_id, 'student-1');
  assert.equal(created.teacher_id, 'teacher-1');
  assert.equal(created.subject_id, 'math');
  assert.equal(created.exam_id, 'midterm');
  assert.equal(created.marks_obtained, 82);
  assert.equal(created.class_id, 'class-7');
  assert.equal(created.max_marks, 100);
  assert.equal(created.passing_marks, 33);
  assert.equal(created.status, 'pass');
});

test('createResult rejects marks that exceed max_marks', async () => {
  await assert.rejects(() =>
    resultService.createResult(
      {
        studentId: 'student-2',
        teacherId: 'teacher-1',
        subject: 'science',
    exam_id: 'final',
        marks_obtained: 120,
        max_marks: 100,
      },
      makeUser()
    )
  );
});

test('updateResult recomputes status when marks or thresholds change', async () => {
  const created = await resultService.createResult(
    {
      studentId: 'student-3',
      teacherId: 'teacher-1',
      subject: 'history',
      exam_id: 'quiz',
      marks_obtained: 60,
      max_marks: 100,
      passing_marks: 40,
      classId: 'class-7',
    },
    makeUser()
  );

  const updated = await resultService.updateResult(created.id, {
    marks_obtained: 35,
    passing_marks: 40,
  }, {
    user: makeUser(),
  });

  assert.equal(updated.status, 'fail');
});

test('getAllResults supports pagination, filtering and sorting', async () => {
  const response = await resultService.getAllResults(makeUser(), {
    filters: { classId: 'class-7' },
    sortBy: 'created_at',
    order: 'desc',
    page: 1,
    limit: 5,
  });

  assert.equal(response.page, 1);
  assert.equal(response.limit, 5);
  assert.equal(Array.isArray(response.data), true);
  assert.equal(response.total >= 0, true);
  assert.equal(response.totalPages >= 0, true);
});

test('getAllResults uses repository filters for student-scoped results', async () => {
  const originalFindAll = resultRepository.findAll;
  const originalFetchExamsByIds = relationshipService.fetchExamsByIds;
  const originalFetchSubjectsByIds = relationshipService.fetchSubjectsByIds;

  resultRepository.findAll = async (filters = {}) => {
    assert.deepEqual(filters, { student_id: 'student-1' });
    return {
      success: true,
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
      data: [{ id: 'result-1', student_id: 'student-1', teacher_id: 'teacher-1', class_id: 'class-7', status: 'pass' }],
    };
  };
  relationshipService.fetchExamsByIds = async () => [];
  relationshipService.fetchSubjectsByIds = async () => [];

  try {
    const response = await resultService.getAllResults({ id: 'student-1', role: ROLES.STUDENT }, { page: 1, limit: 10 });
    assert.equal(response.data.length, 1);
    assert.equal(response.data[0].id, 'result-1');
  } finally {
    resultRepository.findAll = originalFindAll;
    relationshipService.fetchExamsByIds = originalFetchExamsByIds;
    relationshipService.fetchSubjectsByIds = originalFetchSubjectsByIds;
  }
});

test('parent can view only their own children\'s results', async () => {
  const originalFindAll = resultRepository.findAll;
  const originalGetParentStudentIds = relationshipService.getParentStudentIds;

  resultRepository.findAll = async (filters = {}) => {
    const studentIds = Array.isArray(filters.student_id) ? filters.student_id : [filters.student_id];
    const rows = [
      { id: 'result-1', student_id: 'student-1', class_id: 'class-7', teacher_id: 'teacher-1', status: 'pass' },
      { id: 'result-2', student_id: 'student-2', class_id: 'class-8', teacher_id: 'teacher-2', status: 'fail' },
    ];

    return {
      data: rows.filter((row) => studentIds.includes(String(row.student_id))),
    };
  };
  relationshipService.getParentStudentIds = async () => ['student-1'];

  try {
    const response = await resultService.getAllResults({ id: 'parent-1', role: ROLES.PARENT }, { page: 1, limit: 10 });
    assert.equal(response.data.length, 1);
    assert.equal(response.data[0].id, 'result-1');
  } finally {
    resultRepository.findAll = originalFindAll;
    relationshipService.getParentStudentIds = originalGetParentStudentIds;
  }
});

test('parent cannot view another parent\'s child result', async () => {
  const originalFindById = resultRepository.findById;
  const originalGetParentStudentIds = relationshipService.getParentStudentIds;

  resultRepository.findById = async () => ({ id: 'result-2', student_id: 'student-2', class_id: 'class-8', teacher_id: 'teacher-2', status: 'fail' });
  relationshipService.getParentStudentIds = async () => ['student-1'];

  try {
    await assert.rejects(() => resultService.getResultById('result-2', { user: { id: 'parent-1', role: ROLES.PARENT } }));
  } finally {
    resultRepository.findById = originalFindById;
    relationshipService.getParentStudentIds = originalGetParentStudentIds;
  }
});

test('student cannot access another student\'s result', async () => {
  const originalFindById = resultRepository.findById;

  resultRepository.findById = async () => ({ id: 'result-2', student_id: 'student-2', class_id: 'class-8', teacher_id: 'teacher-2', status: 'fail' });

  try {
    await assert.rejects(() => resultService.getResultById('result-2', { user: { id: 'student-1', role: ROLES.STUDENT } }));
  } finally {
    resultRepository.findById = originalFindById;
  }
});

test('teacher cannot modify results outside assigned classes', async () => {
  const originalFindById = resultRepository.findById;
  const originalGetTeacherClassIds = relationshipService.getTeacherClassIds;
  const originalUpdate = resultRepository.update;

  resultRepository.findById = async () => ({ id: 'result-2', student_id: 'student-2', class_id: 'class-8', teacher_id: 'teacher-2', status: 'fail' });
  relationshipService.getTeacherClassIds = async () => ['class-7'];
  resultRepository.update = async () => ({ id: 'result-2', student_id: 'student-2', class_id: 'class-8', teacher_id: 'teacher-2', status: 'fail' });

  try {
    await assert.rejects(() => resultService.updateResult('result-2', { marks_obtained: 55 }, { user: { id: 'teacher-1', role: ROLES.TEACHER } }));
  } finally {
    resultRepository.findById = originalFindById;
    relationshipService.getTeacherClassIds = originalGetTeacherClassIds;
    resultRepository.update = originalUpdate;
  }
});

test('admin can access any result', async () => {
  const originalFindById = resultRepository.findById;

  resultRepository.findById = async () => ({ id: 'result-2', student_id: 'student-2', class_id: 'class-8', teacher_id: 'teacher-2', status: 'fail' });

  try {
    const result = await resultService.getResultById('result-2', { user: { id: 'admin-1', role: ROLES.ADMIN } });
    assert.equal(result.id, 'result-2');
  } finally {
    resultRepository.findById = originalFindById;
  }
});

test('principal can access any result', async () => {
  const originalFindById = resultRepository.findById;

  resultRepository.findById = async () => ({ id: 'result-2', student_id: 'student-2', class_id: 'class-8', teacher_id: 'teacher-2', status: 'fail' });

  try {
    const result = await resultService.getResultById('result-2', { user: { id: 'principal-1', role: ROLES.PRINCIPAL } });
    assert.equal(result.id, 'result-2');
  } finally {
    resultRepository.findById = originalFindById;
  }
});
 