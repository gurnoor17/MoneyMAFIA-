import React from 'react';

export default function SidebarUserCard({ user }) {
  if (!user) return null;
  
  return (
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
  );
}
