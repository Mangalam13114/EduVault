import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiUser, FiCalendar, FiHash } from 'react-icons/fi';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../Layout/Navbar';
import AssignmentList from '../Assignment/AssignmentList';
import AssignmentSubmit from '../Assignment/AssignmentSubmit';
import ChatWindow from '../Chat/ChatWindow';
import Loader from '../Common/Loader';
import '../Common/Common.css';
import './Course.css';

const CourseView = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatId, setChatId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, assignmentsRes] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get(`/assignments/course/${courseId}`)
        ]);
        setCourse(courseRes.data.course);
        setAssignments(assignmentsRes.data.assignments);

        if (user.role === 'student') {
          const subsMap = {};
          for (const assignment of assignmentsRes.data.assignments) {
            try {
              const subRes = await api.get(`/submissions/student/${assignment._id}`);
              if (subRes.data.submission) {
                subsMap[assignment._id] = subRes.data.submission;
              }
            } catch (e) { /* no submission */ }
          }
          setSubmissions(subsMap);
        }
      } catch (err) {
        toast.error('Failed to load course data');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, user.role, navigate]);

  const handleSubmissionComplete = (assignmentId, submission) => {
    setSubmissions(prev => ({ ...prev, [assignmentId]: submission }));
    setSelectedAssignment(null);
    toast.success('Assignment submitted successfully!');
  };

  // Determine if resubmission is allowed
  const canResubmit = (submission) => {
    if (!submission) return true; // No submission yet = can submit
    return ['rejected', 'pending', 'need_improvement'].includes(submission.status);
  };

  const handleOpenChat = async () => {
    if (!course || user.role !== 'student') return;
    try {
      const res = await api.post('/chat', {
        courseId: course._id
      });
      setChatId(res.data.data._id);
      setShowChat(true);
    } catch (err) {
      console.error('Error opening chat:', err);
      toast.error(err.response?.data?.message || 'Failed to open chat');
    }
  };

  if (loading) {
    return (<><Navbar /><div className="main-content"><Loader text="Loading course..." /></div></>);
  }

  if (!course) return null;

  return (
    <div className="course-view">
      <Navbar />
      <div className="main-content">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <motion.button
            onClick={() => navigate('/dashboard')}
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.96 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', background: 'none',
              border: 'none', color: 'var(--text-secondary)', fontSize: '13px',
              cursor: 'pointer', marginBottom: '18px', padding: 0
            }}
          >
            <FiArrowLeft /> Back to Dashboard
          </motion.button>

          <div className="course-view-header">
            <div style={{ height: '4px', width: '50px', borderRadius: '2px', background: course.color || 'var(--accent-1)', marginBottom: '14px' }} />
            <div className="course-view-title">{course.name}</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
              {course.description || 'No description available'}
            </p>
            <div className="course-view-meta">
              <span><FiHash /> {course.code}</span>
              <span><FiUser /> {course.teacher?.name}</span>
              <span><FiCalendar /> Section {course.section || 'A'}</span>
            </div>
          </div>

          {user.role === 'student' && (
            <motion.button
              onClick={handleOpenChat}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: '18px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              💬 Message Teacher
            </motion.button>
          )}

          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-heading)' }}>
            Assignments
          </h3>

          {assignments.length === 0 ? (
            <div className="empty-state">
              <h3>No assignments yet</h3>
              <p>Your teacher hasn't posted any assignments for this course.</p>
            </div>
          ) : (
            <AssignmentList
              assignments={assignments}
              submissions={submissions}
              onSelect={(assignment) => {
                const sub = submissions[assignment._id];
                // Only allow selection if can resubmit or no submission
                if (user.role === 'student' && sub && !canResubmit(sub)) {
                  // Still allow viewing details but not resubmitting
                  setSelectedAssignment(
                    selectedAssignment?._id === assignment._id ? null : assignment
                  );
                } else {
                  setSelectedAssignment(
                    selectedAssignment?._id === assignment._id ? null : assignment
                  );
                }
              }}
              selectedId={selectedAssignment?._id}
              userRole={user.role}
              canResubmit={canResubmit}
              renderExpandedFooter={(assignment, submission) => {
                const isSelected = selectedAssignment?._id === assignment._id;
                if (!isSelected) return null;
                if (user.role !== 'student') return null;
                if (!canResubmit(submission)) return null;
                return (
                  <AssignmentSubmit
                    assignment={assignment}
                    existingSubmission={submission}
                    onSubmitComplete={(newSubmission) => handleSubmissionComplete(assignment._id, newSubmission)}
                    onCancel={() => setSelectedAssignment(null)}
                  />
                );
              }}
            />
          )}
        </motion.div>
      </div>
      {showChat && chatId && (
        <ChatWindow
          chatId={chatId}
          course={course}
          recipient={course.teacher}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default CourseView;
