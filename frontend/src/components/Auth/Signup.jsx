import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiBookOpen, FiMoon, FiSun, FiLoader } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import GoogleAuthButton from './GoogleAuthButton';
import AuthEducationBackground from './AuthEducationBackground';
import './Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'student', department: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup, isDarkMode, applyTheme } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...signupData } = formData;
      const user = await signup(signupData);
      toast.success(`Welcome to EduVault, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (user) => {
    toast.success(`Welcome to EduVault, ${user.name}!`);
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
          <p>Create your account to get started</p>
        </div>

        {error && (
          <motion.div className="auth-error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            {error}
          </motion.div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" className="input-field" name="name" placeholder="John Doe"
              value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" className="input-field" name="email" placeholder="you@example.com"
              value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Department</label>
            <input type="text" className="input-field" name="department" placeholder="Computer Science"
              value={formData.department} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>I am a</label>
            <div className="role-selector">
              <motion.div
                className={`role-option ${formData.role === 'student' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
                whileTap={{ scale: 0.96 }}
              >
                <span className="role-icon">🎓</span>
                <span className="role-label">Student</span>
              </motion.div>
              <motion.div
                className={`role-option ${formData.role === 'teacher' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'teacher' }))}
                whileTap={{ scale: 0.96 }}
              >
                <span className="role-icon">📚</span>
                <span className="role-label">Teacher</span>
              </motion.div>
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" className="input-field" name="password" placeholder="Min 6 characters"
              value={formData.password} onChange={handleChange} required minLength={6} />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" className="input-field" name="confirmPassword" placeholder="Repeat password"
              value={formData.confirmPassword} onChange={handleChange} required />
          </div>

          <motion.button type="submit" className={`btn-primary auth-submit ${loading ? 'is-loading' : ''}`} disabled={loading} whileTap={{ scale: 0.97 }}>
            {loading ? (
              <>
                <FiLoader className="auth-loading-icon" />
                Creating Account...
              </>
            ) : 'Create Account'}
          </motion.button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <GoogleAuthButton mode="signup" role={formData.role} onSuccess={handleGoogleSuccess} />

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;