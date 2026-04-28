import React from 'react';
import { motion } from 'framer-motion';
import './Course.css';

const CourseCard = ({ course, onClick, submissions = [] }) => {
  const approved = submissions.filter(s => s.status === 'approved').length;
  const pending = submissions.filter(s => s.status === 'pending').length;
  const rejected = submissions.filter(s => s.status === 'rejected').length;

  return (
    <motion.div
      className="course-card"
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="course-card-banner" style={{ background: course.color || 'var(--accent-gradient)' }} />
      <div className="course-card-body">
        <div className="course-card-code">{course.code} · Section {course.section || 'A'}</div>
        <div className="course-card-name">{course.name}</div>
        <div className="course-card-teacher">
          {course.teacher?.name || 'Unknown Teacher'}
        </div>
        <div className="course-card-stats">
          <div className="course-card-stat">
            <div className="dot" style={{ background: 'var(--success)' }} />
            {approved} approved
          </div>
          <div className="course-card-stat">
            <div className="dot" style={{ background: 'var(--warning)' }} />
            {pending} pending
          </div>
          <div className="course-card-stat">
            <div className="dot" style={{ background: 'var(--danger)' }} />
            {rejected} rejected
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;