import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EXPENSE_CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Health', 'Education', 'Entertainment', 'Others'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Business', 'Others'];

export default function TransactionModal({ isOpen, onClose, onSave, transaction = null }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('expense');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePeriod, setRecurrencePeriod] = useState('monthly');
  const [error, setError] = useState('');

  // Populate values if editing
  useEffect(() => {
    if (transaction) {
      setTitle(transaction.title || '');
      setAmount(transaction.amount || '');
      setType(transaction.type || 'expense');
      setCategory(transaction.category || '');
      setNotes(transaction.notes || '');
      setDate(transaction.transaction_date ? new Date(transaction.transaction_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setIsRecurring(transaction.is_recurring || false);
      setRecurrencePeriod(transaction.recurrence_period || 'monthly');
    } else {
      // Defaults
      setTitle('');
      setAmount('');
      setType('expense');
      setCategory('Food');
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
      setIsRecurring(false);
      setRecurrencePeriod('monthly');
    }
    setError('');
  }, [transaction, isOpen]);

  // Adjust category if type changes
  useEffect(() => {
    if (!transaction) {
      setCategory(type === 'expense' ? 'Food' : 'Salary');
    }
  }, [type]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !amount || !category || !type || !date) {
      return setError('Please enter all required fields.');
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      return setError('Amount must be a positive number.');
    }

    onSave({
      title,
      amount: amt,
      category,
      type,
      notes,
      transaction_date: date,
      is_recurring: isRecurring,
      recurrence_period: isRecurring ? recurrencePeriod : null
    });
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content animate-fade" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <div 
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '16px',
            marginBottom: '24px'
          }}
        >
          <h3 style={{ margin: 0 }}>{transaction ? 'Edit Transaction' : 'Add Transaction'}</h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="alert-banner alert-banner-danger" style={{ fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '16px'
            }}
          >
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Transaction Type</label>
              <select 
                className="input-control" 
                value={type} 
                onChange={(e) => setType(e.target.value)}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Category</label>
              <select 
                className="input-control" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
              >
                {type === 'expense' 
                  ? EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)
                  : INCOME_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)
                }
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Title</label>
            <input 
              type="text" 
              className="input-control" 
              placeholder="e.g. Grocery store, Salary payment"
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '16px'
            }}
          >
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Amount ($)</label>
              <input 
                type="number" 
                step="0.01" 
                className="input-control" 
                placeholder="0.00"
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Date</label>
              <input 
                type="date" 
                className="input-control" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea 
              className="input-control" 
              rows="2" 
              placeholder="Add memo details..."
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Recurrence Selection */}
          <div 
            style={{
              backgroundColor: 'rgba(99, 102, 241, 0.05)',
              padding: '16px',
              borderRadius: 'var(--border-radius-sm)',
              marginBottom: '24px',
              border: '1px solid var(--border-color)'
            }}
          >
            <label 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                fontWeight: 600, 
                cursor: 'pointer' 
              }}
            >
              <input 
                type="checkbox" 
                checked={isRecurring} 
                onChange={(e) => setIsRecurring(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
              />
              <span>Recurring Transaction</span>
            </label>

            {isRecurring && (
              <div className="form-group" style={{ marginTop: '12px', marginBottom: 0 }}>
                <label>Recurrence Period</label>
                <select 
                  className="input-control" 
                  value={recurrencePeriod} 
                  onChange={(e) => setRecurrencePeriod(e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                  A new transaction will automatically spawn at the selected interval starting from the transaction date.
                </span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {transaction ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
