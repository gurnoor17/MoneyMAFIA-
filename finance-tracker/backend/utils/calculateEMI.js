function calculateLoanDetails(principal, ratePerYear, months) {
  const p = parseFloat(principal);
  const r = parseFloat(ratePerYear) / 12 / 100; // Monthly interest rate
  const n = parseInt(months, 10);

  let emi = 0;
  if (r > 0) {
    emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  } else {
    emi = p / n;
  }

  // Round to 2 decimal places
  const emiRounded = Math.round(emi * 100) / 100;
  const totalPayment = Math.round(emiRounded * n * 100) / 100;
  const totalInterest = Math.round((totalPayment - p) * 100) / 100;

  return {
    emi: emiRounded,
    totalPayment,
    totalInterest
  };
}

module.exports = {
  calculateLoanDetails
};
