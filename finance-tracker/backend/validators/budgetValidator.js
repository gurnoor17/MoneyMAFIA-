exports.validateBudget = (req, res, next) => {
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

  next();
};
