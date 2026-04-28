// ═══════════════════════════════════════════════════════
// Submission Model - Student assignment submissions
// ═══════════════════════════════════════════════════════
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Text content of the submission
  content: {
    type: String,
    default: ''
  },
  // Uploaded file path
  filePath: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    default: ''
  },
  // Submission status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'need_improvement'],
    default: 'pending'
  },
  // Teacher's remarks (mandatory for every status change)
  remarks: {
    type: String,
    default: ''
  },
  // Marks given by teacher
  marks: {
    type: Number,
    default: null
  },
  // AI Detection results
  aiDetection: {
    score: { type: Number, default: null }, // 0-100 confidence
    isAIGenerated: { type: Boolean, default: null },
    details: { type: String, default: '' },
    suspiciousSentences: [{ type: String }]
  },
  // Plagiarism Detection results
  plagiarism: {
    percentage: { type: Number, default: null }, // 0-100
    sources: [{ 
      url: String, 
      matchPercentage: Number, 
      title: String 
    }],
    details: { type: String, default: '' }
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Submission', submissionSchema);