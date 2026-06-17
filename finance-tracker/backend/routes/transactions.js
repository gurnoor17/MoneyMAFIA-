const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/authMiddleware');

// Protect all routes
router.use(auth);

// @route   GET api/transactions
// @desc    Get transactions
// @access  Private
router.get('/', transactionController.getTransactions);

// @route   GET api/transactions/export
// @desc    Export transactions to CSV
// @access  Private
router.get('/export', transactionController.exportCSV);

// @route   POST api/transactions
// @desc    Add transaction
// @access  Private
router.post('/', transactionController.addTransaction);

// @route   PUT api/transactions/:id
// @desc    Update transaction
// @access  Private
router.put('/:id', transactionController.updateTransaction);

// @route   DELETE api/transactions/:id
// @desc    Delete transaction
// @access  Private
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
