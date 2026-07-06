import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import TransactionModal from '../components/transactions/TransactionModal';
import transactionService from '../services/transactionService';

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  useEffect(() => {
    const handleOpenGlobalModal = () => {
      setIsAddModalOpen(true);
    };
    window.addEventListener('open-add-transaction-modal', handleOpenGlobalModal);
    return () => {
      window.removeEventListener('open-add-transaction-modal', handleOpenGlobalModal);
    };
  }, []);

  const handleSaveTransaction = async (data) => {
    try {
      await transactionService.add(data);
      setIsAddModalOpen(false);
      window.dispatchEvent(new CustomEvent('transaction-saved'));
    } catch (err) {
      alert(err.message || 'Error saving transaction');
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Container */}
      <div className="main-content">
        {/* Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Page Inner Content */}
        <div className="animate-fade">
          {children}
        </div>
      </div>

      {/* Global Add Transaction Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveTransaction}
        transaction={null}
      />
    </div>
  );
};

export default MainLayout;
