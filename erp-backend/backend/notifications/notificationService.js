const store = require('./notificationStore');
const { getClientForUser } = require('../services/database.service');

const staffRoles = ['admin', 'teacher'];
const allowedTargetAudiences = ['students', 'teachers', 'parents', 'all', 'class'];
const allowedTypes = ['general', 'announcement', 'reminder', 'alert'];

function cleanText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function hasHtmlTag(value) {
  const s = String(value || '');
  return s.includes('<') || s.includes('>');
}

function readUser(req) {
  return req.user || req.currentUser || {};
}

function readToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : header;
}

async function resolveRealRole(user, token) {
  const userId = user.id || user._id;
  if (!userId || !token) {
    return String(user.role || '').toLowerCase();
  }

  const supabase = getClientForUser(token);
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) {
    return String(user.role || '').toLowerCase();
  }

  return String(data.role || '').toLowerCase();
}

async function requireStaff(user, token) {
  const role = await resolveRealRole(user, token);

  if (!staffRoles.includes(role)) {
    const error = new Error('Only admins and teachers can create or send notifications.');
    error.statusCode = 403;
    throw error;
  }

  return role;
}

function validatePayload(payload) {
  const title = cleanText(payload.title);
  const message = cleanText(payload.message);
  const type = payload.type ? String(payload.type).toLowerCase().trim() : 'general';
  const targetAudience = payload.targetAudience
    ? String(payload.targetAudience).toLowerCase().trim()
    : '';
  const classId = payload.classId || null;

  if (!title) {
    const error = new Error('Notification title is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!message) {
    const error = new Error('Notification message is required.');
    error.statusCode = 400;
    throw error;
  }

  if (hasHtmlTag(title) || hasHtmlTag(message)) {
    const error = new Error('Title and message cannot contain HTML or script tags.');
    error.statusCode = 400;
    throw error;
  }

  if (!allowedTypes.includes(type)) {
    const error = new Error(
      'Notification type must be one of: ' + allowedTypes.join(', ') + '.'
    );
    error.statusCode = 400;
    throw error;
  }

  if (!allowedTargetAudiences.includes(targetAudience)) {
    const error = new Error(
      'targetAudience must be one of: ' + allowedTargetAudiences.join(', ') + '.'
    );
    error.statusCode = 400;
    throw error;
  }

  if (targetAudience === 'class' && !classId) {
    const error = new Error('classId is required when targetAudience is "class".');
    error.statusCode = 400;
    throw error;
  }

  return { title, message, type, targetAudience, classId };
}

async function createNotification(payload, user, token) {
  const role = await requireStaff(user, token);

  const notification = validatePayload(payload);

  if (role === 'teacher' && notification.targetAudience === 'all') {
    const error = new Error('Teachers cannot send notifications to all users. Use class audience instead.');
    error.statusCode = 403;
    throw error;
  }

  return store.addNotification({
    ...notification,
    createdBy: user.id || user._id,
  }, token);
}

async function sendNotification(id, user, token) {
  await requireStaff(user, token);

  const notification = await store.findNotification(id, token);

  if (!notification) {
    const error = new Error('Notification not found.');
    error.statusCode = 404;
    throw error;
  }

  if (notification.status === 'sent') {
    const error = new Error('Notification is already sent.');
    error.statusCode = 409;
    throw error;
  }

  const recipientIds = await store.resolveRecipientIds(notification, token);
  await store.insertRecipients(id, recipientIds, token);

  return store.updateNotification(id, {
    status: 'sent',
    sentAt: new Date().toISOString(),
  }, token);
}

async function createAndSendNotification(payload, user, token) {
  const notification = await createNotification(payload, user, token);
  return sendNotification(notification.id, user, token);
}

async function updateAnnouncement(id, payload, user, token) {
  await requireStaff(user, token);

  const existing = await store.findNotification(id, token);

  if (!existing || existing.type !== 'announcement') {
    const error = new Error('Announcement not found.');
    error.statusCode = 404;
    throw error;
  }

  if (existing.status === 'sent') {
    const error = new Error('Sent announcements cannot be edited.');
    error.statusCode = 409;
    throw error;
  }

  const updated = validatePayload({
    ...existing,
    ...payload,
    type: 'announcement',
  });

  return store.updateNotification(id, updated, token);
}

async function deleteAnnouncement(id, user, token) {
  await requireStaff(user, token);

  const existing = await store.findNotification(id, token);

  if (!existing || existing.type !== 'announcement') {
    const error = new Error('Announcement not found.');
    error.statusCode = 404;
    throw error;
  }

  return store.removeNotification(id, token);
}

function notificationHistory(query, token) {
  return store.listNotifications({
    status: query.status,
    type: query.type,
  }, token);
}

async function notificationsForUser(user, token) {
  const userId = user.id || user._id;
  return store.listForUser(userId, token);
}

module.exports = {
  createAndSendNotification,
  createNotification,
  deleteAnnouncement,
  notificationHistory,
  notificationsForUser,
  readUser,
  readToken,
  sendNotification,
  updateAnnouncement,
};