// ═══════════════════════════════════════════════════════
// Notification Model
// ═══════════════════════════════════════════════════════
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  title: {
    type: String,
    required: [true, 'Notification title is required']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null
  },
  // Track which recipients have read it
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  type: {
    type: String,
    enum: ['general', 'assignment', 'deadline', 'grade', 'announcement'],
    default: 'general'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);