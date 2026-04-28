import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiUsers } from 'react-icons/fi';
import api from '../../utils/api';
import Loader from '../Common/Loader';
import './Course.css';

const CourseStudentsModal = ({ course, onClose }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get(`/courses/${course._id}/students`);
        setStudents(res.data.students);
      } catch (err) {
        console.error('Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [course._id]);

  const getInitials = (name) => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'S';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
      >
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiUsers /> {course.name}
          </h2>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>

        <div style={{
          padding: '10px 16px', marginBottom: '16px', borderRadius: '10px',
          background: `linear-gradient(135deg, ${course.color || '#4facfe'}15, transparent)`,
          border: `1px solid ${course.color || '#4facfe'}25`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{course.code} · Section {course.section || 'A'}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{course.description || ''}</div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: course.color || 'var(--accent-1)' }}>
            {students.length}
          </div>
        </div>

        <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '12px' }}>
          Enrolled Students
        </h4>

        {loading ? (
          <Loader text="Loading students..." />
        ) : students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '13px' }}>
            No students enrolled in this course yet.
          </div>
        ) : (
          <div className="course-students-list">
            {students.map((student, i) => (
              <motion.div
                key={student._id}
                className="course-student-item"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="course-student-avatar">
                  {student.profilePhoto ? (
                    <img src={`http://localhost:5000/${student.profilePhoto}`} alt=""
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : getInitials(student.name)}
                </div>
                <div className="course-student-info">
                  <div className="course-student-name">{student.name}</div>
                  <div className="course-student-email">{student.email}</div>
                </div>
                {student.rollNumber && (
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '3px 10px', borderRadius: '10px', border: '1px solid var(--border-default)' }}>
                    {student.rollNumber}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CourseStudentsModal;