// ═══════════════════════════════════════════════════════
// Submission Routes - Updated with analytics
// ═══════════════════════════════════════════════════════
const express = require('express');
const router = express.Router();
const {
  submitAssignment, getStudentSubmission, getAssignmentSubmissions,
  getStudentAllSubmissions, reviewSubmission, getMySubmissions,
  getSubmissionAnalytics
} = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Analytics route (must be before parameterized routes)
router.get('/analytics', protect, getSubmissionAnalytics);

// Student routes
router.post('/', protect, authorize('student'), upload.single('file'), submitAssignment);
router.get('/my-submissions', protect, authorize('student'), getMySubmissions);
router.get('/student/:assignmentId', protect, authorize('student'), getStudentSubmission);

// Teacher routes
router.get('/assignment/:assignmentId', protect, authorize('teacher'), getAssignmentSubmissions);
router.get('/student-all/:studentId', protect, authorize('teacher'), getStudentAllSubmissions);
router.put('/:id/review', protect, authorize('teacher'), reviewSubmission);

module.exports = router;