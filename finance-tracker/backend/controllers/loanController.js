const db = require('../config/db');
const { generatePaymentSchedule } = require('../services/emiService');

// @route   POST api/loans
// @desc    Create a new loan and its payment schedule
// @access  Private
exports.createLoan = async (req, res) => {
  const userId = req.user.id;
  const { loan_name, principal, interest_rate, duration_months, start_date } = req.body;

  const p = parseFloat(principal);
  const rate = parseFloat(interest_rate);
  const months = parseInt(duration_months, 10);

  const client = await db.pool.connect();

  try {
    const { emi, totalPayment, totalInterest, schedule } = generatePaymentSchedule(p, rate, months, start_date);

    await client.query('BEGIN');

    // 1. Insert loan
    const loanInsertQuery = `
      INSERT INTO loans (
        user_id, loan_name, principal, interest_rate, duration_months, 
        emi, total_interest, total_payment, remaining_balance, paid_emis, total_emis, start_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, $10, $11)
      RETURNING *
    `;

    const loanResult = await client.query(loanInsertQuery, [
      userId, loan_name.trim(), p, rate, months, emi, totalInterest, totalPayment, totalPayment, months, start_date
    ]);

    const newLoan = loanResult.rows[0];

    // 2. Generate and insert payment schedule
    const paymentPromises = [];
    schedule.forEach((inst) => {
      const paymentQuery = `
        INSERT INTO loan_payments (loan_id, emi_number, due_date, amount, status)
        VALUES ($1, $2, $3, $4, 'PENDING')
      `;
      paymentPromises.push(client.query(paymentQuery, [newLoan.id, inst.emiNumber, inst.dueDate, inst.amount]));
    });

    await Promise.all(paymentPromises);
    await client.query('COMMIT');

    res.status(201).json(newLoan);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create loan error:', err.message);
    res.status(500).json({ message: 'Server error creating loan' });
  } finally {
    client.release();
  }
};

// @route   GET api/loans
// @desc    Get all loans for the logged-in user
// @access  Private
exports.getLoans = async (req, res) => {
  const userId = req.user.id;

  try {
    const query = `
      SELECT * FROM loans 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Get loans error:', err.message);
    res.status(500).json({ message: 'Server error retrieving loans' });
  }
};

// @route   GET api/loans/:id
// @desc    Get details of a specific loan and its payment schedule
// @access  Private
exports.getLoanById = async (req, res) => {
  const userId = req.user.id;
  const loanId = req.params.id;

  try {
    const loanQuery = `
      SELECT * FROM loans 
      WHERE id = $1 AND user_id = $2
    `;
    const loanResult = await db.query(loanQuery, [loanId, userId]);

    if (loanResult.rows.length === 0) {
      return res.status(404).json({ message: 'Loan not found or unauthorized' });
    }

    const loan = loanResult.rows[0];

    const paymentsQuery = `
      SELECT * FROM loan_payments 
      WHERE loan_id = $1 
      ORDER BY emi_number ASC
    `;
    const paymentsResult = await db.query(paymentsQuery, [loanId]);

    loan.payments = paymentsResult.rows;

    res.json(loan);
  } catch (err) {
    console.error('Get loan by id error:', err.message);
    res.status(500).json({ message: 'Server error retrieving loan details' });
  }
};

// @route   POST api/loans/payment/:paymentId
// @desc    Pay a specific EMI installment
// @access  Private
exports.payLoanEmi = async (req, res) => {
  const userId = req.user.id;
  const paymentId = req.params.paymentId;
  const paymentDate = req.body.payment_date || new Date().toISOString().split('T')[0];

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Fetch the payment record and verify ownership
    const paymentCheckQuery = `
      SELECT lp.*, l.user_id, l.loan_name, l.paid_emis, l.total_emis, l.remaining_balance
      FROM loan_payments lp
      JOIN loans l ON lp.loan_id = l.id
      WHERE lp.id = $1 AND l.user_id = $2
    `;
    const paymentCheckResult = await client.query(paymentCheckQuery, [paymentId, userId]);

    if (paymentCheckResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'EMI payment record not found or unauthorized' });
    }

    const payment = paymentCheckResult.rows[0];

    if (payment.status === 'PAID') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'This EMI installment is already paid' });
    }

    // Verify sequential payment order and due date validation
    const firstUnpaidQuery = `
      SELECT id, emi_number, due_date::TEXT as due_date_str 
      FROM loan_payments 
      WHERE loan_id = $1 AND status = 'PENDING' 
      ORDER BY emi_number ASC 
      LIMIT 1
    `;
    const firstUnpaidResult = await client.query(firstUnpaidQuery, [payment.loan_id]);

    if (firstUnpaidResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'No pending EMI installments found for this loan' });
    }

    const firstUnpaid = firstUnpaidResult.rows[0];

    if (firstUnpaid.id !== payment.id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: `Please pay EMI installments in sequential order. Next due is EMI #${firstUnpaid.emi_number}.` });
    }

    if (firstUnpaid.due_date_str > paymentDate) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: `EMI #${firstUnpaid.emi_number} is not due yet. Its due date is ${firstUnpaid.due_date_str}.` });
    }

    const amountPaid = parseFloat(payment.amount);
    const newPaidEmis = payment.paid_emis + 1;
    const newRemainingBalance = Math.max(0, parseFloat(payment.remaining_balance) - amountPaid);
    const newStatus = newPaidEmis >= payment.total_emis ? 'COMPLETED' : 'ACTIVE';

    // 2. Update the loan_payments status to PAID
    await client.query(
      `UPDATE loan_payments 
       SET status = 'PAID', payment_date = $1 
       WHERE id = $2`,
      [paymentDate, paymentId]
    );

    // 3. Update the loan details
    await client.query(
      `UPDATE loans 
       SET paid_emis = $1, remaining_balance = $2, status = $3 
       WHERE id = $4`,
      [newPaidEmis, newRemainingBalance, newStatus, payment.loan_id]
    );

    // 4. Automatically log this payment as an expense in the transactions table
    const transactionTitle = `EMI Payment: ${payment.loan_name} (EMI #${payment.emi_number}/${payment.total_emis})`;
    await client.query(
      `INSERT INTO transactions (user_id, title, amount, category, type, notes, transaction_date, is_recurring)
       VALUES ($1, $2, $3, $4, 'expense', $5, $6, false)`,
      [
        userId,
        transactionTitle,
        amountPaid,
        'Debt/Loan',
        `Monthly EMI payment for ${payment.loan_name}. Remaining Loan Balance: ₹${newRemainingBalance.toFixed(2)}`,
        paymentDate
      ]
    );

    await client.query('COMMIT');
    res.json({ message: 'EMI payment processed successfully', remaining_balance: newRemainingBalance, paid_emis: newPaidEmis });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Pay EMI error:', err.message);
    res.status(500).json({ message: 'Server error processing EMI payment' });
  } finally {
    client.release();
  }
};

// @route   DELETE api/loans/:id
// @desc    Delete a loan and its associated payment records (via cascade)
// @access  Private
exports.deleteLoan = async (req, res) => {
  const userId = req.user.id;
  const loanId = req.params.id;

  try {
    const checkResult = await db.query('SELECT * FROM loans WHERE id = $1 AND user_id = $2', [loanId, userId]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Loan not found or unauthorized' });
    }

    await db.query('DELETE FROM loans WHERE id = $1 AND user_id = $2', [loanId, userId]);
    res.json({ message: 'Loan deleted successfully' });
  } catch (err) {
    console.error('Delete loan error:', err.message);
    res.status(500).json({ message: 'Server error deleting loan' });
  }
};
