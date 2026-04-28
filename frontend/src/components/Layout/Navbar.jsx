import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiLogOut, FiUser, FiSettings, FiBookOpen, FiInbox, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { formatDistanceToNow } from 'date-fns';
import './Layout.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [requests, setRequests] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const requestRef = useRef(null);

  const loadTeacherRequests = async () => {
    if (user?.role !== 'teacher') return;
    try {
      const res = await api.get('/enrollment/requests');
      setRequests(res.data.requests || []);
      setRequestCount((res.data.requests || []).length);
    } catch (err) {
      // silently fail
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      } catch (err) { /* silently fail */ }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadTeacherRequests();
    const interval = setInterval(loadTeacherRequests, 30000);
    return () => clearInterval(interval);
  }, [user?.role]);

  useEffect(() => {
    const refreshEnrollmentRequests = () => {
      loadTeacherRequests();
    };

    window.addEventListener('enrollment-updated', refreshEnrollmentRequests);
    return () => window.removeEventListener('enrollment-updated', refreshEnrollmentRequests);
  }, [user?.role]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (requestRef.current && !requestRef.current.contains(e.target)) setShowRequests(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, readBy: [...(n.readBy || []), user.id] })));
    } catch (err) { /* ignore */ }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEnrollmentAction = async (requestId, action) => {
    try {
      await api.patch(`/enrollment/${requestId}/${action}`);
      setRequests(prev => prev.filter(request => request._id !== requestId));
      setRequestCount(prev => Math.max(0, prev - 1));
      window.dispatchEvent(new Event('enrollment-updated'));
    } catch (err) {
      // ignore
    }
  };

  const getInitials = (name) => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <nav className="navbar">
      <motion.div
        className="navbar-brand"
        onClick={() => navigate('/dashboard')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="navbar-brand-icon">
          <FiBookOpen color="#0f1219" size={16} />
        </div>
        <span>EduVault</span>
      </motion.div>

      <div className="navbar-actions">
        {user?.role === 'teacher' && (
          <div ref={requestRef} style={{ position: 'relative' }}>
            <motion.button
              className="navbar-request-btn"
              onClick={() => {
                const next = !showRequests;
                setShowRequests(next);
                if (next) loadTeacherRequests();
              }}
              whileTap={{ scale: 0.96 }}
            >
              <FiInbox />
              <span>Requests</span>
              {requestCount > 0 && <span className="request-badge">{requestCount > 9 ? '9+' : requestCount}</span>}
            </motion.button>

            <AnimatePresence>
              {showRequests && (
                <motion.div
                  className="request-panel"
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="request-panel-header">
                    <h3>Enrollment Requests</h3>
                    <span>{requestCount} pending</span>
                  </div>

                  <div className="request-list">
                    {requests.length === 0 ? (
                      <div className="request-empty">No pending requests</div>
                    ) : (
                      requests.map((request) => (
                        <div key={request._id} className="request-item">
                          <div className="request-item-main">
                            <div className="request-item-title">{request.student?.name || 'Unknown student'}</div>
                            <div className="request-item-meta">
                              {request.course?.name} · {request.course?.code}
                            </div>
                            <div className="request-item-submeta">
                              {request.student?.email}
                            </div>
                          </div>

                          <div className="request-item-actions">
                            <button
                              type="button"
                              className="request-action approve"
                              onClick={() => handleEnrollmentAction(request._id, 'approve')}
                            >
                              <FiCheckCircle />
                              Approve
                            </button>
                            <button
                              type="button"
                              className="request-action reject"
                              onClick={() => handleEnrollmentAction(request._id, 'reject')}
                            >
                              <FiXCircle />
                              Reject
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <motion.button
            className="navbar-icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            whileTap={{ scale: 0.92 }}
          >
            <FiBell />
            {unreadCount > 0 && (
              <motion.span
                className="notification-badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                className="notification-panel"
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.2 }}
              >
                <div className="notification-panel-header">
                  <h3>Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead}>Mark all read</button>
                  )}
                </div>
                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <motion.div
                        key={notif._id}
                        className={`notification-item ${!notif.readBy?.includes(user.id) ? 'unread' : ''}`}
                        whileHover={{ x: 2 }}
                        onClick={async () => {
                          try {
                            await api.put(`/notifications/${notif._id}/read`);
                            setNotifications(prev =>
                              prev.map(n => n._id === notif._id
                                ? { ...n, readBy: [...(n.readBy || []), user.id] } : n)
                            );
                            setUnreadCount(prev => Math.max(0, prev - 1));
                          } catch (err) { /* ignore */ }
                        }}
                      >
                        <div className="notification-item-title">{notif.title}</div>
                        <div className="notification-item-message">{notif.message}</div>
                        <div className="notification-item-time">
                          {notif.sender?.name && `From ${notif.sender.name} · `}
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="profile-menu" ref={profileRef}>
          <motion.button
            className="profile-btn"
            onClick={() => setShowProfile(!showProfile)}
            whileTap={{ scale: 0.96 }}
          >
            <div className="profile-avatar">
              {user?.profilePhoto ? (
                <img src={`http://localhost:5000/${user.profilePhoto}`} alt="" />
              ) : (
                getInitials(user?.name)
              )}
            </div>
            <span className="profile-name">{user?.name}</span>
          </motion.button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                className="profile-dropdown"
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.2 }}
              >
                <div className="profile-dropdown-header">
                  <div className="profile-dropdown-name">{user?.name}</div>
                  <div className="profile-dropdown-email">{user?.email}</div>
                  <span className="profile-dropdown-role">{user?.role}</span>
                </div>

                <motion.button
                  className="profile-dropdown-item"
                  onClick={() => { setShowProfile(false); navigate('/profile'); }}
                  whileHover={{ x: 4 }}
                >
                  <FiUser size={15} /> My Profile
                </motion.button>

                <motion.button
                  className="profile-dropdown-item"
                  onClick={() => { setShowProfile(false); navigate('/settings'); }}
                  whileHover={{ x: 4 }}
                >
                  <FiSettings size={15} /> Settings
                </motion.button>

                <div className="profile-dropdown-divider" />

                <motion.button
                  className="profile-dropdown-item danger"
                  onClick={handleLogout}
                  whileHover={{ x: 4 }}
                >
                  <FiLogOut size={15} /> Sign Out
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;