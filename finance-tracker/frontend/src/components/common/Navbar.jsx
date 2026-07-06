import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Sun, Moon, Menu } from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import NotificationDropdown from './NotificationDropdown';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar({ toggleSidebar }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();

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
      case '/loans':
        return 'Active Loans & EMIs';
      default:
        return 'moneyMafia Personal Finance';
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const data = await dashboardService.getNotifications();
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
      await dashboardService.readAllNotifications();
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
          onClick={toggleTheme}
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
        <NotificationDropdown
          notifications={notifications}
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
          dropdownRef={dropdownRef}
          handleMarkAllRead={handleMarkAllRead}
          unreadCount={unreadCount}
        />
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
