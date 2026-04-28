// ═══════════════════════════════════════════════════════
// Enrollment Controller - Student ↔ Teacher ↔ Course
// ═══════════════════════════════════════════════════════
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

const populateEnrollmentDetails = (query) => query
  .populate('student', 'name email department rollNumber profilePhoto')
  .populate('teacher', 'name email department')
  .populate('course', 'name code description section color');

// @desc    Enroll student in courses (Teacher selection)
// @route   POST /api/enrollment
// @access  Private (Student)
exports.enrollStudent = async (req, res) => {
  try {
    const courseIds = Array.isArray(req.body.courseIds)
      ? req.body.courseIds
      : req.body.courseId
        ? [req.body.courseId]
        : [];

    if (!courseIds || courseIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one course'
      });
    }

    const enrollments = [];

    for (const courseId of courseIds) {
      const course = await Course.findById(courseId);
      if (!course) continue;

      // Check for an existing request or approved enrollment
      const existing = await Enrollment.findOne({
        student: req.user.id,
        course: courseId
      });

      if (!existing) {
        const enrollment = await Enrollment.create({
          student: req.user.id,
          teacher: course.teacher,
          course: courseId,
          status: 'pending'
        });
        enrollments.push(enrollment);
      } else if (existing.status === 'rejected') {
        existing.status = 'pending';
        existing.decidedAt = null;
        await existing.save();
        enrollments.push(existing);
      } else {
        enrollments.push(existing);
      }
    }

    res.status(201).json({
      success: true,
      enrollments,
      message: `${enrollments.length} course request(s) submitted`
    });
  } catch (error) {
    console.error('Enrollment Error:', error);
    res.status(500).json({ success: false, message: 'Server error during enrollment' });
  }
};

// @desc    Get pending enrollment requests for a teacher
// @route   GET /api/enrollment/requests
// @access  Private (Teacher)
exports.getEnrollmentRequests = async (req, res) => {
  try {
    const requests = await populateEnrollmentDetails(
      Enrollment.find({ teacher: req.user.id, status: 'pending' }).sort({ createdAt: -1 })
    );

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateRequestStatus = async (req, res, status) => {
  const enrollment = await Enrollment.findOne({
    _id: req.params.id,
    teacher: req.user.id
  });

  if (!enrollment) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }

  enrollment.status = status;
  enrollment.decidedAt = new Date();
  await enrollment.save();

  const populated = await populateEnrollmentDetails(Enrollment.findById(enrollment._id));
  res.json({ success: true, enrollment: populated });
};

// @desc    Approve an enrollment request
// @route   PATCH /api/enrollment/:id/approve
// @access  Private (Teacher)
exports.approveEnrollment = async (req, res) => {
  try {
    await updateRequestStatus(req, res, 'approved');
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Reject an enrollment request
// @route   PATCH /api/enrollment/:id/reject
// @access  Private (Teacher)
exports.rejectEnrollment = async (req, res) => {
  try {
    await updateRequestStatus(req, res, 'rejected');
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get students enrolled with a teacher
// @route   GET /api/enrollment/students
// @access  Private (Teacher)
exports.getEnrolledStudents = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ teacher: req.user.id, status: 'approved' })
      .populate('student', 'name email department')
      .populate('course', 'name code');

    // Group students by unique student ID
    const studentMap = {};
    enrollments.forEach(e => {
      const studentId = e.student._id.toString();
      if (!studentMap[studentId]) {
        studentMap[studentId] = {
          student: e.student,
          courses: []
        };
      }
      studentMap[studentId].courses.push(e.course);
    });

    const students = Object.values(studentMap);

    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get teachers with their courses (for student onboarding)
// @route   GET /api/enrollment/teachers
// @access  Private (Student)
exports.getTeachersWithCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('teacher', 'name email department');

    // Group courses by teacher
    const teacherMap = {};
    courses.forEach(course => {
      const teacherId = course.teacher._id.toString();
      if (!teacherMap[teacherId]) {
        teacherMap[teacherId] = {
          teacher: course.teacher,
          courses: []
        };
      }
      teacherMap[teacherId].courses.push({
        _id: course._id,
        name: course.name,
        code: course.code,
        description: course.description,
        section: course.section
      });
    });

    const teachers = Object.values(teacherMap);

    res.json({ success: true, teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get enrollment details for current student
// @route   GET /api/enrollment/my-enrollments
// @access  Private (Student)
exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate('teacher', 'name email')
      .populate('course', 'name code description section color');

    res.json({ success: true, enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};