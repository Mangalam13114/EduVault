import React from 'react';
import { FiBell } from 'react-icons/fi';

const NotificationBell = ({ count, onClick }) => {
  return (
    <button className="navbar-icon-btn" onClick={onClick}>
      <FiBell />
      {count > 0 && (
        <span className="notification-badge">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;