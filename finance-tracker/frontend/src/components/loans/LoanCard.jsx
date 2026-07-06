import React from 'react';
import { Calendar, Trash2, Eye, Percent, Clock } from 'lucide-react';

export default function LoanCard({ loan, onViewDetails, onDelete }) {
  const {
    id,
    loan_name,
    principal,
    interest_rate,
    duration_months,
    emi,
    remaining_balance,
    paid_emis,
    total_emis,
    start_date,
    status
  } = loan;

  const progressPct = total_emis > 0 ? (paid_emis / total_emis) * 100 : 0;
  const isCompleted = status === 'COMPLETED' || paid_emis === total_emis;

  return (
    <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
      
      {/* Title & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{loan_name}</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <Calendar size={12} /> Started {new Date(start_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
        <span className={`badge badge-${isCompleted ? 'success' : 'info'}`}>
          {isCompleted ? 'Paid Off' : 'Active'}
        </span>
      </div>

      {/* Amortization Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '16px 0' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Remaining Balance</span>
          <strong style={{ fontSize: '1.2rem', color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)' }}>
            ₹{parseFloat(remaining_balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Monthly EMI</span>
          <strong style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>
            ₹{parseFloat(emi).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </div>
      </div>

      {/* Info Badges */}
      <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Percent size={14} style={{ color: 'var(--text-muted)' }} />
          <span>{interest_rate}% p.a.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={14} style={{ color: 'var(--text-muted)' }} />
          <span>{total_emis} mos</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
          <span>EMI Progress</span>
          <span>{paid_emis} / {total_emis} paid</span>
        </div>
        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-app)', borderRadius: '4px', overflow: 'hidden' }}>
          <div 
            style={{ 
              width: `${progressPct}%`, 
              height: '100%', 
              backgroundColor: isCompleted ? 'var(--success)' : 'var(--primary)', 
              borderRadius: '4px',
              transition: 'width 0.6s ease'
            }} 
          />
        </div>
      </div>

      {/* Original Principal details */}
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Original Principal: ₹{parseFloat(principal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button 
          className="btn btn-outline" 
          onClick={() => onViewDetails(id)}
          style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 0' }}
        >
          <Eye size={16} />
          <span>View Schedule</span>
        </button>
        <button 
          className="btn btn-outline" 
          onClick={() => onDelete(id)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 12px', color: 'var(--danger)', borderColor: 'rgba(244, 63, 94, 0.2)', backgroundColor: 'var(--danger-light)' }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--danger)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--danger-light)';
            e.currentTarget.style.color = 'var(--danger)';
          }}
        >
          <Trash2 size={16} />
        </button>
      </div>

    </div>
  );
}
