const db = require('../database/db');

// Helper to get current and previous month strings (YYYY-MM)
function getMonths() {
  const now = new Date();
  const currentMonth = now.toISOString().substring(0, 7);
  
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonth = prevMonthDate.toISOString().substring(0, 7);
  
  return { currentMonth, prevMonth };
}

// @route   GET api/dashboard/summary
// @desc    Get dashboard numbers (Balance, Income, Expenses, Savings, Budget)
// @access  Private
exports.getSummary = async (req, res) => {
  const userId = req.user.id;
  const { currentMonth } = getMonths();

  try {
    // 1. Total historical income and expense
    const totalsResult = await db.query(
      `SELECT 
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
       FROM transactions
       WHERE user_id = $1`,
      [userId]
    );
    
    const totalIncome = parseFloat(totalsResult.rows[0].total_income);
    const totalExpense = parseFloat(totalsResult.rows[0].total_expense);
    const balance = totalIncome - totalExpense;
    const savings = balance > 0 ? balance : 0;

    // 2. Budget Limit & Spent for current month
    const budgetLimitResult = await db.query(
      `SELECT COALESCE(SUM(limit_amount), 0) as limit_total 
       FROM budgets 
       WHERE user_id = $1 AND month = $2`,
      [userId, currentMonth]
    );
    const monthlyBudgetLimit = parseFloat(budgetLimitResult.rows[0].limit_total);

    const budgetSpentResult = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as spent_total 
       FROM transactions 
       WHERE user_id = $1 
         AND type = 'expense' 
         AND TO_CHAR(transaction_date, 'YYYY-MM') = $2
         AND category IN (SELECT category FROM budgets WHERE user_id = $1 AND month = $2)`,
      [userId, currentMonth]
    );
    const monthlyBudgetSpent = parseFloat(budgetSpentResult.rows[0].spent_total);

    // 3. Current month Income & Expenses
    const currentMonthTotals = await db.query(
      `SELECT 
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
       FROM transactions
       WHERE user_id = $1 AND TO_CHAR(transaction_date, 'YYYY-MM') = $2`,
      [userId, currentMonth]
    );
    const currentMonthIncome = parseFloat(currentMonthTotals.rows[0].income);
    const currentMonthExpense = parseFloat(currentMonthTotals.rows[0].expense);

    res.json({
      totals: {
        totalIncome,
        totalExpense,
        balance,
        savings
      },
      currentMonth: {
        month: currentMonth,
        income: currentMonthIncome,
        expense: currentMonthExpense,
        budgetLimit: monthlyBudgetLimit,
        budgetSpent: monthlyBudgetSpent
      }
    });
  } catch (err) {
    console.error('Get summary error:', err.message);
    res.status(500).json({ message: 'Server error compiling dashboard summary' });
  }
};

// @route   GET api/dashboard/charts
// @desc    Get aggregated data for Recharts (Line, Bar, Pie charts)
// @access  Private
exports.getChartData = async (req, res) => {
  const userId = req.user.id;
  const { currentMonth } = getMonths();

  try {
    // 1. Monthly Spending Graph (Line chart - expenses month-wise for last 6 months)
    const lineChartQuery = `
      SELECT TO_CHAR(transaction_date, 'YYYY-MM') as month,
             COALESCE(SUM(amount), 0) as amount
      FROM transactions
      WHERE user_id = $1 AND type = 'expense'
      GROUP BY TO_CHAR(transaction_date, 'YYYY-MM')
      ORDER BY month ASC
      LIMIT 6
    `;
    const lineResult = await db.query(lineChartQuery, [userId]);

    // 2. Income vs Expense Graph (Bar chart comparison - last 6 months)
    const barChartQuery = `
      SELECT TO_CHAR(transaction_date, 'YYYY-MM') as month,
             COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
             COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
      FROM transactions
      WHERE user_id = $1
      GROUP BY TO_CHAR(transaction_date, 'YYYY-MM')
      ORDER BY month ASC
      LIMIT 6
    `;
    const barResult = await db.query(barChartQuery, [userId]);

    // 3. Category Breakdown (Pie chart - category-wise expenses for current month)
    const pieChartQuery = `
      SELECT category,
             COALESCE(SUM(amount), 0) as amount
      FROM transactions
      WHERE user_id = $1 AND type = 'expense' AND TO_CHAR(transaction_date, 'YYYY-MM') = $2
      GROUP BY category
      ORDER BY amount DESC
    `;
    const pieResult = await db.query(pieChartQuery, [userId, currentMonth]);

    // 4. Calculate Averages: Daily, Weekly, Monthly spending
    // Daily: sum of expenses in past 30 days / 30
    // Weekly: Daily * 7
    // Monthly: Daily * 30
    const averagesResult = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as total_30_days
       FROM transactions
       WHERE user_id = $1 
         AND type = 'expense' 
         AND transaction_date >= CURRENT_DATE - INTERVAL '30 days'`,
      [userId]
    );
    const total30Days = parseFloat(averagesResult.rows[0].total_30_days);
    const dailyAverage = total30Days / 30;
    const weeklyAverage = dailyAverage * 7;
    const monthlyAverage = total30Days; // Total of past 30 days is a standard monthly average

    res.json({
      monthlySpendingLine: lineResult.rows,
      incomeVsExpenseBar: barResult.rows,
      categoryBreakdownPie: pieResult.rows,
      averages: {
        daily: parseFloat(dailyAverage.toFixed(2)),
        weekly: parseFloat(weeklyAverage.toFixed(2)),
        monthly: parseFloat(monthlyAverage.toFixed(2))
      }
    });
  } catch (err) {
    console.error('Get chart data error:', err.message);
    res.status(500).json({ message: 'Server error retrieving analytics charts' });
  }
};

// @route   GET api/dashboard/insights
// @desc    Generate AI suggestions & insights from spending behaviors
// @access  Private
exports.getInsights = async (req, res) => {
  const userId = req.user.id;
  const { currentMonth, prevMonth } = getMonths();

  try {
    const insights = [];

    // Query spending totals for current and previous months
    const monthCompare = await db.query(
      `SELECT 
         TO_CHAR(transaction_date, 'YYYY-MM') as month,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense,
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income
       FROM transactions
       WHERE user_id = $1 AND TO_CHAR(transaction_date, 'YYYY-MM') IN ($2, $3)
       GROUP BY TO_CHAR(transaction_date, 'YYYY-MM')`,
      [userId, currentMonth, prevMonth]
    );

    let curExp = 0, prevExp = 0;
    let curInc = 0, prevInc = 0;

    monthCompare.rows.forEach(r => {
      if (r.month === currentMonth) {
        curExp = parseFloat(r.expense);
        curInc = parseFloat(r.income);
      } else if (r.month === prevMonth) {
        prevExp = parseFloat(r.expense);
        prevInc = parseFloat(r.income);
      }
    });

    // Insight 1: Compare overall monthly spending
    if (prevExp > 0) {
      const diffPct = ((curExp - prevExp) / prevExp) * 100;
      if (diffPct > 5) {
        insights.push({
          type: 'warning',
          text: `You spent ${diffPct.toFixed(0)}% more this month compared to last month. Consider trimming discretionary items.`
        });
      } else if (diffPct < -5) {
        insights.push({
          type: 'success',
          text: `Awesome! You saved ${Math.abs(diffPct).toFixed(0)}% more than last month by spending less.`
        });
      } else {
        insights.push({
          type: 'info',
          text: `Your monthly spending is relatively stable compared to last month (changed by only ${diffPct.toFixed(0)}%).`
        });
      }
    }

    // Insight 2: Compare categories (specifically Food)
    const categoryCompare = await db.query(
      `SELECT category,
              SUM(CASE WHEN TO_CHAR(transaction_date, 'YYYY-MM') = $2 THEN amount ELSE 0 END) as cur_amt,
              SUM(CASE WHEN TO_CHAR(transaction_date, 'YYYY-MM') = $3 THEN amount ELSE 0 END) as prev_amt
       FROM transactions
       WHERE user_id = $1 AND type = 'expense'
       GROUP BY category`,
      [userId, currentMonth, prevMonth]
    );

    categoryCompare.rows.forEach(cat => {
      const curAmt = parseFloat(cat.cur_amt);
      const prevAmt = parseFloat(cat.prev_amt);
      
      if (prevAmt > 0 && curAmt > 0) {
        const catDiff = ((curAmt - prevAmt) / prevAmt) * 100;
        if (catDiff > 15) {
          insights.push({
            type: 'warning',
            category: cat.category,
            text: `You spent ${catDiff.toFixed(0)}% more on ${cat.category} this month. Watch out for impulse spending here.`
          });
        }
      }
    });

    // Insight 3: Savings Rate Insight
    if (curInc > 0) {
      const savingsRate = ((curInc - curExp) / curInc) * 100;
      if (savingsRate >= 20) {
        insights.push({
          type: 'success',
          text: `Excellent! You saved ${savingsRate.toFixed(0)}% of your income this month. You're on track to hit your targets!`
        });
      } else if (savingsRate > 0 && savingsRate < 10) {
        insights.push({
          type: 'info',
          text: `Your savings rate is ${savingsRate.toFixed(0)}% this month. Try setting aside at least 15% for investments.`
        });
      } else if (savingsRate <= 0) {
        insights.push({
          type: 'danger',
          text: `Warning: You spent more than you earned this month (Savings rate: ${savingsRate.toFixed(0)}%). Check your budget limits!`
        });
      }
    }

    // Fallback if no transactions or insufficient history
    if (insights.length === 0) {
      insights.push({
        type: 'info',
        text: 'Add your transactions and income streams to unlock AI-powered saving insights and monthly trend analyses!'
      });
      insights.push({
        type: 'success',
        text: 'Financial Tip: Creating monthly budget targets helps users save an average of 18% more each month.'
      });
    }

    res.json(insights);
  } catch (err) {
    console.error('Get insights error:', err.message);
    res.status(500).json({ message: 'Server error generating suggestions' });
  }
};

// @route   GET api/dashboard/notifications
// @desc    Get recent notifications for the logged in user
// @access  Private
exports.getNotifications = async (req, res) => {
  const userId = req.user.id;

  try {
    const notifications = await db.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [userId]
    );
    res.json(notifications.rows);
  } catch (err) {
    console.error('Get notifications error:', err.message);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
};

// @route   PUT api/dashboard/notifications/read-all
// @desc    Mark all user notifications as read
// @access  Private
exports.readAllNotifications = async (req, res) => {
  const userId = req.user.id;

  try {
    await db.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1',
      [userId]
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Mark read notifications error:', err.message);
    res.status(500).json({ message: 'Server error clearing notifications' });
  }
};
