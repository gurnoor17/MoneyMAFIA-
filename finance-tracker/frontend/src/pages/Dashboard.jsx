import React, { useState, useEffect } from 'react';
import { Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import transactionService from '../services/transactionService';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionModal from '../components/transactions/TransactionModal';
import SummaryCards from '../components/dashboard/SummaryCards';
import ExpenseTrendChart from '../components/dashboard/ExpenseTrendChart';
import SpendingAverages from '../components/dashboard/SpendingAverages';

const CATEGORY_COLORS = {
  Food: '#f43f5e',
  Travel: '#0ea5e9',
  Shopping: '#ec4899',
  Bills: '#eab308',
  Health: '#10b981',
  Education: '#6366f1',
  Entertainment: '#a855f7',
  Salary: '#10b981',
  Freelance: '#14b8a6',
  Investment: '#06b6d4',
  Business: '#3b82f6',
  Others: '#64748b'
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [insights, setInsights] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, currentPage: 1, limit: 5 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const loadDashboardData = async () => {
    try {
      const summaryData = await dashboardService.getSummary();
      const chartsData = await dashboardService.getCharts();
      const insightsData = await dashboardService.getInsights();
      const txData = await transactionService.getAll({ page: 1, limit: 5 });

      setSummary(summaryData);
      setCharts(chartsData);
      setInsights(insightsData);
      setTransactions(txData.transactions);
      setPagination(txData.pagination);
    } catch (err) {
      console.error('Error loading dashboard data:', err.message);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    const handleRefresh = () => {
      loadDashboardData();
    };
    window.addEventListener('transaction-saved', handleRefresh);
    return () => {
      window.removeEventListener('transaction-saved', handleRefresh);
    };
  }, []);

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (data) => {
    // Prevent expense from making balance negative
    if (
      data.type === "expense" &&
      !editingTransaction &&
      data.amount > summary.totals.balance
    ) {
      alert("❌ Insufficient Balance! Expense cannot exceed your available balance.");
      return;
    }

    try {
      if (editingTransaction) {
        await transactionService.update(editingTransaction.id, data);
      } else {
        await transactionService.add(data);
      }

      setIsModalOpen(false);
      loadDashboardData();
    } catch (err) {
      alert(err.message || "Error saving transaction");
    }
  };

  const handleDeleteTransaction = async (id) => {
    console.log('handleDeleteTransaction invoked in Dashboard page, ID:', id);
    try {
      await transactionService.delete(id);
      loadDashboardData();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert(err.message || 'Error deleting transaction');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexGrow: 1, justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Assembling your financial view...</span>
        </div>
      </div>
    );
  }

  // Formatting chart tooltips
  const formatCurrency = (val) => `₹${parseFloat(val).toFixed(2)}`;

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Header section */}
      <div className="page-header">
        <div>
          <h1>Financial Overview</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome to your finance control center.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={18} />
          <span>Add Transaction</span>
        </button>
      </div>

      {error && (
        <div className="alert-banner alert-banner-danger">
          {error}
        </div>
      )}

      {/* Summary Cards Grid */}
      <SummaryCards summary={summary} />

      {/* Insights and Charts Grid */}
      <div className="analytics-grid">
        {/* Left Side: Spending Trend Line Graph */}
        <ExpenseTrendChart charts={charts} formatCurrency={formatCurrency} />

        {/* Right Side: Averages spending */}
        <SpendingAverages charts={charts} />
      </div>

      {/* Recent Transactions list table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recent Activity</h3>
          <Link
            to="/transactions"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--primary)',
              fontSize: '0.9rem',
              fontWeight: 600
            }}
          >
            <span>View All Ledger</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <TransactionTable
          transactions={transactions}
          pagination={pagination}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteTransaction}
          showFilters={false} // Disable search/filters bar on Dashboard recent activity
        />
      </div>

      {/* Transaction creation/edit modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        transaction={editingTransaction}
      />
    </div>
  );
}
