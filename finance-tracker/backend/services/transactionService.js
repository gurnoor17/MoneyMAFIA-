const db = require('../config/db');
const { calculateNextOccurrence } = require('../utils/recurringTransactions');

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
      const message = `Budget Exceeded! You have spent ₹${totalSpent.toFixed(2)} of your ₹${limit.toFixed(2)} budget for ${category} in ${month}.`;
      
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
      const message = `Budget Alert! You have spent ₹${totalSpent.toFixed(2)} (over 80%) of your ₹${limit.toFixed(2)} budget for ${category} in ${month}.`;
      
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

module.exports = {
  checkBudgetAlerts,
  processRecurringTransactions
};
