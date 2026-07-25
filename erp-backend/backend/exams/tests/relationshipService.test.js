const test = require('node:test');
const assert = require('node:assert/strict');

const relationshipService = require('../service/relationshipService');

const makeClient = ({ parentRows = [], classRows = [] } = {}) => ({
  from(table) {
    if (table === 'parent_students') {
      return {
        select() {
          return {
            eq(column, value) {
              if (column === 'parent_id') {
                return {
                  eq(nextColumn, nextValue) {
                    if (nextColumn === 'student_id') {
                      return {
                        maybeSingle: async () => {
                          const match = parentRows.find((row) => row.parent_id === value && row.student_id === nextValue);
                          return { data: match || null, error: null };
                        },
                      };
                    }

                    return {
                      maybeSingle: async () => ({ data: null, error: null }),
                    };
                  },
                  data: parentRows.filter((row) => row.parent_id === value).map((row) => ({ student_id: row.student_id })),
                  error: null,
                  maybeSingle: async () => {
                    const match = parentRows.find((row) => row.parent_id === value);
                    return { data: match || null, error: null };
                  },
                };
              }

              if (column === 'student_id') {
                return {
                  data: parentRows.filter((row) => row.parent_id === value).map((row) => ({ student_id: row.student_id })),
                  error: null,
                };
              }

              return {
                maybeSingle: async () => ({ data: null, error: null }),
              };
            },
          };
        },
      };
    }

    if (table === 'class_teachers') {
      return {
        select() {
          return {
            eq(column, value) {
              return {
                data: classRows.filter((row) => row.teacher_id === value).map((row) => ({ class_id: row.class_id })),
                error: null,
              };
            },
          };
        },
      };
    }

    return {
      select() {
        return {
          eq() {
            return {
              then: async (resolve) => resolve({ data: [], error: null }),
            };
          },
        };
      },
    };
  },
});

test('isParentOfStudent resolves ownership from parent_students', async () => {
  global.__examsRelationshipSupabaseClient = makeClient({
    parentRows: [{ parent_id: 'parent-1', student_id: 'student-1' }],
  });

  const result = await relationshipService.isParentOfStudent('parent-1', 'student-1');

  assert.equal(result, true);
});

test('getParentStudentIds returns the linked student IDs for a parent', async () => {
  global.__examsRelationshipSupabaseClient = makeClient({
    parentRows: [
      { parent_id: 'parent-1', student_id: 'student-1' },
      { parent_id: 'parent-1', student_id: 'student-2' },
      { parent_id: 'parent-2', student_id: 'student-3' },
    ],
  });

  const result = await relationshipService.getParentStudentIds('parent-1');

  assert.deepEqual(result, ['student-1', 'student-2']);
});

test('isTeacherAssignedToClass supports class_teachers lookups', async () => {
  global.__examsRelationshipSupabaseClient = makeClient({
    classRows: [{ teacher_id: 'teacher-1', class_id: 'class-7' }],
  });

  const result = await relationshipService.isTeacherAssignedToClass('teacher-1', 'class-7');

  assert.equal(result, true);
});
