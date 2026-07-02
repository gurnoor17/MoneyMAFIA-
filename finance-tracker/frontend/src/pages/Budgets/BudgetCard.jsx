import React from 'react';
import { Edit2, Trash2, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';

export default function BudgetCard({
  budget,
  handleOpenEditForm,
  handleDeleteBudget
}) {
  const spent = parseFloat(budget.total_spent);
  const limit = parseFloat(budget.limit_amount);
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
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{budget.category}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Month: {budget.month}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => handleOpenEditForm(budget)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '4px' }}
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => handleDeleteBudget(budget.id)}
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
}
