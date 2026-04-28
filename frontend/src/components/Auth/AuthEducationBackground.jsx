import React from 'react';
import { motion } from 'framer-motion';
import {
  FiBookOpen, FiEdit3, FiAward, FiPenTool, FiUsers, FiBookmark,
  FiClipboard, FiFileText, FiCalendar, FiGlobe, FiTarget,
  FiCompass, FiFeather, FiLayers
} from 'react-icons/fi';

const floatingItems = [
  { id: 1, icon: FiBookOpen, className: 'edu-item-1', delay: 0, size: 22, dx: 10, dy: 14, rot: 5, duration: 7.6 },
  { id: 2, icon: FiEdit3, className: 'edu-item-2', delay: 0.15, size: 21, dx: -8, dy: 16, rot: -4, duration: 8.2 },
  { id: 3, icon: FiAward, className: 'edu-item-3', delay: 0.3, size: 22, dx: 12, dy: 12, rot: 4, duration: 7.8 },
  { id: 4, icon: FiPenTool, className: 'edu-item-4', delay: 0.45, size: 22, dx: -10, dy: 14, rot: -5, duration: 8.6 },
  { id: 5, icon: FiUsers, className: 'edu-item-5', delay: 0.6, size: 21, dx: 8, dy: 15, rot: 4, duration: 8.4 },
  { id: 6, icon: FiBookmark, className: 'edu-item-6', delay: 0.75, size: 22, dx: -9, dy: 13, rot: -4, duration: 7.9 },
  { id: 7, icon: FiClipboard, className: 'edu-item-7', delay: 0.9, size: 20, dx: 10, dy: 12, rot: 4, duration: 8.8 },
  { id: 8, icon: FiFileText, className: 'edu-item-8', delay: 1.05, size: 20, dx: -11, dy: 14, rot: -5, duration: 7.7 },
  { id: 9, icon: FiCalendar, className: 'edu-item-9', delay: 1.2, size: 20, dx: 9, dy: 16, rot: 5, duration: 8.1 },
  { id: 10, icon: FiGlobe, className: 'edu-item-10', delay: 1.35, size: 21, dx: -8, dy: 12, rot: -4, duration: 8.9 },
  { id: 11, icon: FiTarget, className: 'edu-item-11', delay: 1.5, size: 21, dx: 10, dy: 13, rot: 5, duration: 8.3 },
  { id: 12, icon: FiCompass, className: 'edu-item-12', delay: 1.65, size: 21, dx: -10, dy: 12, rot: -5, duration: 7.5 },
  { id: 13, icon: FiFeather, className: 'edu-item-13', delay: 1.8, size: 20, dx: 12, dy: 15, rot: 6, duration: 8.7 },
  { id: 14, icon: FiLayers, className: 'edu-item-14', delay: 1.95, size: 20, dx: -9, dy: 13, rot: -4, duration: 8.5 }
];

const AuthEducationBackground = () => {
  return (
    <div className="auth-edu-layer" aria-hidden="true">
      <div className="auth-edu-grid" />
      <div className="auth-edu-orbit orbit-a">
        <div className="auth-edu-comet" />
      </div>
      <div className="auth-edu-orbit orbit-b">
        <div className="auth-edu-comet" />
      </div>

      {floatingItems.map(({ id, icon: Icon, className, delay, size, dx, dy, rot, duration }) => (
        <motion.div
          key={id}
          className={`auth-edu-item ${className}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: [0.52, 0.95, 0.62, 0.88],
            x: [0, dx, -dx * 0.75, 0],
            y: [0, -dy, dy * 0.6, 0],
            rotate: [0, rot, -rot * 0.6, 0]
          }}
          transition={{
            opacity: { duration: 1, delay },
            x: { duration, repeat: Infinity, ease: 'easeInOut', delay },
            y: { duration: duration + 0.6, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.15 },
            rotate: { duration: duration + 0.8, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.08 }
          }}
        >
          <Icon size={size} />
        </motion.div>
      ))}
    </div>
  );
};

export default AuthEducationBackground;