import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiLock, FiBell, FiMoon, FiSave } from 'react-icons/fi';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../Layout/Navbar';
import '../Common/Common.css';

const SettingsPage = () => {
  const { user, updateUser, applyTheme } = useAuth();
  const navigate = useNavigate();

  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: user?.settings?.emailNotifications ?? true,
    darkMode: user?.settings?.darkMode ?? true
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await api.put('/auth/settings', settings);
      updateUser({ settings: res.data.settings });
      toast.success('Settings saved!');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDarkModeToggle = async (nextValue) => {
    const nextSettings = { ...settings, darkMode: nextValue };
    setSettings(nextSettings);
    applyTheme(nextValue);

    try {
      const res = await api.put('/auth/settings', nextSettings);
      updateUser({ settings: res.data.settings });
      toast.success(nextValue ? 'Dark mode enabled' : 'Light mode enabled');
    } catch (err) {
      toast.error('Failed to update theme');
      setSettings(prev => ({ ...prev, darkMode: !nextValue }));
      applyTheme(!nextValue);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const ToggleSwitch = ({ value, onChange }) => (
    <motion.div
      onClick={() => onChange(!value)}
      style={{
        width: '44px', height: '24px', borderRadius: '12px', cursor: 'pointer',
        background: value ? 'var(--accent-1)' : 'rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', padding: '2px',
        transition: 'background 0.2s ease', flex: '0 0 44px', flexShrink: 0
      }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        style={{
          width: '20px', height: '20px', borderRadius: '50%',
          background: value ? '#0f1219' : 'var(--text-muted)'
        }}
        animate={{ x: value ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.div>
  );

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <Navbar />
      <div className="main-content" style={{ maxWidth: '720px', margin: '62px auto 0', padding: '28px 24px' }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <motion.button onClick={() => navigate('/dashboard')} whileHover={{ x: -3 }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', marginBottom: '20px', padding: 0 }}>
            <FiArrowLeft /> Back to Dashboard
          </motion.button>

          <div className="page-header">
            <h1>Settings</h1>
            <p>Manage your preferences and security</p>
          </div>

          {/* General Settings */}
          <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚙️ Preferences
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Email Notifications */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiBell size={16} /> Email Notifications
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Receive email notifications for assignments and updates
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', minWidth: '44px', flex: '0 0 44px' }}>
                  <ToggleSwitch value={settings.emailNotifications} onChange={(v) => setSettings(p => ({ ...p, emailNotifications: v }))} />
                </div>
              </div>

              <div style={{ height: '1px', background: 'var(--border-default)' }} />

              {/* Dark Mode */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiMoon size={16} /> Dark Mode
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Use dark theme across the application
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', minWidth: '44px', flex: '0 0 44px' }}>
                  <ToggleSwitch value={settings.darkMode} onChange={handleDarkModeToggle} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <motion.button className="btn-primary" onClick={handleSaveSettings} disabled={savingSettings} whileTap={{ scale: 0.96 }}>
                <FiSave /> {savingSettings ? 'Saving...' : 'Save Preferences'}
              </motion.button>
            </div>
          </div>

          {/* Change Password */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiLock /> Change Password
            </h3>

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" className="input-field" placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" className="input-field" placeholder="Min 6 characters"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} required minLength={6} />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" className="input-field" placeholder="Repeat new password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <motion.button type="submit" className="btn-danger" disabled={changingPassword} whileTap={{ scale: 0.96 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiLock /> {changingPassword ? 'Changing...' : 'Change Password'}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;