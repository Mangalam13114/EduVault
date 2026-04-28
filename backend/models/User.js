// ═══════════════════════════════════════════════════════
// User Model - Updated with profile fields & password reset
// ═══════════════════════════════════════════════════════
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  googleId: {
    type: String,
    default: ''
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'teacher'],
    required: [true, 'Role is required']
  },
  avatar: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  institution: {
    type: String,
    default: ''
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  // Student specific
  rollNumber: {
    type: String,
    default: ''
  },
  semester: {
    type: String,
    default: ''
  },
  // Teacher specific
  designation: {
    type: String,
    default: ''
  },
  specialization: {
    type: String,
    default: ''
  },
  // Settings
  settings: {
    emailNotifications: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: true },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' }
  },
  isOnboarded: {
    type: Boolean,
    default: false
  },
  // Password reset fields
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);