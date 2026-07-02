import React from 'react';
import { Wallet, TrendingDown, PiggyBank } from 'lucide-react';

export default function SummaryCards({ summary }) {
  if (!summary) return null;

  return (
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
  );
}
