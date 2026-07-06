function formatDate(dateStr) {
  return new Date(dateStr).toISOString().split('T')[0];
}

function addMonths(dateStr, monthsToAdd) {
  const date = new Date(dateStr);
  const day = date.getDate();
  date.setMonth(date.getMonth() + monthsToAdd);
  if (date.getDate() !== day) {
    date.setDate(0);
  }
  return date.toISOString().split('T')[0];
}

module.exports = {
  formatDate,
  addMonths
};
