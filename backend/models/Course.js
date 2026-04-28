// ═══════════════════════════════════════════════════════
// Course Model
// ═══════════════════════════════════════════════════════
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    uppercase: true
  },
  description: {
    type: String,
    default: ''
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  section: {
    type: String,
    default: 'A'
  },
  color: {
    type: String,
    default: '#6C63FF' // Default accent color for course card
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);