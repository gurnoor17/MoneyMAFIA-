const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/authMiddleware');

router.use(auth);

// @route   GET api/dashboard/summary
// @desc    Get dashboard metrics (Balance, totals, budget progress)
router.get('/summary', dashboardController.getSummary);

// @route   GET api/dashboard/charts
// @desc    Get chart datasets and spending averages
router.get('/charts', dashboardController.getChartData);

// @route   GET api/dashboard/insights
// @desc    Get rule-based spending suggestions
router.get('/insights', dashboardController.getInsights);

// @route   GET api/dashboard/notifications
// @desc    Get unread alerts
router.get('/notifications', dashboardController.getNotifications);

// @route   PUT api/dashboard/notifications/read-all
// @desc    Mark alerts as read
router.put('/notifications/read-all', dashboardController.readAllNotifications);

module.exports = router;
