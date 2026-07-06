exports.validateLoan = (req, res, next) => {
  const { loan_name, principal, interest_rate, duration_months, start_date } = req.body;

  if (!loan_name || !principal || interest_rate === undefined || !duration_months || !start_date) {
    return res.status(400).json({ message: 'Please enter all required fields: loan_name, principal, interest_rate, duration_months, start_date' });
  }

  const p = parseFloat(principal);
  const rate = parseFloat(interest_rate);
  const months = parseInt(duration_months, 10);

  if (isNaN(p) || p <= 0) {
    return res.status(400).json({ message: 'Principal must be a positive number' });
  }
  if (isNaN(rate) || rate < 0) {
    return res.status(400).json({ message: 'Interest rate must be a non-negative number' });
  }
  if (isNaN(months) || months <= 0) {
    return res.status(400).json({ message: 'Duration must be a positive integer' });
  }

  next();
};
