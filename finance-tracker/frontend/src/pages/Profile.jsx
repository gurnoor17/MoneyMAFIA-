import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Settings,
  Lock,
  Trash2
} from 'lucide-react';

export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { logout, updateUserProfileState } = useAuth();

  // Settings states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const fetchProfileSummary = async () => {
    try {
      const data = await api.profile.getSummary();
      setProfileData(data);
      setName(data.profile.name);
      setEmail(data.profile.email);
    } catch (err) {
      console.error('Failed to load profile:', err.message);
      setError('Could not load profile statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileSummary();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name || !email) return setError('Name and email are required.');

    setUpdatingProfile(true);
    try {
      const data = await api.profile.update({ name, email });
      setSuccess(data.message || 'Profile updated successfully.');
      updateUserProfileState({ name, email }); // Sync with Auth Context
      fetchProfileSummary();
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      return setError('Please enter all password fields.');
    }
    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match.');
    }
    if (newPassword.length < 6) {
      return setError('New password must be at least 6 characters long.');
    }

    setChangingPassword(true);
    try {
      const data = await api.profile.changePassword({ currentPassword, newPassword });
      setSuccess(data.message || 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    const doubleConfirm = window.confirm(
      'WARNING: Are you absolutely sure you want to delete your account? This action is irreversible and will delete all your transactions, budgets, and records!'
    );
    if (!doubleConfirm) return;

    const finalPrompt = window.prompt(
      'To verify deletion, type DELETE in all capitals below:'
    );
    if (finalPrompt !== 'DELETE') {
      return alert('Verification failed. Account deletion cancelled.');
    }

    try {
      await api.profile.deleteAccount();
      alert('Your account has been deleted successfully. Goodbye!');
      logout();
      navigate('/login');
    } catch (err) {
      alert(err.message || 'Failed to delete account.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const joinDate = profileData ? new Date(profileData.profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Profile Settings</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your personal details, credentials, and view account stats.</p>
        </div>
      </div>

      {error && (
        <div className="alert-banner alert-banner-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="alert-banner alert-banner-success">
          {success}
        </div>
      )}

      <div className="analytics-grid">
        {/* Left Side: Stats & Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* User Details card */}
          {profileData && (
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
          )}

          {/* Stats Summary Grid */}
          {profileData && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Transactions count */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Transactions</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{profileData.stats.totalTransactions}</h3>
                  <CreditCard size={24} style={{ color: 'var(--primary)' }} />
                </div>
              </div>

              {/* Balance */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Calculated Balance</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>${profileData.stats.currentBalance.toFixed(2)}</h3>
                  <Wallet size={24} style={{ color: 'var(--info)' }} />
                </div>
              </div>

              {/* Total Income */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Income Flow</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)' }}>${profileData.stats.totalIncome.toFixed(2)}</h3>
                  <TrendingUp size={24} style={{ color: 'var(--success)' }} />
                </div>
              </div>

              {/* Total Expenses */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Expenses Flow</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--danger)' }}>${profileData.stats.totalExpense.toFixed(2)}</h3>
                  <TrendingDown size={24} style={{ color: 'var(--danger)' }} />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Account Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Edit Info Form */}
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

          {/* Change Password Form */}
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

          {/* Danger Zone account deletion */}
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

        </div>
      </div>
    </div>
  );
}
