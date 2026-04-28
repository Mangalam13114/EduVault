// ═══════════════════════════════════════════════════════
// Course Controller - Updated with enrollment count
// ═══════════════════════════════════════════════════════
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

exports.createCourse = async (req, res) => {
  try {
    const { name, code, description, section, color } = req.body;

    const course = await Course.create({
      name, code, description,
      section: section || 'A',
      color: color || '#6C63FF',
      teacher: req.user.id
    });

    res.status(201).json({ success: true, course });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Course code already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getTeacherCourses = async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user.id })
      .populate('teacher', 'name email');

    // Add enrollment count for each course
    const coursesWithCount = await Promise.all(
      courses.map(async (course) => {
        const enrollmentCount = await Enrollment.countDocuments({ course: course._id, status: 'approved' });
        return {
          ...course.toObject(),
          enrolledStudents: enrollmentCount
        };
      })
    );

    res.json({ success: true, courses: coursesWithCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getStudentCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate({
        path: 'course',
        populate: { path: 'teacher', select: 'name email' }
      });

    const courses = enrollments
      .filter(e => e.status === 'approved')
      .map(e => e.course);
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('teacher', 'name email department');
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'name email');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const enrollmentCount = await Enrollment.countDocuments({ course: course._id, status: 'approved' });

    res.json({
      success: true,
      course: { ...course.toObject(), enrolledStudents: enrollmentCount }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get enrolled students for a course
// @route   GET /api/courses/:id/students
exports.getCourseStudents = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ course: req.params.id, status: 'approved' })
      .populate('student', 'name email department rollNumber profilePhoto');

    const students = enrollments.map(e => e.student);
    res.json({ success: true, students, count: students.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get analytics data for a course
// @route   GET /api/courses/:id/analytics
exports.getCourseAnalytics = async (req, res) => {
  try {
    const Submission = require('../models/Submission');
    const Assignment = require('../models/Assignment');

    const assignments = await Assignment.find({ course: req.params.id });
    const assignmentIds = assignments.map(a => a._id);
    const submissions = await Submission.find({ assignment: { $in: assignmentIds } })
      .populate('student', 'name')
      .populate('assignment', 'title totalMarks');

    // Status breakdown
    const statusCounts = {
      pending: submissions.filter(s => s.status === 'pending').length,
      approved: submissions.filter(s => s.status === 'approved').length,
      rejected: submissions.filter(s => s.status === 'rejected').length,
      need_improvement: submissions.filter(s => s.status === 'need_improvement').length
    };

    // AI detection distribution
    const aiScores = submissions
      .filter(s => s.aiDetection?.score !== null)
      .map(s => s.aiDetection.score);

    // Plagiarism distribution
    const plagScores = submissions
      .filter(s => s.plagiarism?.percentage !== null)
      .map(s => s.plagiarism.percentage);

    // Per-assignment stats
    const assignmentStats = assignments.map(a => {
      const subs = submissions.filter(s =>
        s.assignment?._id?.toString() === a._id.toString()
      );
      return {
        title: a.title,
        total: subs.length,
        approved: subs.filter(s => s.status === 'approved').length,
        rejected: subs.filter(s => s.status === 'rejected').length,
        pending: subs.filter(s => s.status === 'pending').length,
        needImprovement: subs.filter(s => s.status === 'need_improvement').length,
        avgAI: subs.filter(s => s.aiDetection?.score !== null).length > 0
          ? Math.round(subs.filter(s => s.aiDetection?.score !== null).reduce((a, s) => a + s.aiDetection.score, 0) / subs.filter(s => s.aiDetection?.score !== null).length)
          : 0,
        avgPlag: subs.filter(s => s.plagiarism?.percentage !== null).length > 0
          ? Math.round(subs.filter(s => s.plagiarism?.percentage !== null).reduce((a, s) => a + s.plagiarism.percentage, 0) / subs.filter(s => s.plagiarism?.percentage !== null).length)
          : 0
      };
    });

    // Marks distribution
    const marksData = submissions
      .filter(s => s.marks !== null && s.marks !== undefined)
      .map(s => ({
        student: s.student?.name,
        marks: s.marks,
        assignment: s.assignment?.title
      }));

    res.json({
      success: true,
      analytics: {
        statusCounts,
        aiScores,
        plagScores,
        assignmentStats,
        marksData,
        totalSubmissions: submissions.length,
        totalAssignments: assignments.length
      }
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};