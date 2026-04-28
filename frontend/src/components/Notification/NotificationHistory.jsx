import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiUsers, FiBook } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import api from '../../utils/api';
import Loader from '../Common/Loader';
import '../Dashboard/Dashboard.css';

const NotificationHistory = () => {
  const [sentNotifs, setSentNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSent = async () => {
      try {
        const res = await api.get('/notifications/sent');
        setSentNotifs(res.data.notifications);
      } catch (err) {
        console.error('Failed to load notification history');
      } finally {
        setLoading(false);
      }
    };
    fetchSent();
  }, []);

  if (loading) return <Loader text="Loading notification history..." />;

  return (
    <div className="notif-history" style={{ marginTop: '28px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FiClock /> Notification History
      </h3>

      {sentNotifs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '13px' }}>
          You haven't sent any notifications yet.
        </div>
      ) : (
        sentNotifs.map((notif, i) => (
          <motion.div
            key={notif._id}
            className="notif-history-item"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
              <h4>{notif.title}</h4>
              <span style={{
                fontSize: '9px', fontWeight: 700, padding: '3px 10px',
                borderRadius: '10px', textTransform: 'uppercase',
                background: 'rgba(79,172,254,0.08)', color: 'var(--accent-1)',
                border: '1px solid rgba(79,172,254,0.15)', flexShrink: 0
              }}>
                {notif.type}
              </span>
            </div>
            <p>{notif.message}</p>

            <div className="notif-history-meta">
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiClock size={11} />
                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
              </span>
              {notif.course && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiBook size={11} />
                  {notif.course.name} ({notif.course.code})
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiUsers size={11} />
                Sent to {notif.recipients?.length || 0} student(s)
              </span>
            </div>

            {/* Show recipient names */}
            {notif.recipients && notif.recipients.length > 0 && (
              <div style={{ marginTop: '8px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {notif.recipients.slice(0, 8).map(r => (
                  <span key={r._id} style={{
                    fontSize: '10px', padding: '2px 8px', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-default)',
                    color: 'var(--text-secondary)'
                  }}>
                    {r.name || r.email}
                  </span>
                ))}
                                {notif.recipients.length > 8 && (
                  <span style={{
                    fontSize: '10px', padding: '2px 8px', borderRadius: '8px',
                    background: 'rgba(79,172,254,0.06)', color: 'var(--accent-1)',
                    border: '1px solid rgba(79,172,254,0.15)'
                  }}>
                    +{notif.recipients.length - 8} more
                  </span>
                )}
              </div>
            )}
          </motion.div>
        ))
      )}
    </div>
  );
};

export default NotificationHistory;