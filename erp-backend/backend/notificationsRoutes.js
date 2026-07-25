const express = require('express');
const router = express.Router();
const { getNotifications } = require('./notificationsController');

router.get('/', getNotifications);

module.exports = router;
