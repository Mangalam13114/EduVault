// ═══════════════════════════════════════════════════════
// Notification Routes - Updated with sent history
// ═══════════════════════════════════════════════════════
const express = require('express');
const router = express.Router();
const {
  sendNotification, getNotifications, getSentNotifications,
  markAsRead, markAllAsRead
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('teacher'), sendNotification);
router.get('/', protect, getNotifications);
router.get('/sent', protect, authorize('teacher'), getSentNotifications);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);

module.exports = router;