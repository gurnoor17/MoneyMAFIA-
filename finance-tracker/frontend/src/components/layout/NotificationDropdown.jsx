import React from 'react';
import { Bell, Check } from 'lucide-react';

export default function NotificationDropdown({
  notifications,
  showDropdown,
  setShowDropdown,
  dropdownRef,
  handleMarkAllRead,
  unreadCount
}) {
  return (
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
  );
}
