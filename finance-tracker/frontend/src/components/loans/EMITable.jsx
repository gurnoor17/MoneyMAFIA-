import React from 'react';
import { CheckCircle, AlertCircle, Calendar } from 'lucide-react';

export default function EMITable({ payments = [], onPayEmi, isPaying }) {
  
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '8px 0 4px 0', color: 'var(--text-primary)' }}>
        Repayment Schedule
      </h3>
      
      <div className="table-container" style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)' }}>
        <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-card)', zIndex: 10 }}>
            <tr>
              <th style={{ width: '80px', padding: '12px' }}>EMI #</th>
              <th style={{ padding: '12px' }}>Due Date</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '12px' }}>Paid Date</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  No payment schedule found.
                </td>
              </tr>
            ) : (() => {
              const today = new Date();
              const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
              const firstUnpaid = payments.find(p => p.status !== 'PAID');

              return payments.map((p) => {
                const isPaid = p.status === 'PAID';
                const dueStr = p.due_date ? (typeof p.due_date === 'string' ? p.due_date.split('T')[0] : new Date(p.due_date).toISOString().split('T')[0]) : '';
                const isNextUnpaid = firstUnpaid && p.id === firstUnpaid.id;
                const isFuture = dueStr && dueStr > todayStr;
                const disableButton = isPaying || !isNextUnpaid || isFuture;

                return (
                  <tr key={p.id} style={{ backgroundColor: isPaid ? 'rgba(16, 185, 129, 0.02)' : 'transparent' }}>
                    <td style={{ fontWeight: 700, padding: '12px' }}>#{p.emi_number}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                        <span>{formatDate(p.due_date)}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, textAlign: 'right', padding: '12px' }}>
                      ₹{parseFloat(p.amount).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <span className={`badge badge-${isPaid ? 'success' : 'warning'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', padding: '12px' }}>
                      {formatDate(p.payment_date)}
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      {!isPaid ? (
                        <button
                          className="btn btn-outline"
                          disabled={disableButton}
                          onClick={() => onPayEmi(p.id, p.emi_number)}
                          style={{
                            fontSize: '0.75rem',
                            padding: '6px 12px',
                            borderColor: disableButton ? 'var(--border-color)' : 'var(--success)',
                            color: disableButton ? 'var(--text-muted)' : 'var(--success)',
                            backgroundColor: disableButton ? 'var(--bg-surface)' : 'var(--success-light)',
                            cursor: disableButton ? 'not-allowed' : 'pointer',
                            opacity: disableButton ? 0.6 : 1
                          }}
                          onMouseOver={(e) => {
                            if (!disableButton) {
                              e.currentTarget.style.backgroundColor = 'var(--success)';
                              e.currentTarget.style.color = 'white';
                            }
                          }}
                          onMouseOut={(e) => {
                            if (!disableButton) {
                              e.currentTarget.style.backgroundColor = 'var(--success-light)';
                              e.currentTarget.style.color = 'var(--success)';
                            }
                          }}
                          title={isFuture ? `Due on ${formatDate(p.due_date)}` : !isNextUnpaid ? 'Pay previous EMIs first' : ''}
                        >
                          {isFuture ? 'Upcoming' : 'Mark Paid'}
                        </button>
                      ) : (
                        <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                          <CheckCircle size={14} /> Completed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}
