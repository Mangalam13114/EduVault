import React from 'react';
import { motion } from 'framer-motion';
import './Layout.css';

const Sidebar = ({ students, selectedStudent, onSelectStudent, isOpen, onClose }) => {
  const getInitials = (name) => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'S';

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">My Students ({students.length})</div>

        {students.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            No students enrolled yet
          </div>
        ) : (
          students.map(({ student, courses }, index) => (
            <motion.button
              key={student._id}
              className={`sidebar-item ${selectedStudent?._id === student._id ? 'active' : ''}`}
              onClick={() => { onSelectStudent(student); onClose?.(); }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 3 }}
            >
              <div className="sidebar-item-avatar">{getInitials(student.name)}</div>
              <div className="sidebar-item-info">
                <div className="sidebar-item-name">{student.name}</div>
                <div className="sidebar-item-sub">{courses.map(c => c.code).join(', ')}</div>
              </div>
            </motion.button>
          ))
        )}
      </div>
    </>
  );
};

export default Sidebar;