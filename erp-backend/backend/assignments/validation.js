function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function cleanText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function isValidUUID(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || '')
  );
}

function validateAssignment(payload = {}) {
  const title = cleanText(payload.title);
  const description = cleanText(payload.description);
  const subject = cleanText(payload.subject);

  const classId = cleanText(payload.classId);
  const className = cleanText(payload.className);

  const dueDate = String(payload.dueDate || '').trim();

  if (!title) {
    throw createError(400, 'Assignment title is required.');
  }

  if (!description) {
    throw createError(400, 'Assignment description is required.');
  }

  if (!subject) {
    throw createError(400, 'Subject is required.');
  }

  // Transition support
  if (!classId && !className) {
    throw createError(
      400,
      'Either classId or className is required.'
    );
  }

  if (classId && !isValidUUID(classId)) {
    throw createError(400, 'Invalid class ID.');
  }

  if (!dueDate) {
    throw createError(400, 'Due date is required.');
  }

  const due = new Date(dueDate);

  if (Number.isNaN(due.getTime())) {
    throw createError(400, 'Invalid due date.');
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  if (due < today) {
    throw createError(
      400,
      'Due date cannot be in the past.'
    );
  }

  return {
    title,
    description,
    subject,
    classId: classId || null,
    className: className || null,
    dueDate,
  };
}

module.exports = {
  validateAssignment,
};