const express = require('express');
const { getDashboardStats } = require('./dashboardController');

const router = express.Router();

router.get('/stats', getDashboardStats);

module.exports = router;
