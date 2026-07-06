import React from 'react';
import { Lock } from 'lucide-react';

export default function ChangePasswordForm({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  changingPassword,
  handleChangePassword
}) {
  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
        <Lock size={18} style={{ color: 'var(--warning)' }} />
        <h3 style={{ margin: 0 }}>Change Password</h3>
      </div>

      <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Current Password</label>
          <input 
            type="password" 
            className="input-control" 
            placeholder="••••••••"
            value={currentPassword} 
            onChange={(e) => setCurrentPassword(e.target.value)} 
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>New Password</label>
          <input 
            type="password" 
            className="input-control" 
            placeholder="••••••••"
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Confirm New Password</label>
          <input 
            type="password" 
            className="input-control" 
            placeholder="••••••••"
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={changingPassword}
          style={{ alignSelf: 'flex-start', marginTop: '8px' }}
        >
          {changingPassword ? 'Updating Password...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}
