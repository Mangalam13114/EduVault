// ═══════════════════════════════════════════════════════
// Chat Model - Stores conversation between student and teacher
// ═══════════════════════════════════════════════════════
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  lastMessageSender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  unreadByStudent: {
    type: Boolean,
    default: false
  },
  unreadByTeacher: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
chatSchema.index({ student: 1, teacher: 1, course: 1 }, { unique: true });
chatSchema.index({ teacher: 1, updatedAt: -1 });
chatSchema.index({ student: 1, updatedAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);
