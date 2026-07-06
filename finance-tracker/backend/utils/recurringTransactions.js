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

module.exports = {
  calculateNextOccurrence
};
