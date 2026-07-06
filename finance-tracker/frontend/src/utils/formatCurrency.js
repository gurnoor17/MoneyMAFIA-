export const formatCurrency = (val) => {
  const amt = parseFloat(val);
  return isNaN(amt) ? '₹0.00' : `₹${amt.toFixed(2)}`;
};

export default formatCurrency;
