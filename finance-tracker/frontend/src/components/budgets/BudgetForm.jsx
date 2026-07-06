import React from 'react';

const EXPENSE_CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Health', 'Education', 'Entertainment', 'Others'];

export default function BudgetForm({
  editingId,
  category,
  setCategory,
  limitAmount,
  setLimitAmount,
  handleSubmit,
  setShowForm
}) {
  return (
    <div className="glass-panel animate-fade" style={{ padding: '24px', maxWidth: '500px', alignSelf: 'center', width: '100%' }}>
      <h3 style={{ marginBottom: '16px' }}>{editingId ? 'Edit Category Limit' : 'Set Category Limit'}</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Expense Category</label>
          <select
            className="input-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={!!editingId} // Category is fixed during editing of specific card
          >
            {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Monthly Limit Limit (₹)</label>
          <input
            type="number"
            step="0.01"
            className="input-control"
            placeholder="e.g. 500.00"
            value={limitAmount}
            onChange={(e) => setLimitAmount(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
          <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save Limit
          </button>
        </div>
      </form>
    </div>
  );
}
