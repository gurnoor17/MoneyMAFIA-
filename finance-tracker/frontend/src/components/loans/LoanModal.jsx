import React, { useState, useEffect } from 'react';
import { X, Calculator, HelpCircle } from 'lucide-react';

export default function LoanModal({ isOpen, onClose, onSave }) {
  const [loanName, setLoanName] = useState('');
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [duration, setDuration] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 10));

  // Live calculations
  const [calculations, setCalculations] = useState({ emi: 0, totalInterest: 0, totalPayment: 0 });

  useEffect(() => {
    const p = parseFloat(principal);
    const r = parseFloat(interestRate) / 12 / 100;
    const n = parseInt(duration, 10);

    if (isNaN(p) || p <= 0 || isNaN(interestRate) || parseFloat(interestRate) < 0 || isNaN(n) || n <= 0) {
      setCalculations({ emi: 0, totalInterest: 0, totalPayment: 0 });
      return;
    }

    let emi = 0;
    if (r > 0) {
      emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    } else {
      emi = p / n;
    }

    const emiRounded = Math.round(emi * 100) / 100;
    const totalPayment = Math.round(emiRounded * n * 100) / 100;
    const totalInterest = Math.round((totalPayment - p) * 100) / 100;

    setCalculations({
      emi: emiRounded,
      totalInterest: Math.max(0, totalInterest),
      totalPayment
    });
  }, [principal, interestRate, duration]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loanName || !principal || interestRate === '' || !duration || !startDate) {
      return alert('Please fill in all fields.');
    }

    const p = parseFloat(principal);
    const rate = parseFloat(interestRate);
    const months = parseInt(duration, 10);

    if (p <= 0 || rate < 0 || months <= 0) {
      return alert('Please enter valid positive values.');
    }

    onSave({
      loan_name: loanName,
      principal: p,
      interest_rate: rate,
      duration_months: months,
      start_date: startDate
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1050,
        padding: '20px'
      }}
    >
      <div 
        className="glass-panel" 
        style={{ 
          width: '100%', 
          maxWidth: '650px', 
          maxHeight: '90vh', 
          overflowY: 'auto',
          display: 'flex', 
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calculator size={20} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Add New Loan / Debt</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="responsive-modal-grid">
            
            {/* Form Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Loan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SBI Home Loan"
                  value={loanName}
                  onChange={(e) => setLoanName(e.target.value)}
                  className="form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Principal Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="e.g. 5000"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="e.g. 8.5"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="form-control"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Duration (Months)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 12"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="form-control"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Start Date</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            {/* Calculations Preview */}
            <div style={{ backgroundColor: 'var(--primary-light)', padding: '20px', borderRadius: 'var(--border-radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px', border: '1px dashed rgba(15, 43, 92, 0.15)' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Calculated Monthly EMI</span>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
                  ₹{calculations.emi.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h1>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Principal Amount:</span>
                  <span style={{ fontWeight: 600 }}>₹{principal ? parseFloat(principal).toLocaleString() : '0.00'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Interest Payable:</span>
                  <span style={{ fontWeight: 600, color: 'var(--warning)' }}>₹{calculations.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Total Repayment:</span>
                  <span style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{calculations.totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} style={{ padding: '10px 20px' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>
              Create Loan
            </button>
          </div>

        </form>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .responsive-modal-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
