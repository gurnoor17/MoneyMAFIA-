const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/authMiddleware');

router.use(auth);

// @route   GET api/profile/summary
// @desc    Get profile details and stats
router.get('/summary', profileController.getSummary);

// @route   PUT api/profile
// @desc    Update name & email
router.put('/', profileController.updateProfile);

// @route   PUT api/profile/change-password
// @desc    Change password
router.put('/change-password', profileController.changePassword);

// @route   DELETE api/profile
// @desc    Delete user account
router.delete('/', profileController.deleteAccount);

module.exports = router;
