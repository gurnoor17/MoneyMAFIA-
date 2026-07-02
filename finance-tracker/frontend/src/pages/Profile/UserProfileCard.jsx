import React from 'react';
import { Mail, Calendar } from 'lucide-react';

export default function UserProfileCard({ profileData, joinDate }) {
  if (!profileData) return null;

  return (
    <div className="glass-panel" style={{ padding: '32px', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
      <div 
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '2rem',
          fontWeight: 800
        }}
      >
        {profileData.profile.name.charAt(0).toUpperCase()}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{profileData.profile.name}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <Mail size={16} />
          <span>{profileData.profile.email}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
          <Calendar size={16} />
          <span>Member since {joinDate}</span>
        </div>
      </div>
    </div>
  );
}
