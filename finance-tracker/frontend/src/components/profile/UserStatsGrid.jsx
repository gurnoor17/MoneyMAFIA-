import React from 'react';
import { CreditCard, Wallet, TrendingUp, TrendingDown } from 'lucide-react';

export default function UserStatsGrid({ profileData }) {
  if (!profileData) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      {/* Transactions count */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Transactions</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{profileData.stats.totalTransactions}</h3>
          <CreditCard size={24} style={{ color: 'var(--primary)' }} />
        </div>
      </div>

      {/* Balance */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Calculated Balance</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>₹{profileData.stats.currentBalance.toFixed(2)}</h3>
          <Wallet size={24} style={{ color: 'var(--info)' }} />
        </div>
      </div>

      {/* Total Income */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Income Flow</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)' }}>₹{profileData.stats.totalIncome.toFixed(2)}</h3>
          <TrendingUp size={24} style={{ color: 'var(--success)' }} />
        </div>
      </div>

      {/* Total Expenses */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Expenses Flow</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--danger)' }}>₹{profileData.stats.totalExpense.toFixed(2)}</h3>
          <TrendingDown size={24} style={{ color: 'var(--danger)' }} />
        </div>
      </div>
    </div>
  );
}
