// ═══════════════════════════════════════════════════════
// Submission Controller - Fixed: teachers can always view
// ═══════════════════════════════════════════════════════
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const { extractTextFromFile } = require('../utils/fileParser');
const { analyzeAIContent } = require('../utils/aiDetection');
const { checkPlagiarism } = require('../utils/plagiarismDetection');

// @desc    Submit assignment (Student)
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId, content } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (new Date() > new Date(assignment.endDate)) {
      return res.status(400).json({ success: false, message: 'Assignment deadline has passed' });
    }

    const submissionData = {
      assignment: assignmentId,
      student: req.user.id,
      content: content || '',
      status: 'pending'
    };

    if (req.file) {
      submissionData.filePath = req.file.path;
      submissionData.fileName = req.file.originalname;
    }

    let textToAnalyze = content || '';
    if (req.file && !textToAnalyze) {
      textToAnalyze = await extractTextFromFile(req.file.path);
      if (textToAnalyze === '__PDF_PARSE_ERROR__' || textToAnalyze === '__FILE_PARSE_ERROR__') {
        return res.status(400).json({
          success: false,
          message: 'Could not extract text from the uploaded file. Please upload a standard, non-encrypted PDF or a text file.'
        });
      }
    }

    if (textToAnalyze && textToAnalyze.trim().length > 50) {
      const [aiResult, plagiarismResult] = await Promise.all([
        analyzeAIContent(textToAnalyze),
        checkPlagiarism(textToAnalyze, req.user.id)
      ]);
      submissionData.aiDetection = aiResult;
      submissionData.plagiarism = plagiarismResult;
    }

    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: req.user.id
    });

    let submission;
    if (existingSubmission) {
      submission = await Submission.findByIdAndUpdate(
        existingSubmission._id,
        { ...submissionData, status: 'pending', remarks: '', marks: null, submittedAt: Date.now() },
        { new: true }
      ).populate('assignment').populate('student', 'name email');
    } else {
      submission = await Submission.create(submissionData);
      submission = await submission.populate('assignment');
      await submission.populate('student', 'name email');
    }

    res.status(201).json({ success: true, submission });
  } catch (error) {
    console.error('Submit Assignment Error:', error);
    res.status(500).json({ success: false, message: 'Server error during submission' });
  }
};

// @desc    Get submission for student by assignment
exports.getStudentSubmission = async (req, res) => {
  try {
    const submission = await Submission.findOne({
      assignment: req.params.assignmentId,
      student: req.user.id
    }).populate('assignment');

    res.json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all submissions for an assignment (Teacher)
// FIX: Returns ALL submissions regardless of status
exports.getAssignmentSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.assignmentId })
      .populate('student', 'name email profilePhoto')
      .populate('assignment')
      .sort({ submittedAt: -1 });

    // Always return all submissions - no status filter
    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all submissions by a student (Teacher view)
// FIX: Returns ALL submissions including reviewed ones
exports.getStudentAllSubmissions = async (req, res) => {
  try {
    // No status filter - return everything including approved/rejected
    const submissions = await Submission.find({ student: req.params.studentId })
      .populate({
        path: 'assignment',
        populate: { path: 'course', select: 'name code' }
      })
      .populate('student', 'name email profilePhoto')
      .sort({ submittedAt: -1 });

    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Review submission (Teacher)
exports.reviewSubmission = async (req, res) => {
  try {
    const { status, remarks, marks } = req.body;

    if (!remarks || remarks.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Remarks are mandatory for every action' });
    }

    const validStatuses = ['approved', 'rejected', 'pending', 'need_improvement'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Update submission but keep all data visible
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { status, remarks, marks: marks || null },
      { new: true }
    ).populate('student', 'name email profilePhoto').populate({
      path: 'assignment',
      populate: { path: 'course', select: 'name code' }
    });

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    res.json({ success: true, submission });
  } catch (error) {
    console.error('Review Submission Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all my submissions (Student)
exports.getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user.id })
      .populate({
        path: 'assignment',
        populate: { path: 'course', select: 'name code' }
      })
      .sort({ submittedAt: -1 });

    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get analytics for student submissions
// @route   GET /api/submissions/analytics
exports.getSubmissionAnalytics = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'student') {
      query.student = req.user.id;
    } else if (req.user.role === 'teacher') {
      // Get all assignments by this teacher
      const Assignment = require('../models/Assignment');
      const assignments = await Assignment.find({ teacher: req.user.id });
      const assignmentIds = assignments.map(a => a._id);
      query.assignment = { $in: assignmentIds };
    }

    const submissions = await Submission.find(query)
      .populate({ path: 'assignment', populate: { path: 'course', select: 'name code' } })
      .populate('student', 'name');

    const statusCounts = {
      pending: submissions.filter(s => s.status === 'pending').length,
      approved: submissions.filter(s => s.status === 'approved').length,
      rejected: submissions.filter(s => s.status === 'rejected').length,
      need_improvement: submissions.filter(s => s.status === 'need_improvement').length
    };

    const reviewedSubmissions = req.user.role === 'student'
      ? submissions.filter(s => ['approved', 'rejected', 'need_improvement'].includes(s.status))
      : submissions;

    const aiScores = reviewedSubmissions
      .filter(s => s.aiDetection?.score !== null)
      .map(s => ({ score: s.aiDetection.score, assignment: s.assignment?.title }));

    const plagScores = reviewedSubmissions
      .filter(s => s.plagiarism?.percentage !== null)
      .map(s => ({ percentage: s.plagiarism.percentage, assignment: s.assignment?.title }));

    // Monthly submission trend
    const monthlyTrend = {};
    submissions.forEach(s => {
      const month = new Date(s.submittedAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyTrend[month] = (monthlyTrend[month] || 0) + 1;
    });

    const marksData = submissions
      .filter(s => s.marks !== null && s.marks !== undefined)
      .map(s => ({
        marks: s.marks,
        assignment: s.assignment?.title,
        student: s.student?.name
      }));

    // Course-wise breakdown
    const courseBreakdown = {};
    submissions.forEach(s => {
      const courseName = s.assignment?.course?.name || 'Unknown';
      if (!courseBreakdown[courseName]) {
        courseBreakdown[courseName] = { total: 0, approved: 0, rejected: 0, pending: 0, need_improvement: 0 };
      }
      courseBreakdown[courseName].total++;
      courseBreakdown[courseName][s.status]++;
    });

    res.json({
      success: true,
      analytics: {
        statusCounts,
        aiScores,
        plagScores,
        monthlyTrend: Object.entries(monthlyTrend).map(([month, count]) => ({ month, count })),
        marksData,
        courseBreakdown: Object.entries(courseBreakdown).map(([name, data]) => ({ name, ...data })),
        totalSubmissions: submissions.length
      }
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};