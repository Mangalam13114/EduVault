// ═══════════════════════════════════════════════════════
// Auth Routes - Updated with password reset & profile routes
// ═══════════════════════════════════════════════════════
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  signup, login, googleAuth, getMe, updateProfile, updateSettings,
  changePassword, forgotPassword, resetPassword, uploadProfilePhoto, uploadFile
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.post('/signup', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'teacher']).withMessage('Role must be student or teacher')
], signup);

router.post('/login', login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/settings', protect, updateSettings);
router.put('/change-password', protect, changePassword);
router.put('/profile-photo', protect, upload.single('photo'), uploadProfilePhoto);


router.post('/upload', protect, upload.single('file'), uploadFile);

module.exports = router;


