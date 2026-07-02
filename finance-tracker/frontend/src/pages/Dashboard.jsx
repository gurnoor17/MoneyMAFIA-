import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Lightbulb,
  AlertTriangle,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import TransactionTable from '../components/TransactionTable';
import TransactionModal from '../components/TransactionModal';

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
      const summaryData = await api.dashboard.getSummary();
      const chartsData = await api.dashboard.getCharts();
      const insightsData = await api.dashboard.getInsights();
      const txData = await api.transactions.getAll({ page: 1, limit: 5 });

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

  console.log("Summary:", summary);
  console.log("Balance:", summary?.totals?.balance);
  console.log("Transaction:", data);

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
        await api.transactions.update(editingTransaction.id, data);
      } else {
        await api.transactions.add(data);
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
      await api.transactions.delete(id);
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
  const formatCurrency = (val) => `$₹{parseFloat(val).toFixed(2)}`;

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
      {summary && (
        <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {/* Card 1: Balance */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Current Balance</span>
              <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                <Wallet size={20} />
              </div>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>${summary.totals.balance.toFixed(2)}</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Net worth across categories</span>
          </div>

          {/* Card 2: Expenses */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Expenses</span>
              <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'var(--danger-light)', color: 'var(--danger)' }}>
                <TrendingDown size={20} />
              </div>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--danger)' }}>${summary.totals.totalExpense.toFixed(2)}</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>
              Current Month: -${summary.currentMonth.expense.toFixed(2)}
            </span>
          </div>

          {/* Card 3: Savings */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Savings</span>
              <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'var(--info-light)', color: 'var(--info)' }}>
                <PiggyBank size={20} />
              </div>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--info)' }}>${summary.totals.savings.toFixed(2)}</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Accumulated net cash reserves</span>
          </div>
        </div>
      )}

      {/* Insights and Charts Grid */}
      <div className="analytics-grid">
        {/* Left Side: Spending Trend Line Graph */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {charts && charts.monthlySpendingLine.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '20px' }}>Monthly Expense Trend</h3>
              <div style={{ width: '100%', height: '320px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.monthlySpendingLine}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="month" stroke="var(--text-secondary)" />
                    <YAxis stroke="var(--text-secondary)" tickFormatter={formatCurrency} />
                    <Tooltip
                      formatter={formatCurrency}
                      contentStyle={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      name="Expenses"
                      stroke="var(--primary)"
                      strokeWidth={3}
                      activeDot={{ r: 8 }}
                      dot={{ strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Averages spending */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {charts && charts.averages && (
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', justifyContent: 'center' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', margin: 0 }}>Spending Averages</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Daily Average</span>
                  <strong style={{ fontSize: '1.2rem' }}>${charts.averages.daily.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Weekly Average</span>
                  <strong style={{ fontSize: '1.2rem' }}>${charts.averages.weekly.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Monthly Average</span>
                  <strong style={{ fontSize: '1.2rem' }}>${charts.averages.monthly.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
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
