import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Sun, Moon, Bell, Menu, Check } from 'lucide-react';
import { api } from '../services/api';

export default function Navbar({ toggleSidebar, isDarkMode, setIsDarkMode }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Get current page title dynamically
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard Analytics';
      case '/transactions':
        return 'Transactions Ledger';
      case '/budgets':
        return 'Category Budgets';
      case '/profile':
        return 'User Profile & Settings';
      default:
        return 'moneyMafia Personal Finance';
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const data = await api.dashboard.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]); // Refetch on page navigation

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.dashboard.readAllNotifications();
      // Update state locally
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to clear notifications:', err.message);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header
      style={{
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(8px)',
      }}
      className="navbar-container"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Toggle Menu Button for mobile */}
        <button
          onClick={toggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            display: 'none',
            padding: '4px'
          }}
          className="mobile-hamburger-btn"
        >
          <Menu size={24} />
        </button>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
          {getPageTitle()}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Theme Switcher Button */}
        <button
          onClick={() => setIsDarkMode(prev => !prev)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--border-color)',
            transition: 'all 0.2s ease'
          }}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun size={20} style={{ color: '#fbbf24' }} /> : <Moon size={20} />}
        </button>

        {/* Notifications Icon with Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(prev => !prev)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--border-color)',
              position: 'relative'
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  backgroundColor: 'var(--danger)',
                  color: 'white',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 0 2px var(--bg-surface)'
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showDropdown && (
            <div
              className="glass-panel animate-fade"
              style={{
                position: 'absolute',
                top: '45px',
                right: 0,
                width: '320px',
                maxHeight: '400px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-lg)',
                padding: '16px',
                zIndex: 200,
                backgroundColor: 'var(--bg-surface)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '10px',
                  marginBottom: '10px'
                }}
              >
                <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>Notifications</h4>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Check size={12} />
                    Mark all read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No notifications yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--border-radius-sm)',
                        backgroundColor: n.type === 'danger' ? 'var(--danger-light)' : n.type === 'warning' ? 'var(--warning-light)' : 'rgba(255, 255, 255, 0.05)',
                        borderLeft: `3px solid ${n.type === 'danger' ? 'var(--danger)' : n.type === 'warning' ? 'var(--warning)' : 'var(--info)'}`,
                        opacity: n.is_read ? 0.6 : 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: '1.35', color: 'var(--text-primary)', fontWeight: n.is_read ? 500 : 600 }}>
                        {n.message}
                      </p>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .navbar-container {
            padding: 0 16px !important;
            position: fixed !important;
            left: 0;
            right: 0;
            width: 100vw !important;
          }
          .mobile-hamburger-btn {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}
