// ═══════════════════════════════════════════════════════
// Chat Routes
// ═══════════════════════════════════════════════════════
const express = require('express');
const router = express.Router();
const {
  createOrGetChat,
  sendMessage,
  getMessages,
  getTeacherChats,
  getStudentChats,
  getChatDetails,
  deleteChat
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// All chat routes require authentication
router.use(protect);

// Chat management
router.post('/', createOrGetChat);                           // Create or get chat
router.get('/details/:chatId', getChatDetails);              // Get chat details
router.delete('/:chatId', deleteChat);                       // Delete chat

// Messages
router.post('/message/send', sendMessage);                   // Send message
router.get('/:chatId/messages', getMessages);                // Get messages for a chat

// Chat lists
router.get('/teacher/all', getTeacherChats);                 // Get all chats for teacher
router.get('/student/all', getStudentChats);                 // Get all chats for student

module.exports = router;
