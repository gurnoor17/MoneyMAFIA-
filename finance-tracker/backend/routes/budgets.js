const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const auth = require('../middleware/authMiddleware');

router.use(auth);

// @route   GET api/budgets
// @desc    Get budgets with spent sums
// @access  Private
router.get('/', budgetController.getBudgets);

// @route   POST api/budgets
// @desc    Add or Update budget
// @access  Private
router.post('/', budgetController.upsertBudget);

// @route   DELETE api/budgets/:id
// @desc    Delete budget
// @access  Private
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
