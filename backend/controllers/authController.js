// ═══════════════════════════════════════════════════════
// Authentication Controller - Updated with password reset & profile
// ═══════════════════════════════════════════════════════
const User = require('../models/User');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');

const googleClient = process.env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  : null;

const buildUserResponse = (user) => ({
  id: user._id, name: user.name, email: user.email, role: user.role,
  department: user.department, isOnboarded: user.isOnboarded,
  phone: user.phone, bio: user.bio, institution: user.institution,
  profilePhoto: user.profilePhoto, rollNumber: user.rollNumber,
  semester: user.semester, designation: user.designation,
  specialization: user.specialization, settings: user.settings,
  authProvider: user.authProvider
});

const respondWithToken = (res, user, status = 200) => {
  const token = user.getSignedJwtToken();
  return res.status(status).json({
    success: true,
    token,
    user: buildUserResponse(user)
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role, department } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name, email, password, role,
      department: department || ''
    });

    return respondWithToken(res, user, 201);
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ success: false, message: 'Server error during signup' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    return respondWithToken(res, user);
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Authenticate or register with Google
// @route   POST /api/auth/google
exports.googleAuth = async (req, res) => {
  try {
    const { credential, mode = 'login', role } = req.body;

    if (!googleClient || !process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        success: false,
        message: 'Google OAuth is not configured on the server'
      });
    }

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const email = payload?.email;
    const name = payload?.name || payload?.given_name || 'Google User';
    const googleId = payload?.sub;

    if (!email || !googleId) {
      return res.status(400).json({ success: false, message: 'Google account data is incomplete' });
    }

    let user = await User.findOne({ email }).select('+password');

    if (!user) {
      if (mode === 'login') {
        return res.status(404).json({
          success: false,
          message: 'No account found for this Google email. Use Google sign up to create one.'
        });
      }

      if (!role || !['student', 'teacher'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Please choose a role before signing up with Google'
        });
      }

      user = await User.create({
        name,
        email,
        role,
        department: '',
        password: crypto.randomBytes(32).toString('hex'),
        googleId,
        authProvider: 'google',
        isOnboarded: role === 'teacher'
      });
    } else {
      const update = { authProvider: 'google' };
      if (!user.googleId) update.googleId = googleId;
      if (!user.name) update.name = name;
      if (!user.password) update.password = crypto.randomBytes(32).toString('hex');

      user = await User.findByIdAndUpdate(user._id, update, { new: true });
    }

    return respondWithToken(res, user, user.isNew ? 201 : 200);
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ success: false, message: 'Google sign-in failed' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user: {
        ...buildUserResponse(user),
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'name', 'department', 'phone', 'bio', 'institution',
      'rollNumber', 'semester', 'designation', 'specialization'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    // Handle profile photo upload
    if (req.file) {
      updateData.profilePhoto = req.file.path;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true, runValidators: true
    });

    res.json({
      success: true,
      user: buildUserResponse(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user settings
// @route   PUT /api/auth/settings
exports.updateSettings = async (req, res) => {
  try {
    const { emailNotifications, darkMode, language, timezone } = req.body;
    const settings = {};
    if (emailNotifications !== undefined) settings['settings.emailNotifications'] = emailNotifications;
    if (darkMode !== undefined) settings['settings.darkMode'] = darkMode;
    if (language !== undefined) settings['settings.language'] = language;
    if (timezone !== undefined) settings['settings.timezone'] = timezone;

    const user = await User.findByIdAndUpdate(req.user.id, { $set: settings }, { new: true });

    res.json({ success: true, settings: user.settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Forgot password - send reset token
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with that email' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // In production, send this via email
    // TODO: Integrate with actual email service (Nodemailer/SendGrid)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    console.log('Password Reset URL:', resetUrl);

    // For development, return the token directly
    // In production, remove the token from response and only send via email
    res.json({
      success: true,
      message: 'Password reset link has been generated. Check console for the link (in production this would be emailed).',
      // Remove resetToken from response in production
      resetToken,
      resetUrl
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Reset password with token
// @route   PUT /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = user.getSignedJwtToken();

    res.json({
      success: true,
      message: 'Password reset successful',
      token,
      user: {
        id: user._id, name: user.name, email: user.email, role: user.role,
        isOnboarded: user.isOnboarded
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Upload profile photo
// @route   PUT /api/auth/profile-photo
exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePhoto: req.file.path },
      { new: true }
    );

    res.json({ success: true, profilePhoto: user.profilePhoto });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }
    const fileUrl = '/uploads/' + req.file.filename;
    res.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};
