// ═══════════════════════════════════════════════════════
// Enrollment Routes
// ═══════════════════════════════════════════════════════
const express = require('express');
const router = express.Router();
const {
  enrollStudent,
  getEnrolledStudents,
  getTeachersWithCourses,
  getMyEnrollments,
  getEnrollmentRequests,
  approveEnrollment,
  rejectEnrollment
} = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('student'), enrollStudent);
router.get('/requests', protect, authorize('teacher'), getEnrollmentRequests);
router.get('/students', protect, authorize('teacher'), getEnrolledStudents);
router.get('/teachers', protect, authorize('student'), getTeachersWithCourses);
router.get('/my-enrollments', protect, authorize('student'), getMyEnrollments);
router.patch('/:id/approve', protect, authorize('teacher'), approveEnrollment);
router.patch('/:id/reject', protect, authorize('teacher'), rejectEnrollment);

module.exports = router;