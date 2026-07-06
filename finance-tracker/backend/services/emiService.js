const { calculateLoanDetails } = require('../utils/calculateEMI');
const { addMonths } = require('../utils/formatDate');

function generatePaymentSchedule(principal, ratePerYear, months, startDate) {
  const { emi, totalPayment, totalInterest } = calculateLoanDetails(principal, ratePerYear, months);
  
  const schedule = [];
  for (let i = 1; i <= months; i++) {
    const dueDate = addMonths(startDate, i - 1);
    schedule.push({
      emiNumber: i,
      dueDate,
      amount: emi
    });
  }

  return {
    emi,
    totalPayment,
    totalInterest,
    schedule
  };
}

module.exports = {
  generatePaymentSchedule
};
