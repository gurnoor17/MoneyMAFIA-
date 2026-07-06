import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import profileService from '../services/profileService';
import useAuth from '../hooks/useAuth';
import UserProfileCard from '../components/profile/UserProfileCard';
import UserStatsGrid from '../components/profile/UserStatsGrid';
import UpdateProfileForm from '../components/profile/UpdateProfileForm';
import ChangePasswordForm from '../components/profile/ChangePasswordForm';
import DangerZone from '../components/profile/DangerZone';

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
      const data = await profileService.getSummary();
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
      const data = await profileService.update({ name, email });
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
      const data = await profileService.changePassword({ currentPassword, newPassword });
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
      await profileService.deleteAccount();
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
          <UserProfileCard profileData={profileData} joinDate={joinDate} />

          {/* Stats Summary Grid */}
          <UserStatsGrid profileData={profileData} />

        </div>

        {/* Right Side: Account Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Edit Info Form */}
          <UpdateProfileForm
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            updatingProfile={updatingProfile}
            handleUpdateProfile={handleUpdateProfile}
          />

          {/* Change Password Form */}
          <ChangePasswordForm
            currentPassword={currentPassword}
            setCurrentPassword={setCurrentPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            changingPassword={changingPassword}
            handleChangePassword={handleChangePassword}
          />

          {/* Danger Zone account deletion */}
          <DangerZone handleDeleteAccount={handleDeleteAccount} />

        </div>
      </div>
    </div>
  );
}
