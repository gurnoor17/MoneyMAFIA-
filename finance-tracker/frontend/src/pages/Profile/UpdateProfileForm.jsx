import React from 'react';
import { Settings } from 'lucide-react';

export default function UpdateProfileForm({
  name,
  setName,
  email,
  setEmail,
  updatingProfile,
  handleUpdateProfile
}) {
  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
        <Settings size={18} style={{ color: 'var(--primary)' }} />
        <h3 style={{ margin: 0 }}>Update Profile Details</h3>
      </div>

      <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Full Name</label>
          <input 
            type="text" 
            className="input-control" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Email Address</label>
          <input 
            type="email" 
            className="input-control" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={updatingProfile}
          style={{ alignSelf: 'flex-start', marginTop: '8px' }}
        >
          {updatingProfile ? 'Saving...' : 'Save Details'}
        </button>
      </form>
    </div>
  );
}
