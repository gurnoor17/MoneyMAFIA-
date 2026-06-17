import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../services/api';
import TransactionTable from '../components/TransactionTable';
import TransactionModal from '../components/TransactionModal';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, currentPage: 1, limit: 10 });
  const [params, setParams] = useState({
    search: '',
    type: '',
    category: '',
    startDate: '',
    endDate: '',
    sortBy: 'transaction_date',
    sortOrder: 'DESC'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const queryParams = {
        ...params,
        page: pagination.currentPage,
        limit: pagination.limit
      };
      const data = await api.transactions.getAll(queryParams);
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load transactions:', err.message);
      setError('Could not retrieve transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch transactions when params or page changes
  useEffect(() => {
    fetchTransactions();
  }, [params, pagination.currentPage]);

  useEffect(() => {
    const handleRefresh = () => {
      fetchTransactions();
    };
    window.addEventListener('transaction-saved', handleRefresh);
    return () => {
      window.removeEventListener('transaction-saved', handleRefresh);
    };
  }, []);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleParamsChange = (newParams) => {
    setParams(newParams);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to page 1 on filter change
  };

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (data) => {
    try {
      if (editingTransaction) {
        await api.transactions.update(editingTransaction.id, data);
      } else {
        await api.transactions.add(data);
      }
      setIsModalOpen(false);
      fetchTransactions();
    } catch (err) {
      alert(err.message || 'Error saving transaction');
    }
  };

  const handleDeleteTransaction = async (id) => {
    console.log('handleDeleteTransaction invoked in Transactions page, ID:', id);
    try {
      await api.transactions.delete(id);
      fetchTransactions();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert(err.message || 'Error deleting transaction');
    }
  };

  const handleExportCSV = () => {
    const url = api.transactions.getExportUrl(params);
    
    // Set authentication token manually via a URL redirect or a hidden frame if needed, 
    // but since getExportUrl returns a URL, if we fetch and download as a file blob it handles the header correctly.
    // Let's implement fetch-based download so that the Authorization Header is sent!
    const downloadCSV = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(url, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!response.ok) throw new Error('Download failed');
        
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } catch (err) {
        alert('Could not export CSV: ' + err.message);
      }
    };
    
    downloadCSV();
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Transactions Ledger</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track and manage all your cash flows in one place.</p>
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

      {/* Main Table view */}
      {loading && transactions.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <TransactionTable
          transactions={transactions}
          pagination={pagination}
          params={params}
          onParamsChange={handleParamsChange}
          onPageChange={handlePageChange}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteTransaction}
          onExport={handleExportCSV}
          showFilters={true}
        />
      )}

      {/* CRUD Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        transaction={editingTransaction}
      />
    </div>
  );
}
