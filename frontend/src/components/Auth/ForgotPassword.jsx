import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import api from '../../utils/api';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSent(true);
      // In development, show the reset link directly
      if (res.data.resetUrl) {
        setResetUrl(res.data.resetUrl);
      }
      toast.success('Password reset link generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-bg-shape auth-bg-shape-1" />
      <div className="auth-bg-shape auth-bg-shape-2" />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <FiMail color="#0f1219" />
          </div>
          <h1>Reset Password</h1>
          <p>{sent ? 'Check your email for the reset link' : 'Enter your email to receive a password reset link'}</p>
        </div>

        {!sent ? (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="input-field" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <motion.button type="submit" className="btn-primary auth-submit" disabled={loading} whileTap={{ scale: 0.97 }}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </motion.button>
          </form>
        ) : (
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                background: 'rgba(52, 211, 153, 0.08)',
                border: '1px solid rgba(52, 211, 153, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                textAlign: 'center',
                marginBottom: '20px'
              }}
            >
              <p style={{ color: 'var(--success)', fontSize: '14px', fontWeight: 600 }}>
                ✅ Reset link generated!
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '8px' }}>
                In production, this would be sent to your email.
              </p>
            </motion.div>

            {/* Development only - show direct link */}
            {resetUrl && (
              <div style={{
                background: 'rgba(79, 172, 254, 0.05)',
                border: '1px solid rgba(79, 172, 254, 0.15)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                marginBottom: '16px',
                wordBreak: 'break-all'
              }}>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  DEV MODE - Direct reset link:
                </p>
                <a href={resetUrl} style={{ fontSize: '12px', color: 'var(--accent-1)' }}>
                  {resetUrl}
                </a>
              </div>
            )}
          </div>
        )}

        <div className="auth-footer">
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <FiArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;