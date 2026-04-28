import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBook, FiCheckCircle, FiClock, FiAlertTriangle, FiXCircle, FiTrendingUp, FiSearch, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../Layout/Navbar';
import CourseCard from '../Course/CourseCard';
import AnalyticsPanel from '../Analytics/AnalyticsPanel';
import Loader from '../Common/Loader';
import '../Common/Common.css';
import './Dashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [teacherDirectory, setTeacherDirectory] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [teacherFilter, setTeacherFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [requestingCourseId, setRequestingCourseId] = useState(null);

  const loadDashboardData = async () => {
    try {
      const [coursesRes, subsRes, analyticsRes, teachersRes, enrollmentsRes] = await Promise.all([
        api.get('/courses/student'),
        api.get('/submissions/my-submissions'),
        api.get('/submissions/analytics'),
        api.get('/enrollment/teachers'),
        api.get('/enrollment/my-enrollments')
      ]);
      setCourses(coursesRes.data.courses);
      setSubmissions(subsRes.data.submissions);
      setAnalytics(analyticsRes.data.analytics);
      setTeacherDirectory(teachersRes.data.teachers || []);
      setMyEnrollments(enrollmentsRes.data.enrollments || []);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const handleEnrollmentUpdate = () => {
      loadDashboardData();
    };

    window.addEventListener('enrollment-updated', handleEnrollmentUpdate);
    return () => window.removeEventListener('enrollment-updated', handleEnrollmentUpdate);
  }, []);

  const enrollmentByCourse = myEnrollments.reduce((acc, enrollment) => {
    const courseId = enrollment.course?._id || enrollment.course;
    if (courseId) {
      acc[courseId] = enrollment;
    }
    return acc;
  }, {});

  const searchableCourses = teacherDirectory.flatMap(({ teacher, courses: teacherCourses }) =>
    teacherCourses.map(course => ({ ...course, teacher }))
  );

  const filteredSearchResults = searchableCourses.filter((course) => {
    const teacherName = String(course.teacher?.name || '').toLowerCase();
    const courseName = String(course.name || '').toLowerCase();
    const courseCode = String(course.code || '').toLowerCase();
    const teacherMatch = !teacherFilter.trim() || teacherName.includes(teacherFilter.trim().toLowerCase());
    const courseMatch = !courseFilter.trim() || courseName.includes(courseFilter.trim().toLowerCase()) || courseCode.includes(courseFilter.trim().toLowerCase());
    return teacherMatch && courseMatch;
  });

  const handleRequestEnrollment = async (course) => {
    const existing = enrollmentByCourse[course._id];

    if (existing?.status === 'pending') {
      toast.info('Your request is already pending approval');
      return;
    }

    if (existing?.status === 'approved') {
      toast.success('You are already enrolled in this course');
      return;
    }

    setRequestingCourseId(course._id);
    try {
      const res = await api.post('/enrollment', { courseId: course._id });
      toast.success(res.data.message || 'Enrollment request submitted');
      window.dispatchEvent(new Event('enrollment-updated'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send enrollment request');
    } finally {
      setRequestingCourseId(null);
    }
  };

  const stats = {
    total: submissions.length,
    approved: submissions.filter(s => s.status === 'approved').length,
    pending: submissions.filter(s => s.status === 'pending').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
    needImprovement: submissions.filter(s => s.status === 'need_improvement').length
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  if (loading) {
    return (<><Navbar /><div className="main-content"><Loader text="Loading your dashboard..." /></div></>);
  }

  return (
    <div className="dashboard">
      <Navbar />
      <div className="main-content">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants} className="page-header student-page-header">
            <div className="page-header-copy">
              <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
              <p>Track your assignments and course progress</p>
            </div>

            <div className="student-search-area">
              <motion.button
                type="button"
                className="student-search-trigger"
                onClick={() => setShowSearchPanel(prev => !prev)}
                whileTap={{ scale: 0.98 }}
              >
                <FiSearch />
                <span>Search teacher or course</span>
              </motion.button>

              <AnimatePresence>
                {showSearchPanel && (
                  <motion.div
                    className="student-search-panel"
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="student-search-panel-header">
                      <div>
                        <h3>Find a subject</h3>
                        <p>Filter by teacher name, then by course code or course name.</p>
                      </div>
                      <button
                        type="button"
                        className="student-search-close"
                        onClick={() => setShowSearchPanel(false)}
                      >
                        <FiX />
                      </button>
                    </div>

                    <div className="student-search-filters">
                      <div className="form-group">
                        <label>Teacher's name</label>
                        <input
                          className="input-field"
                          placeholder="Search teacher..."
                          value={teacherFilter}
                          onChange={e => setTeacherFilter(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Course code or name</label>
                        <input
                          className="input-field"
                          placeholder="Search course..."
                          value={courseFilter}
                          onChange={e => setCourseFilter(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="student-search-results">
                      {filteredSearchResults.length === 0 ? (
                        <div className="student-search-empty">
                          No courses match your filters.
                        </div>
                      ) : (
                        filteredSearchResults.map((course) => {
                          const enrollment = enrollmentByCourse[course._id];
                          const status = enrollment?.status;
                          const actionLabel = status === 'approved'
                            ? 'Enrolled'
                            : status === 'pending'
                              ? 'Request pending'
                              : status === 'rejected'
                                ? 'Request again'
                                : 'Request enrollment';

                          return (
                            <div key={course._id} className="student-search-result">
                              <div>
                                <div className="student-search-result-meta">
                                  {course.teacher?.name || 'Unknown teacher'}
                                </div>
                                <h4>{course.name}</h4>
                                <p>{course.code} · Section {course.section || 'A'}</p>
                                {course.description && <span>{course.description}</span>}
                              </div>
                              <div className="student-search-result-actions">
                                {status && (
                                  <span className={`request-status ${status}`}>
                                    {status}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  className="btn-primary"
                                  disabled={status === 'approved' || status === 'pending' || requestingCourseId === course._id}
                                  onClick={() => handleRequestEnrollment(course)}
                                >
                                  {requestingCourseId === course._id ? 'Submitting...' : actionLabel}
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="stats-row">
            {[
              { icon: <FiBook />, value: courses.length, label: 'Courses', bg: 'rgba(168,85,247,0.16)', color: '#c084fc' },
              { icon: <FiCheckCircle />, value: stats.approved, label: 'Approved', bg: 'rgba(34,197,94,0.14)', color: '#4ade80' },
              { icon: <FiClock />, value: stats.pending, label: 'Pending', bg: 'rgba(244,114,182,0.14)', color: '#f472b6' },
              { icon: <FiXCircle />, value: stats.rejected, label: 'Rejected', bg: 'rgba(251,113,133,0.14)', color: '#fb7185' },
              { icon: <FiAlertTriangle />, value: stats.needImprovement, label: 'Improve', bg: 'rgba(236,72,153,0.14)', color: '#ec4899' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="stat-card"
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="stat-card-icon" style={{ background: stat.bg, color: stat.color }}>
                  {stat.icon}
                </div>
                <div className="stat-card-value" style={{ color: stat.color }}>{stat.value}</div>
                <div className="stat-card-label">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Tabs */}
          <motion.div variants={itemVariants} className="tabs">
            <button className={`tab ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
              My Courses
            </button>
            <button className={`tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
              <FiTrendingUp style={{ marginRight: 6 }} /> Analytics
            </button>
          </motion.div>

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <motion.div variants={itemVariants}>
              {courses.length === 0 ? (
                <div className="empty-state">
                  <FiBook size={56} />
                  <h3>No courses yet</h3>
                  <p>You haven't enrolled in any courses.</p>
                </div>
              ) : (
                <div className="course-grid">
                  {courses.map((course, i) => (
                    <motion.div
                      key={course._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <CourseCard
                        course={course}
                        onClick={() => navigate(`/course/${course._id}`)}
                        submissions={submissions.filter(
                          s => s.assignment?.course?._id === course._id || s.assignment?.course === course._id
                        )}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && analytics && (
            <motion.div variants={itemVariants}>
              <AnalyticsPanel analytics={analytics} role="student" />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;