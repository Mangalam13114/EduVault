// ═══════════════════════════════════════════════════════
// Assignment Model
// ═══════════════════════════════════════════════════════
const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  totalMarks: {
    type: Number,
    default: 100
  },
  section: {
    type: String,
    default: 'A'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);