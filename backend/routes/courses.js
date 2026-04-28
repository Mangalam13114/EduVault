// ═══════════════════════════════════════════════════════
// Course Routes - Updated
// ═══════════════════════════════════════════════════════
const express = require('express');
const router = express.Router();
const {
  createCourse, getTeacherCourses, getStudentCourses,
  getAllCourses, getCourse, getCourseStudents, getCourseAnalytics
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('teacher'), createCourse);
router.get('/', protect, getAllCourses);
router.get('/teacher', protect, authorize('teacher'), getTeacherCourses);
router.get('/student', protect, authorize('student'), getStudentCourses);
router.get('/:id', protect, getCourse);
router.get('/:id/students', protect, getCourseStudents);
router.get('/:id/analytics', protect, getCourseAnalytics);

module.exports = router;