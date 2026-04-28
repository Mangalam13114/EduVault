import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiLoader, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import ChatWindow from './ChatWindow';
import './ChatList.css';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [showChatWindow, setShowChatWindow] = useState(false);

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterChats();
  }, [chats, searchTerm]);

  const fetchChats = async () => {
    try {
      const res = await api.get('/chat/teacher/all');
      setChats(res.data.data || []);
    } catch (err) {
      console.error('Error fetching chats:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterChats = () => {
    const filtered = chats.filter(chat => {
      const searchLower = searchTerm.toLowerCase();
      return (
        chat.student.name.toLowerCase().includes(searchLower) ||
        chat.course.name.toLowerCase().includes(searchLower) ||
        chat.course.code.toLowerCase().includes(searchLower)
      );
    });
    setFilteredChats(filtered);
  };

  const handleOpenChat = (chat) => {
    setSelectedChat(chat);
    setShowChatWindow(true);
  };

  const handleCloseChat = () => {
    setShowChatWindow(false);
    setTimeout(() => setSelectedChat(null), 300);
    fetchChats(); // Refresh to see new messages
  };

  if (loading) {
    return (
      <div className="chat-list-container">
        <div className="chat-list-loading">
          <FiLoader className="spin" size={32} />
          <p>Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-list-container">
      <div className="chat-list-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <FiMessageSquare size={20} />
          <h3>Student Messages</h3>
          {chats.some(c => c.unreadByTeacher) && (
            <span className="unread-badge">{chats.filter(c => c.unreadByTeacher).length}</span>
          )}
        </div>
        <div className="chat-search-box">
          <FiSearch size={16} />
          <input
            type="text"
            placeholder="Search by student or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="chat-search-input"
          />
        </div>
      </div>

      <div className="chat-list">
        {filteredChats.length === 0 ? (
          <div className="chat-list-empty">
            <FiMessageSquare size={40} />
            <p>{searchTerm ? 'No chats found' : 'No chats yet'}</p>
            <span>{searchTerm ? 'Try a different search' : 'Chats will appear here when students message you'}</span>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <motion.div
              key={chat._id}
              className={`chat-list-item ${chat.unreadByTeacher ? 'unread' : ''}`}
              onClick={() => handleOpenChat(chat)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="chat-item-avatar">
                {chat.student.avatar ? (
                  <img src={chat.student.avatar} alt={chat.student.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {chat.student.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="chat-item-content">
                <div className="chat-item-header">
                  <h4>{chat.student.name}</h4>
                  <span className="chat-item-time">
                    {new Date(chat.lastMessageTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="chat-item-meta">
                  <span className="chat-course">{chat.course.code}</span>
                  <span className="chat-section">Section {chat.course.section || 'A'}</span>
                </div>
                <p className="chat-item-preview">
                  {chat.lastMessageSender?._id === chat.teacher?._id ? 'You: ' : `${chat.student.name}: `}
                  {chat.lastMessage || 'No messages yet'}
                </p>
              </div>

              {chat.unreadByTeacher && <div className="unread-dot" />}
            </motion.div>
          ))
        )}
      </div>

      {showChatWindow && selectedChat && (
        <ChatWindow
          chatId={selectedChat._id}
          course={selectedChat.course}
          recipient={selectedChat.student}
          onClose={handleCloseChat}
        />
      )}
    </div>
  );
};

export default ChatList;
