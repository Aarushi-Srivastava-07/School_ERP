const express = require('express');
const { authenticateToken } = require('../auth/middleware/auth.middleware');
const controller = require('./notificationController');

const router = express.Router();

router.post('/', authenticateToken, controller.createNotification);
router.post('/send', authenticateToken, controller.createAndSendNotification);
router.post('/:id/send', authenticateToken, controller.sendNotification);

router.get('/history', authenticateToken, controller.notificationHistory);
router.get('/me', authenticateToken, controller.myNotifications);

// Alias so GET /api/notifications behaves like GET /api/notifications/me,
// matching the convention used by assignments/exams/users.
router.get('/', authenticateToken, controller.myNotifications);

router.patch('/announcements/:id', authenticateToken, controller.updateAnnouncement);
router.delete('/announcements/:id', authenticateToken, controller.deleteAnnouncement);

module.exports = router;