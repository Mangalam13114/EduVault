// ═══════════════════════════════════════════════════════
// Notification Controller - Updated with sent history
// ═══════════════════════════════════════════════════════
const Notification = require('../models/Notification');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const nodemailer = require('nodemailer');

let mailTransporter;

const hasValidEmailConfig = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !FROM_EMAIL) {
    return false;
  }

  // Skip placeholder values so local development works without SMTP errors.
  if (
    SMTP_USER.includes('your_') ||
    SMTP_PASS.includes('your_') ||
    SMTP_USER.includes('example.com')
  ) {
    return false;
  }

  return true;
};

const getMailer = () => {
  if (mailTransporter) return mailTransporter;

  const port = Number(process.env.SMTP_PORT) || 587;

  mailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  return mailTransporter;
};

const sendNotificationEmails = async ({ recipients, senderName, senderEmail, title, message, courseName, courseCode }) => {
  if (!hasValidEmailConfig()) {
    return { enabled: false, attempted: 0, sent: 0, failed: 0 };
  }

  const recipientUsers = await User.find({
    _id: { $in: recipients },
    email: { $exists: true, $ne: '' },
    'settings.emailNotifications': { $ne: false }
  }).select('name email');

  if (recipientUsers.length === 0) {
    return { enabled: true, attempted: 0, sent: 0, failed: 0 };
  }

  const transporter = getMailer();
  const subject = `[EduVault] ${title}`;
  const courseLabel = courseName ? `${courseName}${courseCode ? ` (${courseCode})` : ''}` : 'General';
  const useTeacherAsFrom = process.env.EMAIL_USE_TEACHER_FROM === 'true';

  const defaultFrom = process.env.FROM_EMAIL;
  const teacherFrom = senderEmail
    ? `${senderName || 'Teacher'} <${senderEmail}>`
    : defaultFrom;
  const mailFrom = useTeacherAsFrom ? teacherFrom : defaultFrom;

  const emailJobs = recipientUsers.map((student) => {
    const text = [
      `Hi ${student.name || 'Student'},`,
      '',
      `${senderName || 'Your teacher'} sent a new notification.`,
      `Title: ${title}`,
      `Course: ${courseLabel}`,
      '',
      `${message}`,
      '',
      'You can also view this notification in your student dashboard.',
      '',
      'EduVault Team'
    ].join('\n');

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <p>Hi ${student.name || 'Student'},</p>
        <p><strong>${senderName || 'Your teacher'}</strong> sent a new notification.</p>
        <p><strong>Title:</strong> ${title}<br/><strong>Course:</strong> ${courseLabel}</p>
        <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:12px; margin:12px 0;">
          ${String(message).replace(/\n/g, '<br/>')}
        </div>
        <p>You can also view this notification in your student dashboard.</p>
        <p style="margin-top:16px;">EduVault Team</p>
      </div>
    `;

    return transporter.sendMail({
      from: mailFrom,
      replyTo: senderEmail || undefined,
      to: student.email,
      subject,
      text,
      html
    });
  });

  const results = await Promise.allSettled(emailJobs);
  const sent = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.length - sent;

  return {
    enabled: true,
    attempted: results.length,
    sent,
    failed
  };
};

// @desc    Send notification (Teacher)
// @route   POST /api/notifications
exports.sendNotification = async (req, res) => {
  try {
    const { title, message, courseId, type, recipientIds } = req.body;

    let recipients = recipientIds || [];

    if (courseId && recipients.length === 0) {
      const enrollments = await Enrollment.find({
        course: courseId,
        teacher: req.user.id
      });
      recipients = enrollments.map(e => e.student);
    }

    if (recipients.length === 0) {
      return res.status(400).json({ success: false, message: 'No recipients specified' });
    }

    const notification = await Notification.create({
      sender: req.user.id,
      recipients,
      title,
      message,
      course: courseId || null,
      type: type || 'general'
    });

    await notification.populate('sender', 'name email');
    await notification.populate('course', 'name code');
    await notification.populate('recipients', 'name email');

    let emailSummary = { enabled: false, attempted: 0, sent: 0, failed: 0 };
    try {
      emailSummary = await sendNotificationEmails({
        recipients,
        senderName: notification.sender?.name,
        senderEmail: notification.sender?.email,
        title,
        message,
        courseName: notification.course?.name,
        courseCode: notification.course?.code
      });
    } catch (mailError) {
      // Keep in-app notification flow successful even if email fails.
      console.error('Notification Email Error:', mailError.message || mailError);
    }

    res.status(201).json({ success: true, notification, emailSummary });
  } catch (error) {
    console.error('Send Notification Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get notifications for current user (received)
// @route   GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipients: req.user.id
    })
      .populate('sender', 'name')
      .populate('course', 'name code')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = notifications.filter(
      n => !n.readBy.includes(req.user.id)
    ).length;

    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get sent notifications (Teacher) - notification history
// @route   GET /api/notifications/sent
exports.getSentNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ sender: req.user.id })
      .populate('recipients', 'name email')
      .populate('course', 'name code')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { readBy: req.user.id } },
      { new: true }
    );
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipients: req.user.id },
      { $addToSet: { readBy: req.user.id } }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};