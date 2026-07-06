exports.validateTransaction = (req, res, next) => {
  const { title, amount, category, type, transaction_date, is_recurring, recurrence_period } = req.body;

  if (!title || !amount || !category || !type || !transaction_date) {
    return res.status(400).json({ message: 'Please enter all required fields' });
  }

  const amtValue = parseFloat(amount);
  if (isNaN(amtValue) || amtValue <= 0) {
    return res.status(400).json({ message: 'Amount must be a positive number' });
  }

  const isRecur = !!is_recurring;
  if (isRecur && !recurrence_period) {
    return res.status(400).json({ message: 'Recurrence period is required for recurring transactions' });
  }

  next();
};
