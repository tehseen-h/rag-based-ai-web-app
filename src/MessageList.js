import React, { useEffect, useRef } from 'react';
import Message from './Message';

const MessageList = ({ messages, onSendMessage }) => {
  // Reference to the messages container for auto-scrolling
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new message is added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Inline styles for message list
  const containerStyle = {
    height: '100%',
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  };

  const emptyStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#666',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      {messages.length === 0 ? (
        // Empty state when no messages
        <div style={emptyStyle}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>💬</div>
          <p>Start a conversation!</p>
        </div>
      ) : (
        // Render all messages and pass onSendMessage to each
        messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            onSendMessage={onSendMessage}
          />
        ))
      )}
      {/* Invisible div to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
