const service = require('./notificationService');

function sendResponse(res, statusCode, data) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

function handleError(res, error) {
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Something went wrong.',
  });
}

async function createNotification(req, res) {
  try {
    const user = service.readUser(req);
    const token = service.readToken(req);
    const notification = await service.createNotification(req.body, user, token);

    return sendResponse(res, 201, notification);
  } catch (error) {
    return handleError(res, error);
  }
}

async function sendNotification(req, res) {
  try {
    const user = service.readUser(req);
    const token = service.readToken(req);
    const notification = await service.sendNotification(req.params.id, user, token);

    return sendResponse(res, 200, notification);
  } catch (error) {
    return handleError(res, error);
  }
}

async function createAndSendNotification(req, res) {
  try {
    const user = service.readUser(req);
    const token = service.readToken(req);
    const notification = await service.createAndSendNotification(req.body, user, token);

    return sendResponse(res, 201, notification);
  } catch (error) {
    return handleError(res, error);
  }
}

async function notificationHistory(req, res) {
  try {
    const token = service.readToken(req);
    const history = await service.notificationHistory(req.query, token);

    return sendResponse(res, 200, history);
  } catch (error) {
    return handleError(res, error);
  }
}

async function myNotifications(req, res) {
  try {
    const user = service.readUser(req);
    const token = service.readToken(req);
    const notifications = await service.notificationsForUser(user, token);

    return sendResponse(res, 200, notifications);
  } catch (error) {
    return handleError(res, error);
  }
}

async function updateAnnouncement(req, res) {
  try {
    const user = service.readUser(req);
    const token = service.readToken(req);
    const announcement = await service.updateAnnouncement(req.params.id, req.body, user, token);

    return sendResponse(res, 200, announcement);
  } catch (error) {
    return handleError(res, error);
  }
}

async function deleteAnnouncement(req, res) {
  try {
    const user = service.readUser(req);
    const token = service.readToken(req);
    const announcement = await service.deleteAnnouncement(req.params.id, user, token);

    return sendResponse(res, 200, announcement);
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  createAndSendNotification,
  createNotification,
  deleteAnnouncement,
  myNotifications,
  notificationHistory,
  sendNotification,
  updateAnnouncement,
};