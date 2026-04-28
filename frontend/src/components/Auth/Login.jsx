import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiBookOpen, FiMoon, FiSun, FiLoader } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import GoogleAuthButton from './GoogleAuthButton';
import AuthEducationBackground from './AuthEducationBackground';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isDarkMode, applyTheme } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (user) => {
    toast.success(`Welcome back, ${user.name}!`);
    navigate('/dashboard');
  };

  return (
    <div className="auth-container">
      <div className="auth-bg-shape auth-bg-shape-1" />
      <div className="auth-bg-shape auth-bg-shape-2" />
      <div className="auth-bg-shape auth-bg-shape-3" />
      <AuthEducationBackground />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="auth-theme-toggle-wrap">
          <button
            type="button"
            className="auth-theme-toggle"
            onClick={() => applyTheme(!isDarkMode)}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <FiSun size={14} /> : <FiMoon size={14} />}
            <span>{isDarkMode ? 'Light' : 'Dark'}</span>
          </button>
        </div>

        <div className="auth-logo">
          <motion.div
            className="auth-logo-icon"
            initial={{ rotate: -15, scale: 0 }}
            animate={{ rotate: -5, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <FiBookOpen color="#0f1219" />
          </motion.div>
          <h1>EduVault</h1>
          <p>Smart Assignment Management Portal</p>
        </div>

        {error && (
          <motion.div
            className="auth-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" className="input-field" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" className="input-field" placeholder="Enter your password"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div className="forgot-link">
            <Link to="/forgot-password">Forgot your password?</Link>
          </div>

          <motion.button
            type="submit"
            className={`btn-primary auth-submit ${loading ? 'is-loading' : ''}`}
            disabled={loading}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? (
              <>
                <FiLoader className="auth-loading-icon" />
                Signing in...
              </>
            ) : 'Sign In'}
          </motion.button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <GoogleAuthButton mode="login" onSuccess={handleGoogleSuccess} />

        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Create one</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;