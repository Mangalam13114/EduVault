import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiSend } from 'react-icons/fi';
import api from '../../utils/api';
import './Notification.css';

const SendNotification = ({ courses, students }) => {
  const [form, setForm] = useState({
    title: '', message: '', courseId: '', type: 'general', recipientIds: []
  });
  const [sending, setSending] = useState(false);
  const [sendMode, setSendMode] = useState('course');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) {
      toast.warning('Title and message are required');
      return;
    }
    if (sendMode === 'course' && !form.courseId) {
      toast.warning('Please select a course');
      return;
    }
    if (sendMode === 'individual' && form.recipientIds.length === 0) {
      toast.warning('Please select at least one student');
      return;
    }

    setSending(true);
    try {
      await api.post('/notifications', {
        ...form,
        recipientIds: sendMode === 'individual' ? form.recipientIds : []
      });
      toast.success('Notification sent successfully!');
      setForm({ title: '', message: '', courseId: '', type: 'general', recipientIds: [] });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const toggleRecipient = (studentId) => {
    setForm(prev => ({
      ...prev,
      recipientIds: prev.recipientIds.includes(studentId)
        ? prev.recipientIds.filter(id => id !== studentId)
        : [...prev.recipientIds, studentId]
    }));
  };

  return (
    <div className="notif-form-container">
      <h3><FiSend /> Send Notification</h3>

      <div className="send-mode-toggle">
        <motion.button
          className={`send-mode-btn ${sendMode === 'course' ? 'active' : ''}`}
          onClick={() => setSendMode('course')}
          whileTap={{ scale: 0.96 }}
        >
          By Course
        </motion.button>
        <motion.button
          className={`send-mode-btn ${sendMode === 'individual' ? 'active' : ''}`}
          onClick={() => setSendMode('individual')}
          whileTap={{ scale: 0.96 }}
        >
          Individual Students
        </motion.button>
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {sendMode === 'course' && (
          <div className="form-group">
            <label>Course</label>
            <select className="input-field" value={form.courseId}
              onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))}>
              <option value="">Select course</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
            </select>
          </div>
        )}

        {sendMode === 'individual' && (
          <div className="form-group">
            <label>Select Students ({form.recipientIds.length} selected)</label>
            <div className="recipient-chips">
              {students.map(({ student }) => (
                <motion.button
                  key={student._id}
                  type="button"
                  className={`recipient-chip ${form.recipientIds.includes(student._id) ? 'selected' : ''}`}
                  onClick={() => toggleRecipient(student._id)}
                  whileTap={{ scale: 0.95 }}
                >
                  {student.name}
                </motion.button>
              ))}
            </div>
            {students.length === 0 && (
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>No students enrolled yet</p>
            )}
          </div>
        )}

        <div className="form-group">
          <label>Type</label>
          <select className="input-field" value={form.type}
            onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
            <option value="general">General</option>
            <option value="assignment">Assignment</option>
            <option value="deadline">Deadline</option>
            <option value="grade">Grade</option>
            <option value="announcement">Announcement</option>
          </select>
        </div>

        <div className="form-group">
          <label>Title</label>
          <input className="input-field" placeholder="Notification title" value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
        </div>

        <div className="form-group">
          <label>Message</label>
          <textarea className="textarea-field" placeholder="Write your notification..."
            value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <motion.button type="submit" className="btn-primary" disabled={sending} whileTap={{ scale: 0.96 }}>
            {sending ? 'Sending...' : 'Send Notification'}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default SendNotification;