// ═══════════════════════════════════════════════════════
// Assignment Routes
// ═══════════════════════════════════════════════════════
const express = require('express');
const router = express.Router();
const {
  createAssignment,
  getAssignmentsByCourse,
  getAssignment,
  getTeacherAssignments,
  updateAssignment,
  deleteAssignment
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('teacher'), createAssignment);
router.get('/teacher', protect, authorize('teacher'), getTeacherAssignments);
router.get('/course/:courseId', protect, getAssignmentsByCourse);
router.get('/:id', protect, getAssignment);
router.put('/:id', protect, authorize('teacher'), updateAssignment);
router.delete('/:id', protect, authorize('teacher'), deleteAssignment);

module.exports = router;