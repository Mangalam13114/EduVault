import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ text = 'Loading...' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        gap: '20px'
      }}
    >
      <div className="loader-orbit" style={{ width: 44, height: 44 }}>
        <div className="loader-orbit-dot" />
        <div className="loader-orbit-dot" />
        <div className="loader-orbit-dot" />
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{text}</p>
    </motion.div>
  );
};

export default Loader;