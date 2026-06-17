import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, AlertCircle, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';
import { api } from '../services/api';

const EXPENSE_CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Health', 'Education', 'Entertainment', 'Others'];

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [limitAmount, setLimitAmount] = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const data = await api.budgets.getAll(selectedMonth);
      setBudgets(data);
    } catch (err) {
      console.error('Failed to load budgets:', err.message);
      setError('Could not retrieve budgets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth]);

  const handleOpenAddForm = () => {
    setCategory(EXPENSE_CATEGORIES[0]);
    setLimitAmount('');
    setEditingId(null);
    setShowForm(true);
  };

  const handleOpenEditForm = (budget) => {
    setCategory(budget.category);
    setLimitAmount(budget.limit_amount);
    setEditingId(budget.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !limitAmount) return;

    const limitVal = parseFloat(limitAmount);
    if (isNaN(limitVal) || limitVal <= 0) {
      return alert('Please enter a positive limit amount.');
    }

    try {
      await api.budgets.upsert({
        category,
        limit_amount: limitVal,
        month: selectedMonth
      });
      setShowForm(false);
      setLimitAmount('');
      fetchBudgets();
    } catch (err) {
      alert(err.message || 'Failed to save budget.');
    }
  };

  const handleDeleteBudget = async (id) => {
    if (window.confirm('Are you sure you want to delete this category budget?')) {
      try {
        await api.budgets.delete(id);
        fetchBudgets();
      } catch (err) {
        alert(err.message || 'Failed to delete budget.');
      }
    }
  };

  // Generate month list for selection (last 6 months and next 6 months)
  const getMonthOptions = () => {
    const options = [];
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    
    for (let i = 0; i < 13; i++) {
      const monthStr = date.toISOString().substring(0, 7);
      options.push(monthStr);
      date.setMonth(date.getMonth() + 1);
    }
    return options;
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Category Budgets</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Set monthly spending limits for expense categories and stay on track.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', alignSelf: 'stretch', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {/* Month Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-surface)', padding: '6px 12px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
            <Calendar size={18} style={{ color: 'var(--text-secondary)' }} />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
            >
              {getMonthOptions().map(m => (
                <option key={m} value={m}>{new Date(m + '-02').toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</option>
              ))}
            </select>
          </div>

          <button className="btn btn-primary" onClick={handleOpenAddForm}>
            <Plus size={18} />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-banner alert-banner-danger">
          {error}
        </div>
      )}

      {/* Inline Form Card */}
      {showForm && (
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
              <label>Monthly Limit Limit ($)</label>
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
      )}

      {/* Budgets Cards Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : budgets.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <AlertCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3>No category budgets set for this month</h3>
          <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>Set targets for Food, Bills, etc., to monitor your daily expenses.</p>
          <button className="btn btn-primary" onClick={handleOpenAddForm} style={{ marginTop: '20px' }}>
            <Plus size={16} />
            <span>Set First Budget</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {budgets.map((b) => {
            const spent = parseFloat(b.total_spent);
            const limit = parseFloat(b.limit_amount);
            const ratio = spent / limit;
            const pct = ratio * 100;

            let statusColor = 'var(--success)';
            let statusText = 'On Track';
            let StatusIcon = CheckCircle2;
            let bgColor = 'var(--success-light)';

            if (ratio >= 1.0) {
              statusColor = 'var(--danger)';
              statusText = 'Limit Exceeded';
              StatusIcon = AlertCircle;
              bgColor = 'var(--danger-light)';
            } else if (ratio >= 0.8) {
              statusColor = 'var(--warning)';
              statusText = 'Approaching Limit (>80%)';
              StatusIcon = AlertTriangle;
              bgColor = 'var(--warning-light)';
            }

            return (
              <div key={b.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{b.category}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Month: {b.month}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleOpenEditForm(b)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '4px' }}
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteBudget(b.id)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Numbers */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Spent</span>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>${spent.toFixed(2)}</h2>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Budget Limit</span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>${limit.toFixed(2)}</h4>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill" 
                      style={{ 
                        width: `${Math.min(100, pct)}%`, 
                        backgroundColor: statusColor 
                      }} 
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>{pct.toFixed(0)}% used</span>
                    <span>Remaining: ${(limit - spent) > 0 ? `$${(limit - spent).toFixed(2)}` : '$0.00'}</span>
                  </div>
                </div>

                {/* Alert Badge */}
                <div 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    padding: '8px 12px', 
                    borderRadius: 'var(--border-radius-sm)', 
                    backgroundColor: bgColor, 
                    color: statusColor,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    marginTop: 'auto'
                  }}
                >
                  <StatusIcon size={16} />
                  <span>{statusText}</span>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
