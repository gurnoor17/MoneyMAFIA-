import React from 'react';

export default function SpendingAverages({ charts }) {
  if (!charts || !charts.averages) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', justifyContent: 'center' }}>
        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', margin: 0 }}>Spending Averages</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Daily Average</span>
            <strong style={{ fontSize: '1.2rem' }}>₹{charts.averages.daily.toFixed(2)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Weekly Average</span>
            <strong style={{ fontSize: '1.2rem' }}>₹{charts.averages.weekly.toFixed(2)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Monthly Average</span>
            <strong style={{ fontSize: '1.2rem' }}>₹{charts.averages.monthly.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
