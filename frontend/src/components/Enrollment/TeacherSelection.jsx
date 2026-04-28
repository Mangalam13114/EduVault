import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../Common/Loader';
import './Enrollment.css';

const TeacherSelection = () => {
  const [teachers, setTeachers] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await api.get('/enrollment/teachers');
        setTeachers(res.data.teachers);
      } catch (err) {
        toast.error('Failed to load teachers');
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const toggleCourse = (courseId) => {
    setSelectedCourses(prev =>
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const handleEnroll = async () => {
    if (selectedCourses.length === 0) {
      toast.warning('Please select at least one course');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/enrollment', { courseIds: selectedCourses });
      updateUser({ isOnboarded: true });
      toast.success('Successfully enrolled!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name) => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'T';

  if (loading) return <Loader text="Loading available courses..." />;

  return (
    <motion.div
      className="enrollment-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="enrollment-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1>Choose Your Courses</h1>
        <p>Select the courses you want to enroll in. You can pick multiple courses from different teachers.</p>
      </motion.div>

      {teachers.length === 0 ? (
        <div className="empty-state">
          <h3>No courses available</h3>
          <p>Please check back later or contact your institution.</p>
        </div>
      ) : (
        <>
          <div className="teacher-list">
            {teachers.map(({ teacher, courses }, tIndex) => (
              <motion.div
                key={teacher._id}
                className="teacher-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: tIndex * 0.1 + 0.3 }}
              >
                <div className="teacher-card-header">
                  <div className="teacher-avatar-lg">{getInitials(teacher.name)}</div>
                  <div className="teacher-info">
                    <h3>{teacher.name}</h3>
                    <p>{teacher.email} {teacher.department && `· ${teacher.department}`}</p>
                  </div>
                </div>

                <div className="course-chips">
                  {courses.map(course => (
                    <motion.div
                      key={course._id}
                      className={`course-chip ${selectedCourses.includes(course._id) ? 'selected' : ''}`}
                      onClick={() => toggleCourse(course._id)}
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ y: -2 }}
                    >
                      <div className="course-chip-check">
                        {selectedCourses.includes(course._id) && <FiCheck />}
                      </div>
                      <div className="course-chip-info">
                        <div className="course-chip-name">{course.name}</div>
                        <div className="course-chip-code">{course.code} · Section {course.section}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="enrollment-count"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span>{selectedCourses.length}</span> course(s) selected
          </motion.div>

          <div className="enrollment-footer">
            <motion.button
              className="btn-primary"
              onClick={handleEnroll}
              disabled={submitting || selectedCourses.length === 0}
              style={{ padding: '14px 48px', fontSize: '14px' }}
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
            >
              {submitting ? 'Enrolling...' : 'Confirm Enrollment'}
            </motion.button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default TeacherSelection;