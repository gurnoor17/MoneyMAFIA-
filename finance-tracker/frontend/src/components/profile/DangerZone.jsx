import React from 'react';
import { Trash2 } from 'lucide-react';

export default function DangerZone({ handleDeleteAccount }) {
  return (
    <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--danger-light)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--danger)' }}>
        <Trash2 size={18} />
        <h3 style={{ margin: 0 }}>Danger Zone</h3>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.4' }}>
        Deleting your account is a permanent action. All your historical logs, transactions, and categories will be immediately purged.
      </p>
      <button 
        onClick={handleDeleteAccount}
        className="btn btn-danger"
        style={{ width: '100%', padding: '12px' }}
      >
        Permanently Delete Account
      </button>
    </div>
  );
}
