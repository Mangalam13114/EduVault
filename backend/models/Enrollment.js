// ═══════════════════════════════════════════════════════
// Enrollment Model - Student ↔ Teacher ↔ Course mapping
// ═══════════════════════════════════════════════════════
const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  decidedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Ensure a student can't enroll in the same course twice
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);