const db = require('../config/db');

function getMonths() {
  const now = new Date();
  const currentMonth = now.toISOString().substring(0, 7);
  
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonth = prevMonthDate.toISOString().substring(0, 7);
  
  return { currentMonth, prevMonth };
}

async function getSummaryData(userId) {
  const { currentMonth } = getMonths();

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

  return {
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
  };
}

async function getAnalyticsCharts(userId) {
  const { currentMonth } = getMonths();

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

  return {
    monthlySpendingLine: lineResult.rows,
    incomeVsExpenseBar: barResult.rows,
    categoryBreakdownPie: pieResult.rows,
    averages: {
      daily: parseFloat(dailyAverage.toFixed(2)),
      weekly: parseFloat(weeklyAverage.toFixed(2)),
      monthly: parseFloat(monthlyAverage.toFixed(2))
    }
  };
}

module.exports = {
  getMonths,
  getSummaryData,
  getAnalyticsCharts
};
