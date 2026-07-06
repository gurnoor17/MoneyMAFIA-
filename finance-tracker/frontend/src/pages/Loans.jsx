import React, { useState, useEffect } from 'react';
import { Plus, LayoutGrid, List, AlertCircle, TrendingDown, DollarSign, Calendar, Landmark, CheckSquare, X } from 'lucide-react';
import loanService from '../services/loanService';
import LoanCard from '../components/loans/LoanCard';
import LoanTable from '../components/loans/LoanTable';
import LoanModal from '../components/loans/LoanModal';
import EMITable from '../components/loans/EMITable';

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // View mode: 'cards' or 'table'
  const [viewMode, setViewMode] = useState('cards');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Detail Modal states
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const data = await loanService.getAll();
      setLoans(data);
    } catch (err) {
      console.error('Failed to load loans:', err.message);
      setError('Could not retrieve loans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleCreateLoan = async (loanData) => {
    try {
      await loanService.create(loanData);
      setIsAddModalOpen(false);
      fetchLoans();
    } catch (err) {
      alert(err.message || 'Failed to create loan.');
    }
  };

  const handleDeleteLoan = async (id) => {
    if (window.confirm('Are you sure you want to delete this loan? All payment schedules and history will be permanently deleted.')) {
      try {
        await loanService.delete(id);
        if (selectedLoanId === id) {
          setSelectedLoanId(null);
          setSelectedLoan(null);
        }
        fetchLoans();
      } catch (err) {
        alert(err.message || 'Failed to delete loan.');
      }
    }
  };

  const handleViewDetails = async (id) => {
    setSelectedLoanId(id);
    setLoadingDetail(true);
    try {
      const detail = await loanService.getById(id);
      setSelectedLoan(detail);
    } catch (err) {
      alert(err.message || 'Failed to load loan details.');
      setSelectedLoanId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handlePayEmi = async (paymentId, emiNumber) => {
    if (window.confirm(`Mark EMI #${emiNumber} as PAID? This will automatically create an expense transaction.`)) {
      setIsPaying(true);
      try {
        await loanService.payEmi(paymentId);
        // Refresh details
        if (selectedLoanId) {
          const detail = await loanService.getById(selectedLoanId);
          setSelectedLoan(detail);
        }
        // Refresh main list
        fetchLoans();
      } catch (err) {
        alert(err.message || 'Failed to pay EMI.');
      } finally {
        setIsPaying(false);
      }
    }
  };

  // Calculate high-level summary metrics
  const activeLoans = loans.filter(l => l.status === 'ACTIVE');
  const totalPrincipal = loans.reduce((sum, l) => sum + parseFloat(l.principal), 0);
  const totalRemaining = loans.reduce((sum, l) => sum + parseFloat(l.remaining_balance), 0);
  const totalMonthlyEmi = activeLoans.reduce((sum, l) => sum + parseFloat(l.emi), 0);
  
  const totalPaidOffCount = loans.filter(l => l.status === 'COMPLETED' || l.paid_emis === l.total_emis).length;

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Loans & Debts</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Track your active loans, monthly EMI schedules, and pay-off progress.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* Toggle View Mode */}
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-surface)', padding: '4px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
            <button 
              onClick={() => setViewMode('cards')} 
              style={{ 
                background: viewMode === 'cards' ? 'var(--primary-light)' : 'transparent', 
                border: 'none', 
                cursor: 'pointer', 
                padding: '6px 10px', 
                borderRadius: 'var(--border-radius-sm)',
                color: viewMode === 'cards' ? 'var(--primary)' : 'var(--text-secondary)'
              }}
              title="Card View"
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setViewMode('table')} 
              style={{ 
                background: viewMode === 'table' ? 'var(--primary-light)' : 'transparent', 
                border: 'none', 
                cursor: 'pointer', 
                padding: '6px 10px', 
                borderRadius: 'var(--border-radius-sm)',
                color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-secondary)'
              }}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>

          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}>
            <Plus size={18} />
            <span>Add Loan</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-banner alert-banner-danger">
          {error}
        </div>
      )}

      {/* High Level Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
        
        {/* Card 1: Total Debt */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: 'var(--danger-light)', borderRadius: '12px', color: 'var(--danger)' }}>
            <TrendingDown size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Total Original Debt</span>
            <strong style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>
              ₹{totalPrincipal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
          </div>
        </div>

        {/* Card 2: Remaining Balance */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: 'var(--warning-light)', borderRadius: '12px', color: 'var(--warning)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Remaining Balance</span>
            <strong style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>
              ₹{totalRemaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
          </div>
        </div>

        {/* Card 3: Monthly EMI Outflow */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: 'var(--primary-light)', borderRadius: '12px', color: 'var(--primary)' }}>
            <Calendar size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Monthly EMI Outflow</span>
            <strong style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>
              ₹{totalMonthlyEmi.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
          </div>
        </div>

        {/* Card 4: Paid-Off Ratio */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: 'var(--success-light)', borderRadius: '12px', color: 'var(--success)' }}>
            <CheckSquare size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Paid Off Status</span>
            <strong style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>
              {totalPaidOffCount} / {loans.length} Loans
            </strong>
          </div>
        </div>

      </div>

      {/* Main Display List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : loans.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Landmark size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3>No loans or debts registered yet</h3>
          <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>Add your home, car, or student loans to trace your EMI payments and amortization details.</p>
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)} style={{ marginTop: '20px' }}>
            <Plus size={16} />
            <span>Add Your First Loan</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {loans.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              onViewDetails={handleViewDetails}
              onDelete={handleDeleteLoan}
            />
          ))}
        </div>
      ) : (
        <LoanTable
          loans={loans}
          onViewDetails={handleViewDetails}
          onDelete={handleDeleteLoan}
        />
      )}

      {/* Add Loan Modal */}
      <LoanModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleCreateLoan}
      />

      {/* Loan Details & EMI Schedule Modal */}
      {selectedLoanId && (
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
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            {/* Detail Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedLoan ? selectedLoan.loan_name : 'Loading Loan Details...'}</h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Repayment Amortization Schedule</span>
              </div>
              <button onClick={() => { setSelectedLoanId(null); setSelectedLoan(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Detail Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {loadingDetail || !selectedLoan ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                  <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : (
                <>
                  {/* Detailed Loan Stats Panel */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Principal Amount</span>
                      <span style={{ fontWeight: 700 }}>₹{parseFloat(selectedLoan.principal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Annual Interest Rate</span>
                      <span style={{ fontWeight: 700 }}>{selectedLoan.interest_rate}% p.a.</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Total EMIs / Duration</span>
                      <span style={{ fontWeight: 700 }}>{selectedLoan.total_emis} Months</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Remaining Balance</span>
                      <span style={{ fontWeight: 700, color: 'var(--danger)' }}>₹{parseFloat(selectedLoan.remaining_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {/* Amortization Progress Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      <span>Repayment Progress ({((selectedLoan.paid_emis / selectedLoan.total_emis) * 100).toFixed(0)}%)</span>
                      <span>{selectedLoan.paid_emis} / {selectedLoan.total_emis} EMIs Cleared</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--border-color)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${(selectedLoan.paid_emis / selectedLoan.total_emis) * 100}%`, 
                          height: '100%', 
                          backgroundColor: 'var(--success)', 
                          borderRadius: '5px',
                          transition: 'width 0.4s ease'
                        }} 
                      />
                    </div>
                  </div>

                  {/* Payment List Table */}
                  <EMITable
                    payments={selectedLoan.payments}
                    onPayEmi={handlePayEmi}
                    isPaying={isPaying}
                  />
                </>
              )}
            </div>

            {/* Detail Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px', borderTop: '1px solid var(--border-color)' }}>
              <button className="btn btn-outline" onClick={() => { setSelectedLoanId(null); setSelectedLoan(null); }} style={{ padding: '8px 16px' }}>
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
