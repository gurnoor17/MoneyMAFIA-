const db = require('../config/db');

// Helper to get current YYYY-MM
function getCurrentMonthStr() {
  return new Date().toISOString().substring(0, 7);
}

// @route   GET api/budgets
// @desc    Get all budgets for a given month, with total spent in that month
// @access  Private
exports.getBudgets = async (req, res) => {
  const userId = req.user.id;
  const month = req.query.month || getCurrentMonthStr();

  try {
    // Select budgets and calculate current spend for each budget category
    const budgetsQuery = `
      SELECT b.id, b.category, b.limit_amount, b.month,
             COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as total_spent
      FROM budgets b
      LEFT JOIN transactions t ON b.user_id = t.user_id 
                               AND b.category = t.category 
                               AND TO_CHAR(t.transaction_date, 'YYYY-MM') = b.month
      WHERE b.user_id = $1 AND b.month = $2
      GROUP BY b.id, b.category, b.limit_amount, b.month
      ORDER BY b.category ASC
    `;
    const budgetsResult = await db.query(budgetsQuery, [userId, month]);

    res.json(budgetsResult.rows);
  } catch (err) {
    console.error('Get budgets error:', err.message);
    res.status(500).json({ message: 'Server error retrieving budgets' });
  }
};

// @route   POST api/budgets
// @desc    Create or Update budget for a category and month (Upsert)
// @access  Private
exports.upsertBudget = async (req, res) => {
  const userId = req.user.id;
  const { category, limit_amount, month } = req.body;

  if (!category || !limit_amount || !month) {
    return res.status(400).json({ message: 'Please enter category, limit, and month' });
  }

  const limitValue = parseFloat(limit_amount);
  if (isNaN(limitValue) || limitValue <= 0) {
    return res.status(400).json({ message: 'Limit must be a positive number' });
  }

  // Validate month format (YYYY-MM)
  const monthRegex = /^\d{4}-\d{2}$/;
  if (!monthRegex.test(month)) {
    return res.status(400).json({ message: 'Month must be in YYYY-MM format' });
  }

  try {
    // Perform Upsert
    const query = `
      INSERT INTO budgets (user_id, category, limit_amount, month)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, category, month) 
      DO UPDATE SET limit_amount = EXCLUDED.limit_amount
      RETURNING *
    `;
    const result = await db.query(query, [userId, category, limitValue, month]);
    const budget = result.rows[0];

    // Trigger check for alerts based on current spending in that category
    const expensesSumResult = await db.query(
      `SELECT SUM(amount) as total FROM transactions 
       WHERE user_id = $1 AND category = $2 AND type = 'expense' 
         AND TO_CHAR(transaction_date, 'YYYY-MM') = $3`,
      [userId, category, month]
    );
    const totalSpent = parseFloat(expensesSumResult.rows[0].total || 0);
    
    // Add custom field for convenience
    budget.total_spent = totalSpent;

    // Check if new notifications are needed
    const pct = totalSpent / limitValue;
    if (pct >= 1.0) {
      await db.query(
        'INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)',
        [userId, `Budget Exceeded! You have spent $${totalSpent.toFixed(2)} of your $${limitValue.toFixed(2)} budget for ${category} in ${month}.`, 'danger']
      );
    } else if (pct >= 0.8) {
      await db.query(
        'INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)',
        [userId, `Budget Alert! You have spent $${totalSpent.toFixed(2)} (over 80%) of your $${limitValue.toFixed(2)} budget for ${category} in ${month}.`, 'warning']
      );
    }

    res.status(200).json(budget);
  } catch (err) {
    console.error('Upsert budget error:', err.message);
    res.status(500).json({ message: 'Server error saving budget' });
  }
};

// @route   DELETE api/budgets/:id
// @desc    Delete budget
// @access  Private
exports.deleteBudget = async (req, res) => {
  const userId = req.user.id;
  const budgetId = req.params.id;

  try {
    // Check ownership
    const checkResult = await db.query('SELECT * FROM budgets WHERE id = $1 AND user_id = $2', [budgetId, userId]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Budget not found or unauthorized' });
    }

    await db.query('DELETE FROM budgets WHERE id = $1 AND user_id = $2', [budgetId, userId]);
    res.json({ message: 'Budget deleted successfully' });
  } catch (err) {
    console.error('Delete budget error:', err.message);
    res.status(500).json({ message: 'Server error deleting budget' });
  }
};
