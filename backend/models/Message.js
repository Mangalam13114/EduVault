// ═══════════════════════════════════════════════════════
// Message Model - Individual messages in a chat
// ═══════════════════════════════════════════════════════
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: null
  },
  imageUrl: {
    type: String,
    default: null
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'text-image'],
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

module.exports = mongoose.model('Message', messageSchema);
