import React from 'react';
import { Calendar, Trash2, Eye, Percent, Clock } from 'lucide-react';

export default function LoanTable({ loans = [], onViewDetails, onDelete }) {
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    });
  };

  return (
    <div className="glass-panel table-container">
      <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ padding: '16px 12px' }}>Loan Name</th>
            <th style={{ padding: '16px 12px', textAlign: 'right' }}>Principal</th>
            <th style={{ padding: '16px 12px', textAlign: 'center' }}>Interest Rate</th>
            <th style={{ padding: '16px 12px', textAlign: 'center' }}>Duration</th>
            <th style={{ padding: '16px 12px', textAlign: 'right' }}>Monthly EMI</th>
            <th style={{ padding: '16px 12px', textAlign: 'right' }}>Remaining Balance</th>
            <th style={{ padding: '16px 12px', textAlign: 'center' }}>Paid EMIs</th>
            <th style={{ padding: '16px 12px', textAlign: 'center' }}>Status</th>
            <th style={{ padding: '16px 12px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loans.length === 0 ? (
            <tr>
              <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No active loans found. Click "Add Loan" to register your first loan!
              </td>
            </tr>
          ) : (
            loans.map((loan) => {
              const isCompleted = loan.status === 'COMPLETED' || loan.paid_emis === loan.total_emis;
              return (
                <tr key={loan.id}>
                  <td style={{ fontWeight: 600, padding: '16px 12px' }}>
                    <div>
                      {loan.loan_name}
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '2px' }}>
                        Started {formatDate(loan.start_date)}
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, padding: '16px 12px' }}>
                    ₹{parseFloat(loan.principal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'center', padding: '16px 12px' }}>
                    {loan.interest_rate}% p.a.
                  </td>
                  <td style={{ textAlign: 'center', padding: '16px 12px' }}>
                    {loan.duration_months} Months
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--primary)', padding: '16px 12px' }}>
                    ₹{parseFloat(loan.emi).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, padding: '16px 12px', color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                    ₹{parseFloat(loan.remaining_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'center', padding: '16px 12px' }}>
                    <strong>{loan.paid_emis}</strong> / {loan.total_emis}
                  </td>
                  <td style={{ textAlign: 'center', padding: '16px 12px' }}>
                    <span className={`badge badge-${isCompleted ? 'success' : 'info'}`}>
                      {isCompleted ? 'Paid Off' : 'Active'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button
                        className="btn btn-outline"
                        onClick={() => onViewDetails(loan.id)}
                        style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                        title="View Schedule"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="btn btn-outline"
                        onClick={() => onDelete(loan.id)}
                        style={{ padding: '6px 10px', color: 'var(--danger)', borderColor: 'rgba(244, 63, 94, 0.15)', backgroundColor: 'var(--danger-light)' }}
                        title="Delete Loan"
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--danger)';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--danger-light)';
                          e.currentTarget.style.color = 'var(--danger)';
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
