const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../validators/authValidator');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', validateRegister, authController.register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', validateLogin, authController.login);

// @route   GET api/auth/me
// @desc    Get current user details
// @access  Private
router.get('/me', auth, authController.getMe);

module.exports = router;
