// ═══════════════════════════════════════════════════════
// Assignment Controller
// ═══════════════════════════════════════════════════════
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');

// @desc    Create assignment (Teacher only)
// @route   POST /api/assignments
// @access  Private (Teacher)
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, courseId, startDate, endDate, totalMarks, section } = req.body;

    // Verify teacher owns the course
    const course = await Course.findOne({ _id: courseId, teacher: req.user.id });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or you are not authorized'
      });
    }

    const assignment = await Assignment.create({
      title,
      description,
      course: courseId,
      teacher: req.user.id,
      startDate,
      endDate,
      totalMarks: totalMarks || 100,
      section: section || course.section
    });

    await assignment.populate('course', 'name code');

    res.status(201).json({ success: true, assignment });
  } catch (error) {
    console.error('Create Assignment Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get assignments by course
// @route   GET /api/assignments/course/:courseId
// @access  Private
exports.getAssignmentsByCourse = async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId })
      .populate('course', 'name code')
      .populate('teacher', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
exports.getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'name code')
      .populate('teacher', 'name email');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    res.json({ success: true, assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all assignments by teacher
// @route   GET /api/assignments/teacher
// @access  Private (Teacher)
exports.getTeacherAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ teacher: req.user.id })
      .populate('course', 'name code')
      .sort({ createdAt: -1 });

    res.json({ success: true, assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private (Teacher)
exports.updateAssignment = async (req, res) => {
  try {
    let assignment = await Assignment.findOne({ _id: req.params.id, teacher: req.user.id });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or not authorized'
      });
    }

    assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('course', 'name code');

    res.json({ success: true, assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Teacher)
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndDelete({ _id: req.params.id, teacher: req.user.id });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or not authorized'
      });
    }

    res.json({ success: true, message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};