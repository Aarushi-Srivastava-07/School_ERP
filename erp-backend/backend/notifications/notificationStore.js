const { getClientForUser } = require('../services/database.service');

function toCamel(row) {
  if (!row) return row;
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    targetAudience: row.target_audience,
    classId: row.class_id,
    createdBy: row.created_by,
    createdAt: row.created_at,
    status: row.status,
    sentAt: row.sent_at,
  };
}

async function addNotification(data, token) {
  const supabase = getClientForUser(token);
  const { data: row, error } = await supabase
    .from('notifications')
    .insert({
      type: data.type,
      title: data.title,
      message: data.message,
      target_audience: data.targetAudience,
      class_id: data.classId || null,
      created_by: data.createdBy,
      status: 'draft',
    })
    .select()
    .single();

  if (error) throw error;
  return toCamel(row);
}

async function findNotification(id, token) {
  const supabase = getClientForUser(token);
  const { data: row, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return toCamel(row);
}

async function updateNotification(id, changes, token) {
  const supabase = getClientForUser(token);
  const updateRow = {};

  if (changes.title !== undefined) updateRow.title = changes.title;
  if (changes.message !== undefined) updateRow.message = changes.message;
  if (changes.targetAudience !== undefined) updateRow.target_audience = changes.targetAudience;
  if (changes.classId !== undefined) updateRow.class_id = changes.classId;
  if (changes.status !== undefined) updateRow.status = changes.status;
  if (changes.sentAt !== undefined) updateRow.sent_at = changes.sentAt;

  const { data: row, error } = await supabase
    .from('notifications')
    .update(updateRow)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return toCamel(row);
}

async function removeNotification(id, token) {
  const supabase = getClientForUser(token);
  const { data: row, error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return toCamel(row);
}

async function listNotifications(filters = {}, token) {
  const supabase = getClientForUser(token);
  let query = supabase.from('notifications').select('*');

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.type) query = query.eq('type', filters.type);

  const { data: rows, error } = await query;
  if (error) throw error;
  return rows.map(toCamel);
}

async function resolveRecipientIds(notification, token) {
  const supabase = getClientForUser(token);
  const audience = notification.targetAudience;

  if (audience === 'all') {
    const { data, error } = await supabase.from('users').select('id');
    if (error) throw error;
    return data.map((u) => u.id);
  }

  if (audience === 'students' || audience === 'teachers' || audience === 'parents') {
    const role = audience.slice(0, -1);
    const { data, error } = await supabase.from('users').select('id').eq('role', role);
    if (error) throw error;
    return data.map((u) => u.id);
  }

  if (audience === 'class' && notification.classId) {
    const { data: attendanceStudents, error: err1 } = await supabase
      .from('attendance_records')
      .select('student_id')
      .eq('class_id', notification.classId);

    const { data: teacherRows, error: err2 } = await supabase
      .from('class_teachers')
      .select('teacher_id')
      .eq('class_id', notification.classId);

    if (err1) throw err1;
    if (err2) throw err2;

    const studentIds = [...new Set((attendanceStudents || []).map((r) => r.student_id))];
    const teacherIds = [...new Set((teacherRows || []).map((r) => r.teacher_id))];

    return [...new Set([...studentIds, ...teacherIds])];
  }

  return [];
}

async function insertRecipients(notificationId, recipientIds, token) {
  if (!recipientIds.length) return [];

  const supabase = getClientForUser(token);
  const rows = recipientIds.map((recipientId) => ({
    notification_id: notificationId,
    recipient_id: recipientId,
  }));

  const { error } = await supabase
    .from('notification_recipients')
    .insert(rows);

  if (error) throw error;
  return rows;
}

async function listForUser(userId, token) {
  const supabase = getClientForUser(token);
  const { data, error } = await supabase
    .from('notification_recipients')
    .select('read_at, delivered_at, notifications(*)')
    .eq('recipient_id', userId);

  if (error) throw error;

  return (data || []).map((row) => ({
    ...toCamel(row.notifications),
    readAt: row.read_at,
    deliveredAt: row.delivered_at,
  }));
}

module.exports = {
  addNotification,
  findNotification,
  updateNotification,
  removeNotification,
  listNotifications,
  resolveRecipientIds,
  insertRecipients,
  listForUser,
};