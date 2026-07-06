function generateCSV(rows) {
  const esc = (val) => {
    if (val === null || val === undefined) return '';
    let str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  let csvContent = 'Date,Title,Type,Category,Amount,Notes,Created At\n';
  rows.forEach((row) => {
    const dateStr = new Date(row.transaction_date).toISOString().split('T')[0];
    const createdStr = new Date(row.created_at).toISOString();
    csvContent += `${dateStr},${esc(row.title)},${row.type},${esc(row.category)},${row.amount},${esc(row.notes)},${createdStr}\n`;
  });

  return csvContent;
}

module.exports = {
  generateCSV
};
