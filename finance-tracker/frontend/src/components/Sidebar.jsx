import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ReceiptText,
  PiggyBank,
  User,
  LogOut,
  TrendingUp,
  X,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  const handleOpenAddModal = () => {
    window.dispatchEvent(new CustomEvent('open-add-transaction-modal'));
    if (window.innerWidth <= 1024) toggleSidebar();
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 998
          }}
          onClick={toggleSidebar}
        />
      )}

      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--sidebar-border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 999,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="sidebar-component"
      >
        {/* Sidebar Header */}
        <div
          style={{
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            borderBottom: '1px solid var(--sidebar-border)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={24} style={{ color: 'var(--sidebar-active-text)' }} />
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--sidebar-active-text)' }}>
              MoneyMaFia
            </span>
          </div>

          {/* Mobile close button */}
          <button
            onClick={toggleSidebar}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--sidebar-text)',
              display: 'none'
            }}
            className="mobile-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Nav Links with Add Transaction in the Middle */}
        <nav
          style={{
            flexGrow: 1,
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          {/* Dashboard Link */}
          <NavLink
            to="/"
            onClick={() => {
              if (window.innerWidth <= 1024) toggleSidebar();
            }}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--border-radius-sm)',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
              backgroundColor: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
              transition: 'all 0.2s ease',
            })}
            className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          {/* Transactions Link */}
          <NavLink
            to="/transactions"
            onClick={() => {
              if (window.innerWidth <= 1024) toggleSidebar();
            }}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--border-radius-sm)',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
              backgroundColor: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
              transition: 'all 0.2s ease',
            })}
            className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
          >
            <ReceiptText size={20} />
            <span>Transactions</span>
          </NavLink>

          {/* MIDDLE BUTTON: Add Transaction */}
          <div style={{ padding: '8px 0' }}>
            <button
              onClick={handleOpenAddModal}
              className="btn btn-success"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                fontWeight: 700,
                borderRadius: 'var(--border-radius-sm)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} />
              <span>Add Transaction</span>
            </button>
          </div>

          {/* Budgets Link */}
          <NavLink
            to="/budgets"
            onClick={() => {
              if (window.innerWidth <= 1024) toggleSidebar();
            }}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--border-radius-sm)',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
              backgroundColor: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
              transition: 'all 0.2s ease',
            })}
            className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
          >
            <PiggyBank size={20} />
            <span>Budgets</span>
          </NavLink>

          {/* Profile Link */}
          <NavLink
            to="/profile"
            onClick={() => {
              if (window.innerWidth <= 1024) toggleSidebar();
            }}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--border-radius-sm)',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
              backgroundColor: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
              transition: 'all 0.2s ease',
            })}
            className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
          >
            <User size={20} />
            <span>Profile</span>
          </NavLink>
        </nav>

        {/* User Card */}
        {user && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--sidebar-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--sidebar-active-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: 'var(--sidebar-active-text)',
                fontSize: '0.9rem',
                flexShrink: 0
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--sidebar-active-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--sidebar-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email}
              </span>
            </div>
          </div>
        )}

        {/* Sidebar Footer Log out */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--sidebar-border)' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--border-radius-sm)',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'var(--danger)',
              border: 'none',
              background: 'rgba(244, 63, 94, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--danger)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.1)';
              e.currentTarget.style.color = 'var(--danger)';
            }}
          >
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Responsive Inline CSS overrides */}
      <style>{`
        @media (min-width: 1025px) {
          .sidebar-component {
            transform: translateX(0) !important;
          }
        }
        @media (max-width: 1024px) {
          .mobile-close-btn {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
