// ChatDrawer.js
import React, { useEffect, useState, useCallback } from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

const ChatDrawer = ({ conversationId, isOpen, onClose, messages, onSendMessage, isLoading, setIsLoading }) => {
  const [lastUpdated, setLastUpdated] = useState(null);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);

  // Create stable callback to avoid dependency issues
  const loadChatHistory = useCallback(() => {
    const savedMessages = sessionStorage.getItem('chatHistory');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onSendMessage(null, null, parsed.slice(-20));
        }
      } catch (err) {
        console.error('Error parsing saved chat history:', err);
      }
    }
  }, [onSendMessage]);

  // Load chat history when drawer opens (only once per session)
  useEffect(() => {
    if (isOpen && !hasLoadedHistory) {
      loadChatHistory();
      setHasLoadedHistory(true);
    }
  }, [isOpen, hasLoadedHistory, loadChatHistory]);

  // Save chat history whenever messages change
  useEffect(() => {
    if (!isOpen || messages.length === 0) return;

    try {
      const trimmed = messages.slice(-20);
      sessionStorage.setItem('chatHistory', JSON.stringify(trimmed));
    } catch (err) {
      console.error('Error saving chat history:', err);
    }
  }, [messages, isOpen]);

  // Fetch last updated timestamp when drawer opens
useEffect(() => {
  if (isOpen) {
    setLastUpdated(new Date());
  }
}, [isOpen]);

  const backdropStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
    display: isOpen ? 'block' : 'none'
  };

  const drawerStyle = {
    position: 'fixed',
    top: 0,
    right: 0,
    height: '100vh',
    width: '350px',
    backgroundColor: 'white',
    boxShadow: '-4px 0 12px rgba(0,0,0,0.2)',
    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
    transition: 'transform 0.3s ease',
    zIndex: 999,
    display: 'flex',
    flexDirection: 'column'
  };

  const headerStyle = {
    padding: '16px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const titleStyle = {
    margin: 0,
    fontSize: '18px'
  };

  const subtitleStyle = {
    margin: 0,
    fontSize: '11px',
    opacity: 0.8
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '4px 8px'
  };

  const contentStyle = {
    flex: 1,
    overflowY: 'auto',
    backgroundColor: '#f8f9fa',
    padding: '12px'
  };

  const footerStyle = {
    backgroundColor: 'white',
    borderTop: '1px solid #e9ecef',
    padding: '12px 16px'
  };

  const typingWrapperStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    marginTop: '8px',
    marginBottom: '8px'
  };

  const typingBubbleStyle = {
    display: 'inline-block',
    padding: '8px 12px',
    borderRadius: '16px',
    backgroundColor: '#e9ecef',
    fontSize: '13px',
    color: '#333',
    alignSelf: 'flex-start'
  };

  // CLEAR CHAT HANDLER
  const handleClear = async () => {
    onSendMessage(null, null, []);
    sessionStorage.removeItem('chatHistory');
    setHasLoadedHistory(false); // Allow history to be loaded again

    try {
      await fetch('https://primary-production-03c8.up.railway.app/webhook/reset', { method: 'POST' });
    } catch (err) {
      console.error('Reset webhook failed', err);
    }
  };

  // SUMMARIZE HANDLER - This was missing!
  const handleSummarize = async () => {
    try {
      const res = await fetch('https://primary-production-03c8.up.railway.app/webhook/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId })
      });
      const data = await res.json();
      const summary = data[0]?.content?.parts?.[0]?.text || 'Summary completed';
      onSendMessage(null, summary, null, { type: 'summary' });
    } catch (err) {
      console.error('Summarize failed:', err);
      onSendMessage(null, 'Sorry, summarization failed. Please try again.');
    }
  };

  return (
    <>
      <div style={backdropStyle} onClick={onClose} />
      <div style={drawerStyle} aria-hidden={!isOpen}>
        <div style={headerStyle}>
          <div>
            <h3 style={titleStyle}>Chat Assistant</h3>
            {lastUpdated && (
              <p style={subtitleStyle}>
                KB updated: {new Date(lastUpdated).toLocaleDateString()}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={closeButtonStyle} onClick={onClose} aria-label="Close chat">
              ✕
            </button>

            <button
              style={{ ...closeButtonStyle, fontSize: '14px', border: '1px solid white', borderRadius: '8px' }}
              onClick={handleClear}
            >
              Clear
            </button>

            <button
  style={{ ...closeButtonStyle, fontSize: '14px', border: '1px solid white', borderRadius: '8px' }}
  onClick={async () => {
    try {
      const res = await fetch('https://primary-production-03c8.up.railway.app/webhook/case-studies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      onSendMessage(null, data.message || 'Case studies loaded', null, { type: 'case-studies' });
    } catch (err) {
      console.error('Case studies failed:', err);
      onSendMessage(null, 'Sorry, could not load case studies. Please try again.');
    }
  }}
>
  Case Studies
</button>

            {/* ADD SUMMARIZE BUTTON - This was missing! */}
            <button
              style={{ ...closeButtonStyle, fontSize: '14px', border: '1px solid white', borderRadius: '8px' }}
              onClick={handleSummarize}
            >
              Summarize
            </button>
          </div>
        </div>

        <div style={contentStyle}>
          <MessageList messages={messages} />

          {isLoading && (
  <div style={typingWrapperStyle}>
    <div style={typingBubbleStyle}>Thinking...</div>
  </div>
)}

        </div>

        <div style={footerStyle}>
          <ChatInput 
            onSendMessage={onSendMessage} 
            setIsLoading={setIsLoading} 
            autoFocusTrigger={isOpen}
            conversationId={conversationId}  // PASS conversationId
          />
        </div>
      </div>
    </>
  );
};

export default ChatDrawer;
