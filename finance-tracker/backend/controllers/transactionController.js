const db = require('../config/db');

// Helper to calculate next occurrence date
function calculateNextOccurrence(dateStr, period) {
  const date = new Date(dateStr);
  if (period === 'daily') {
    date.setDate(date.getDate() + 1);
  } else if (period === 'weekly') {
    date.setDate(date.getDate() + 7);
  } else if (period === 'monthly') {
    date.setMonth(date.getMonth() + 1);
  } else if (period === 'yearly') {
    date.setFullYear(date.getFullYear() + 1);
  }
  return date.toISOString().split('T')[0];
}

// Process pending recurring transactions for a user
const processRecurringTransactions = async (userId) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Select recurring templates where next_occurrence has passed or is today
    const recurringResult = await db.query(
      `SELECT * FROM transactions 
       WHERE user_id = $1 AND is_recurring = true AND next_occurrence <= $2`,
      [userId, todayStr]
    );

    for (const template of recurringResult.rows) {
      let currentNext = new Date(template.next_occurrence);
      const todayDate = new Date(todayStr);

      while (currentNext <= todayDate) {
        const occurrenceDateStr = currentNext.toISOString().split('T')[0];
        
        // 1. Insert the instance transaction (is_recurring = false)
        await db.query(
          `INSERT INTO transactions (user_id, title, amount, category, type, notes, transaction_date, is_recurring)
           VALUES ($1, $2, $3, $4, $5, $6, $7, false)`,
          [userId, template.title, template.amount, template.category, template.type, template.notes, occurrenceDateStr]
        );

        // 2. Check and trigger budget warnings if this is an expense
        if (template.type === 'expense') {
          await checkBudgetAlerts(userId, template.category, occurrenceDateStr);
        }

        // 3. Advance to the next occurrence date
        if (template.recurrence_period === 'daily') {
          currentNext.setDate(currentNext.getDate() + 1);
        } else if (template.recurrence_period === 'weekly') {
          currentNext.setDate(currentNext.getDate() + 7);
        } else if (template.recurrence_period === 'monthly') {
          currentNext.setMonth(currentNext.getMonth() + 1);
        } else if (template.recurrence_period === 'yearly') {
          currentNext.setFullYear(currentNext.getFullYear() + 1);
        }
      }

      // Update the template transaction's next_occurrence
      await db.query(
        'UPDATE transactions SET next_occurrence = $1 WHERE id = $2',
        [currentNext.toISOString().split('T')[0], template.id]
      );
    }
  } catch (err) {
    console.error('Error in processRecurringTransactions:', err.message);
  }
};

// Helper function to check and create notifications for budgets
const checkBudgetAlerts = async (userId, category, dateStr) => {
  try {
    const month = dateStr.substring(0, 7); // YYYY-MM
    
    // Check if a budget exists for this category/month
    const budgetResult = await db.query(
      'SELECT limit_amount FROM budgets WHERE user_id = $1 AND category = $2 AND month = $3',
      [userId, category, month]
    );

    if (budgetResult.rows.length === 0) return;
    const limit = parseFloat(budgetResult.rows[0].limit_amount);

    // Sum all expenses for this category/month
    const expensesSumResult = await db.query(
      `SELECT SUM(amount) as total FROM transactions 
       WHERE user_id = $1 AND category = $2 AND type = 'expense' 
         AND TO_CHAR(transaction_date, 'YYYY-MM') = $3`,
      [userId, category, month]
    );

    const totalSpent = parseFloat(expensesSumResult.rows[0].total || 0);
    const pct = totalSpent / limit;

    if (pct >= 1.0) {
      const message = `Budget Exceeded! You have spent $${totalSpent.toFixed(2)} of your $${limit.toFixed(2)} budget for ${category} in ${month}.`;
      
      // Check if duplicate alert exists
      const existingAlert = await db.query(
        'SELECT id FROM notifications WHERE user_id = $1 AND message = $2',
        [userId, message]
      );
      if (existingAlert.rows.length === 0) {
        await db.query(
          'INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)',
          [userId, message, 'danger']
        );
      }
    } else if (pct >= 0.8) {
      const message = `Budget Alert! You have spent $${totalSpent.toFixed(2)} (over 80%) of your $${limit.toFixed(2)} budget for ${category} in ${month}.`;
      
      // Check if duplicate alert exists
      const existingAlert = await db.query(
        'SELECT id FROM notifications WHERE user_id = $1 AND message = $2',
        [userId, message]
      );
      if (existingAlert.rows.length === 0) {
        await db.query(
          'INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)',
          [userId, message, 'warning']
        );
      }
    }
  } catch (err) {
    console.error('Error checking budget alerts:', err.message);
  }
};

// @route   GET api/transactions
// @desc    Get transactions with filters, search, sorting, and pagination
// @access  Private
exports.getTransactions = async (req, res) => {
  const userId = req.user.id;

  // Process any due recurring transactions first
  await processRecurringTransactions(userId);

  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const offset = (page - 1) * limit;

  const { search, type, category, startDate, endDate, sortBy, sortOrder } = req.query;

  try {
    let queryText = 'SELECT * FROM transactions WHERE user_id = $1';
    let countText = 'SELECT COUNT(*) FROM transactions WHERE user_id = $1';
    const params = [userId];
    let paramIndex = 2;

    // Search filter (title / notes)
    if (search) {
      queryText += ` AND (title ILIKE $${paramIndex} OR notes ILIKE $${paramIndex})`;
      countText += ` AND (title ILIKE $${paramIndex} OR notes ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Type filter
    if (type) {
      queryText += ` AND type = $${paramIndex}`;
      countText += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    // Category filter
    if (category) {
      queryText += ` AND category = $${paramIndex}`;
      countText += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    // Date range filters
    if (startDate) {
      queryText += ` AND transaction_date >= $${paramIndex}`;
      countText += ` AND transaction_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      queryText += ` AND transaction_date <= $${paramIndex}`;
      countText += ` AND transaction_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    // Sorting
    const validSortFields = ['transaction_date', 'amount', 'title', 'category', 'type'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'transaction_date';
    const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';
    queryText += ` ORDER BY ${sortField} ${order}, id DESC`;

    // Pagination
    queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    const queryParams = [...params, limit, offset];

    // Execute queries
    const countResult = await db.query(countText, params);
    const dataResult = await db.query(queryText, queryParams);

    const totalCount = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      transactions: dataResult.rows,
      pagination: {
        total: totalCount,
        pages: totalPages,
        currentPage: page,
        limit
      }
    });
  } catch (err) {
    console.error('Get transactions error:', err.message);
    res.status(500).json({ message: 'Server error retrieving transactions' });
  }
};

// @route   POST api/transactions
// @desc    Add transaction
// @access  Private
exports.addTransaction = async (req, res) => {
  const userId = req.user.id;
  const { title, amount, category, type, notes, transaction_date, is_recurring, recurrence_period } = req.body;

  if (!title || !amount || !category || !type || !transaction_date) {
    return res.status(400).json({ message: 'Please enter all required fields' });
  }

  const amtValue = parseFloat(amount);
  if (isNaN(amtValue) || amtValue <= 0) {
    return res.status(400).json({ message: 'Amount must be a positive number' });
  }

  try {
    let nextOccurrence = null;
    const isRecur = !!is_recurring;
    if (isRecur) {
      if (!recurrence_period) {
        return res.status(400).json({ message: 'Recurrence period is required for recurring transactions' });
      }
      // Calculate first next occurrence
      nextOccurrence = calculateNextOccurrence(transaction_date, recurrence_period);
    }

    // Insert new transaction
    const result = await db.query(
      `INSERT INTO transactions (user_id, title, amount, category, type, notes, transaction_date, is_recurring, recurrence_period, next_occurrence)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [userId, title.trim(), amtValue, category, type, notes ? notes.trim() : null, transaction_date, isRecur, recurrence_period || null, nextOccurrence]
    );

    const transaction = result.rows[0];

    // Check budget limit alert
    if (type === 'expense') {
      await checkBudgetAlerts(userId, category, transaction_date);
    }

    res.status(201).json(transaction);
  } catch (err) {
    console.error('Add transaction error:', err.message);
    res.status(500).json({ message: 'Server error adding transaction' });
  }
};

// @route   PUT api/transactions/:id
// @desc    Edit transaction
// @access  Private
exports.updateTransaction = async (req, res) => {
  const userId = req.user.id;
  const transactionId = req.params.id;
  const { title, amount, category, type, notes, transaction_date, is_recurring, recurrence_period } = req.body;

  if (!title || !amount || !category || !type || !transaction_date) {
    return res.status(400).json({ message: 'Please enter all required fields' });
  }

  const amtValue = parseFloat(amount);
  if (isNaN(amtValue) || amtValue <= 0) {
    return res.status(400).json({ message: 'Amount must be a positive number' });
  }

  try {
    // Check ownership
    const checkResult = await db.query('SELECT * FROM transactions WHERE id = $1 AND user_id = $2', [transactionId, userId]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    let nextOccurrence = null;
    const isRecur = !!is_recurring;
    if (isRecur) {
      if (!recurrence_period) {
        return res.status(400).json({ message: 'Recurrence period is required for recurring transactions' });
      }
      nextOccurrence = calculateNextOccurrence(transaction_date, recurrence_period);
    }

    // Update transaction
    const result = await db.query(
      `UPDATE transactions 
       SET title = $1, amount = $2, category = $3, type = $4, notes = $5, transaction_date = $6, 
           is_recurring = $7, recurrence_period = $8, next_occurrence = $9
       WHERE id = $10 AND user_id = $11 
       RETURNING *`,
      [title.trim(), amtValue, category, type, notes ? notes.trim() : null, transaction_date, isRecur, recurrence_period || null, nextOccurrence, transactionId, userId]
    );

    const transaction = result.rows[0];

    // Check budget limit alert
    if (type === 'expense') {
      await checkBudgetAlerts(userId, category, transaction_date);
    }

    res.json(transaction);
  } catch (err) {
    console.error('Update transaction error:', err.message);
    res.status(500).json({ message: 'Server error updating transaction' });
  }
};

// @route   DELETE api/transactions/:id
// @desc    Delete transaction
// @access  Private
exports.deleteTransaction = async (req, res) => {
  const userId = req.user.id;
  const transactionId = req.params.id;

  console.log(`DELETE REQUEST: transactionId=${transactionId} (type: ${typeof transactionId}), userId=${userId} (type: ${typeof userId})`);

  try {
    const checkResult = await db.query('SELECT * FROM transactions WHERE id = $1 AND user_id = $2', [transactionId, userId]);
    console.log(`DELETE CHECK RESULT: found rows = ${checkResult.rows.length}`);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found or unauthorized' });
    }

    await db.query('DELETE FROM transactions WHERE id = $1 AND user_id = $2', [transactionId, userId]);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    console.error('Delete transaction error:', err.message);
    res.status(500).json({ message: 'Server error deleting transaction' });
  }
};

// @route   GET api/transactions/export
// @desc    Export transactions to CSV
// @access  Private
exports.exportCSV = async (req, res) => {
  const userId = req.user.id;
  const { search, type, category, startDate, endDate, sortBy, sortOrder } = req.query;

  try {
    let queryText = 'SELECT title, amount, category, type, notes, transaction_date, created_at FROM transactions WHERE user_id = $1';
    const params = [userId];
    let paramIndex = 2;

    if (search) {
      queryText += ` AND (title ILIKE $${paramIndex} OR notes ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (type) {
      queryText += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (category) {
      queryText += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (startDate) {
      queryText += ` AND transaction_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      queryText += ` AND transaction_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    const validSortFields = ['transaction_date', 'amount', 'title'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'transaction_date';
    const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';
    queryText += ` ORDER BY ${sortField} ${order}, id DESC`;

    const dataResult = await db.query(queryText, params);

    // Build CSV Content
    let csvContent = 'Date,Title,Type,Category,Amount,Notes,Created At\n';
    dataResult.rows.forEach((row) => {
      // Escape strings containing commas/quotes
      const esc = (val) => {
        if (val === null || val === undefined) return '';
        let str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const dateStr = new Date(row.transaction_date).toISOString().split('T')[0];
      const createdStr = new Date(row.created_at).toISOString();

      csvContent += `${dateStr},${esc(row.title)},${row.type},${esc(row.category)},${row.amount},${esc(row.notes)},${createdStr}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions_report.csv');
    res.status(200).send(csvContent);
  } catch (err) {
    console.error('Export CSV error:', err.message);
    res.status(500).json({ message: 'Server error exporting transactions' });
  }
};
