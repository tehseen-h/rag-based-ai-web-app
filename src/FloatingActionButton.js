import React from 'react';

const FloatingActionButton = ({ onClick, isOpen }) => {
  
  // ⛔️ Don't render button if drawer is open
  if (isOpen) {
    return null;
  }
  // Inline styles for the floating button
  const buttonStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: isOpen ? '#dc3545' : '#007bff',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    zIndex: 1000,
    transition: 'all 0.3s ease'
  };

  return (
    <button 
      style={buttonStyle}
      onClick={onClick}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
    >
      {isOpen ? '✕' : '💬'}
    </button>
  );
};

export default FloatingActionButton;