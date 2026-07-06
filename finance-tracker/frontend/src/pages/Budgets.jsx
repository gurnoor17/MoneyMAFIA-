import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle, Calendar } from 'lucide-react';
import budgetService from '../services/budgetService';
import BudgetForm from '../components/budgets/BudgetForm';
import BudgetCard from '../components/budgets/BudgetCard';

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
      const data = await budgetService.getAll(selectedMonth);
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
      await budgetService.upsert({
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
        await budgetService.delete(id);
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
        <BudgetForm
          editingId={editingId}
          category={category}
          setCategory={setCategory}
          limitAmount={limitAmount}
          setLimitAmount={setLimitAmount}
          handleSubmit={handleSubmit}
          setShowForm={setShowForm}
        />
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
          {budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              handleOpenEditForm={handleOpenEditForm}
              handleDeleteBudget={handleDeleteBudget}
            />
          ))}
        </div>
      )}
    </div>
  );
}
