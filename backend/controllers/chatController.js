// ═══════════════════════════════════════════════════════
// Chat Controller
// ═══════════════════════════════════════════════════════
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Course = require('../models/Course');
const User = require('../models/User');

// ─── CREATE OR GET CHAT ───
exports.createOrGetChat = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user.id;

    // Validate inputs
    if (!courseId) {
      return res.status(400).json({ message: 'Course is required' });
    }

    // Check if course exists and teacher is the creator
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const courseTeacherId = course.teacher?._id ? course.teacher._id.toString() : course.teacher.toString();

    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can start course chats' });
    }

    // Find existing chat or create new one
    let chat = await Chat.findOne({
      student: studentId,
      teacher: courseTeacherId,
      course: courseId
    });

    if (!chat) {
      chat = await Chat.create({
        student: studentId,
        teacher: courseTeacherId,
        course: courseId
      });
    }

    // Populate references
    chat = await chat.populate([
      { path: 'student', select: 'name email avatar' },
      { path: 'teacher', select: 'name email avatar' },
      { path: 'course', select: 'name code section' }
    ]);

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error in createOrGetChat:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── SEND MESSAGE ───
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, content, imageUrl } = req.body;
    const senderId = req.user.id;

    // Validate inputs
    if (!chatId || (!content && !imageUrl)) {
      return res.status(400).json({ message: 'Message content or image is required' });
    }

    // Check if chat exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Verify sender is part of the chat
    if (senderId !== chat.student.toString() && senderId !== chat.teacher.toString()) {
      return res.status(403).json({ message: 'Unauthorized: Not part of this chat' });
    }

    // Determine message type
    let messageType = 'text';
    if (imageUrl && content) messageType = 'text-image';
    else if (imageUrl) messageType = 'image';

    // Create message
    let message = await Message.create({
      chat: chatId,
      sender: senderId,
      content,
      imageUrl,
      messageType
    });

    message = await message.populate('sender', 'name avatar');

    // Update chat with last message info
    const otherUserId = senderId === chat.student.toString() ? chat.teacher : chat.student;

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: content || '📷 Image',
      lastMessageTime: new Date(),
      lastMessageSender: senderId,
      unreadByTeacher: senderId === chat.student.toString(),
      unreadByStudent: senderId === chat.teacher.toString()
    });

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── GET MESSAGES FOR A CHAT ───
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Verify user is part of the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (userId !== chat.student.toString() && userId !== chat.teacher.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Get messages
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'name avatar email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Mark messages as read
    await Message.updateMany(
      { chat: chatId, sender: { $ne: userId }, isRead: false },
      { isRead: true }
    );

    // Update chat unread status
    if (userId === chat.student.toString()) {
      await Chat.findByIdAndUpdate(chatId, { unreadByStudent: false });
    } else {
      await Chat.findByIdAndUpdate(chatId, { unreadByTeacher: false });
    }

    const total = await Message.countDocuments({ chat: chatId });

    res.status(200).json({
      success: true,
      data: messages.reverse(),
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── GET CHATS FOR TEACHER ───
exports.getTeacherChats = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const chats = await Chat.find({ teacher: teacherId })
      .populate('student', 'name email avatar')
      .populate('teacher', 'name email avatar')
      .populate('course', 'name code section')
      .populate('lastMessageSender', 'name')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Chat.countDocuments({ teacher: teacherId });

    res.status(200).json({
      success: true,
      data: chats,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in getTeacherChats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── GET CHATS FOR STUDENT ───
exports.getStudentChats = async (req, res) => {
  try {
    const studentId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const chats = await Chat.find({ student: studentId })
      .populate('student', 'name email avatar')
      .populate('teacher', 'name email avatar')
      .populate('course', 'name code section')
      .populate('lastMessageSender', 'name')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Chat.countDocuments({ student: studentId });

    res.status(200).json({
      success: true,
      data: chats,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in getStudentChats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── GET SINGLE CHAT DETAILS ───
exports.getChatDetails = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(chatId)
      .populate('student', 'name email avatar')
      .populate('teacher', 'name email avatar')
      .populate('course', 'name code section');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Verify user is part of the chat
    if (userId !== chat.student._id.toString() && userId !== chat.teacher._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error in getChatDetails:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── DELETE CHAT ───
exports.deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Verify user is part of the chat
    if (userId !== chat.student.toString() && userId !== chat.teacher.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Delete all messages in the chat
    await Message.deleteMany({ chat: chatId });

    // Delete the chat
    await Chat.findByIdAndDelete(chatId);

    res.status(200).json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteChat:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
