import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCamera, FiSave, FiUser, FiPhone, FiBookOpen, FiAward } from 'react-icons/fi';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../Layout/Navbar';
import '../Common/Common.css';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    department: user?.department || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    institution: user?.institution || '',
    rollNumber: user?.rollNumber || '',
    semester: user?.semester || '',
    designation: user?.designation || '',
    specialization: user?.specialization || ''
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', form);
      updateUser(res.data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPEG, PNG, GIF, WebP images allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Max 5MB.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await api.put('/auth/profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser({ profilePhoto: res.data.profilePhoto });
      toast.success('Photo updated!');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name) => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const fieldStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px'
  };

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
            <h1>My Profile</h1>
            <p>Manage your personal information</p>
          </div>

          {/* Profile Photo Section */}
          <div className="glass-card" style={{ padding: '28px', marginBottom: '20px', textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
              <div style={{
                width: '100px', height: '100px', borderRadius: '50%',
                background: 'var(--accent-gradient)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '36px', fontWeight: 800, color: '#0f1219',
                overflow: 'hidden', border: '3px solid rgba(79,172,254,0.2)'
              }}>
                {user?.profilePhoto ? (
                  <img src={`http://localhost:5000/${user.profilePhoto}`} alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : getInitials(user?.name)}
              </div>
              <motion.button
                onClick={() => fileRef.current?.click()}
                whileTap={{ scale: 0.9 }}
                style={{
                  position: 'absolute', bottom: '0', right: '0',
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'var(--accent-1)', border: '2px solid var(--bg-primary)',
                  color: '#0f1219', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: '14px'
                }}
              >
                <FiCamera />
              </motion.button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
            </div>
            {uploading && <p style={{ fontSize: '12px', color: 'var(--accent-1)' }}>Uploading...</p>}
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)' }}>{user?.name}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{user?.email}</p>
            <span style={{
              display: 'inline-block', marginTop: '8px', padding: '4px 14px',
              background: 'rgba(79,172,254,0.1)', color: 'var(--accent-1)',
              borderRadius: '12px', fontSize: '11px', fontWeight: 700, textTransform: 'capitalize'
            }}>
              {user?.role}
            </span>
          </div>

          {/* Profile Form */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '18px', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiUser /> Personal Information
            </h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={fieldStyle}>
                <div className="form-group">
                  <label><FiUser style={{ marginRight: 4 }} /> Full Name</label>
                  <input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label><FiPhone style={{ marginRight: 4 }} /> Phone</label>
                  <input className="input-field" placeholder="+1 234 567 890" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>

              <div style={fieldStyle}>
                <div className="form-group">
                  <label><FiBookOpen style={{ marginRight: 4 }} /> Department</label>
                  <input className="input-field" placeholder="Computer Science" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Institution</label>
                  <input className="input-field" placeholder="University name" value={form.institution} onChange={e => setForm(p => ({ ...p, institution: e.target.value }))} />
                </div>
              </div>

              {/* Student-specific fields */}
              {user?.role === 'student' && (
                <div style={fieldStyle}>
                  <div className="form-group">
                    <label>Roll Number</label>
                    <input className="input-field" placeholder="STU-001" value={form.rollNumber} onChange={e => setForm(p => ({ ...p, rollNumber: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Semester</label>
                    <input className="input-field" placeholder="6th" value={form.semester} onChange={e => setForm(p => ({ ...p, semester: e.target.value }))} />
                  </div>
                </div>
              )}

              {/* Teacher-specific fields */}
              {user?.role === 'teacher' && (
                <div style={fieldStyle}>
                  <div className="form-group">
                    <label><FiAward style={{ marginRight: 4 }} /> Designation</label>
                    <input className="input-field" placeholder="Professor" value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Specialization</label>
                    <input className="input-field" placeholder="Machine Learning" value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Bio</label>
                <textarea className="textarea-field" placeholder="Tell us about yourself..." value={form.bio}
                  onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} style={{ minHeight: '80px' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <motion.button type="submit" className="btn-primary" disabled={saving} whileTap={{ scale: 0.96 }}>
                  <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;