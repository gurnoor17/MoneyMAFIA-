const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const auth = require('../middleware/authMiddleware');
const { validateLoan } = require('../validators/loanValidator');

// Protect all routes with auth middleware
router.use(auth);

// @route   GET api/loans
// @desc    Get all loans for user
// @access  Private
router.get('/', loanController.getLoans);

// @route   GET api/loans/:id
// @desc    Get details of a specific loan with payment schedule
// @access  Private
router.get('/:id', loanController.getLoanById);

// @route   POST api/loans
// @desc    Create a new loan
// @access  Private
router.post('/', validateLoan, loanController.createLoan);

// @route   POST api/loans/payment/:paymentId
// @desc    Pay an EMI installment
// @access  Private
router.post('/payment/:paymentId', loanController.payLoanEmi);

// @route   DELETE api/loans/:id
// @desc    Delete a loan
// @access  Private
router.delete('/:id', loanController.deleteLoan);

module.exports = router;
