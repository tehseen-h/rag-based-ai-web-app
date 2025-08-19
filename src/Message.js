import React from 'react';

const Message = ({ message, onSendMessage }) => {
  const { text, sender, timestamp, type } = message || {};
  const isClarification = type === 'clarification';
  const isSummary = type === 'summary';
  const isEscalation = type === 'escalation';
  if (isEscalation) {
  console.log('Escalation message:', message);
}



  // Format timestamp for display
  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Inline styles
  const messageContainerStyle = {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
    maxWidth: '85%',
    alignSelf: (isClarification || isEscalation) ? 'center' : (sender === 'user' ? 'flex-end' : 'flex-start'),
    flexDirection: sender === 'user' && !isClarification ? 'row-reverse' : 'row'
  };

  const avatarStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#007bff',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    flexShrink: 0
  };

  const bubbleStyle = {
    borderRadius: '16px',
    padding: '8px 12px',
    wordWrap: 'break-word',
    maxWidth: '100%',
    backgroundColor: isClarification ? '#fff3cd' : isEscalation ? '#ffebee' : (sender === 'user' ? '#007bff' : '#e9ecef'),
    color: isClarification ? '#856404' : isEscalation ? '#c62828' : (sender === 'user' ? 'white' : 'black'),
    fontStyle: isClarification ? 'italic' : 'normal',
    textAlign: isClarification ? 'center' : 'left'
  };

  const timeStyle = {
    fontSize: '11px',
    opacity: '0.7',
    textAlign: 'right',
    marginTop: '4px'
  };

  const feedbackStyle = {
    display: 'flex',
    gap: '4px',
    marginTop: '6px'
  };

  const feedbackButtonStyle = {
    background: 'none',
    border: '1px solid #ddd',
    borderRadius: '12px',
    padding: '2px 6px',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#666'
  };

  const quickReplyContainer = {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '8px'
  };

  const quickReplyButton = {
    padding: '6px 10px',
    borderRadius: '12px',
    border: '1px solid #ccc',
    background: 'white',
    cursor: 'pointer'
  };

  // When a clarification quick-reply is clicked
  const handleQuickReply = async (replyText) => {
    // If parent passed onSendMessage, use it (adds message in App state)
    if (onSendMessage && typeof onSendMessage === 'function') {
      // call onSendMessage(userText, botPayload)
      onSendMessage(replyText, null);
      return;
    }

    // Fallback: POST to your webhook endpoint (requires CORS/proxy)
    try {
      await fetch('/webhook/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_question: replyText })
      });
    } catch (err) {
      console.error('Failed to send quick reply to backend', err);
    }
  };

  // Handle escalation button clicks
const handleEscalationAction = (button) => {
  if (button.action === 'book_meeting' && button.url) {
    // Open Calendly in new tab
    window.open(button.url, '_blank');
    
    // Send confirmation message
    if (onSendMessage && typeof onSendMessage === 'function') {
      onSendMessage(null, "Great! I've opened the booking page for you. Our team will be happy to help!");
    }
  } else if (button.action === 'continue_chat') {
    // Continue with normal chat
    if (onSendMessage && typeof onSendMessage === 'function') {
      onSendMessage(null, "No problem! I'm here to help. What would you like to know?");
    }
  }
};

  return (
    <div style={messageContainerStyle}>
      {/* Avatar (only for non-clarification bot messages) */}
      {!isClarification && sender === 'bot' && (
        <div style={avatarStyle}>🤖</div>
      )}

      {/* Message bubble */}
      <div style={bubbleStyle}>
  {isSummary ? (
    <div style={{
      backgroundColor: '#d6f5d6',
      padding: '6px',
      borderRadius: '5px',
      fontStyle: 'italic'
    }}>
      {text}
    </div>
  ) : (
    <div>{text}</div>
  )}
        <div style={timeStyle}>{formatTime(timestamp)}</div>

        {/* Quick replies for clarification messages */}
{isClarification && message.suggestions && Array.isArray(message.suggestions) && (
  <div style={quickReplyContainer}>
    {message.suggestions.map((suggestion, idx) => (
      <button
        key={idx}
        style={quickReplyButton}
        onClick={() => handleQuickReply(suggestion)}
      >
        {suggestion}
      </button>
    ))}
  </div>
)}
{/* Escalation buttons */}
{isEscalation && message.buttons && Array.isArray(message.buttons) && (
  <div style={quickReplyContainer}>
    {message.buttons.map((button, idx) => (
      <button
        key={idx}
        style={{
          ...quickReplyButton,
          backgroundColor: button.action === 'book_meeting' ? '#4CAF50' : '#f0f0f0',
          color: button.action === 'book_meeting' ? 'white' : 'black',
          fontWeight: 'bold',
          padding: '10px 16px'
        }}
        onClick={() => handleEscalationAction(button)}
      >
        {button.text}
      </button>
    ))}
  </div>
)}


        {/* Feedback buttons for normal bot messages */}
        {!isClarification && sender === 'bot' && (
          <div style={feedbackStyle}>
            <button
              style={{ ...feedbackButtonStyle, color: 'green' }}
              onClick={async () => {
                try {
                  await fetch('http://localhost:5678/webhook/feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: text, sentiment: 'positive' })
                  });
                } catch (err) {
                  console.error('Feedback error', err);
                }
              }}
            >
              👍
            </button>
            <button
              style={{ ...feedbackButtonStyle, color: 'red' }}
              onClick={async () => {
                try {
                  await fetch('http://localhost:5678/webhook/feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: text, sentiment: 'negative' })
                  });
                } catch (err) {
                  console.error('Feedback error', err);
                }
              }}
            >
              👎
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
