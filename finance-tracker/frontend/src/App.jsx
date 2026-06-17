import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Profile from './pages/Profile';

// Layout Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import TransactionModal from './components/TransactionModal';
import { api } from './services/api';

// Protected Route Wrapper Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loading moneyMafia...</span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Layout wrapper for authenticated users
const AppLayoutWrapper = ({ children, isDarkMode, setIsDarkMode }) => {
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
      await api.transactions.add(data);
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
        <Navbar
          toggleSidebar={toggleSidebar}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />

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

function AppContent() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check local storage or default to system dark preference
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode theme class
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes inside App Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayoutWrapper isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
                <Dashboard />
              </AppLayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <AppLayoutWrapper isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
                <Transactions />
              </AppLayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/budgets"
          element={
            <ProtectedRoute>
              <AppLayoutWrapper isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
                <Budgets />
              </AppLayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayoutWrapper isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
                <Profile />
              </AppLayoutWrapper>
            </ProtectedRoute>
          }
        />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
