// ChatInput.js - FIXED VERSION
import React, { useState, useEffect, useRef } from 'react';

const noop = () => {};

const ChatInput = ({ onSendMessage, setIsLoading = noop, autoFocusTrigger, conversationId }) => {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocusTrigger && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocusTrigger]);

  const safeSetLoading = (val) => {
    if (typeof setIsLoading === 'function') setIsLoading(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    
    // Add user message to UI
    onSendMessage(userMessage);
    setInputText('');

    try {
      safeSetLoading(true);

      console.log("Sending to predict:", userMessage); // DEBUG

      // 1) Ask n8n PredictIntent
      const predictRes = await fetch('https://primary-production-03c8.up.railway.app/webhook/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: userMessage,
          body: { text: userMessage } // For compatibility
        })
      });

      if (!predictRes.ok) {
        throw new Error(`Predict API failed: ${predictRes.status}`);
      }

      const predictData = await predictRes.json();
      console.log("Raw predict response:", predictData);

      // ✅ Always unwrap first element if array
      const actualData = Array.isArray(predictData) ? predictData[0] : predictData;
      console.log("Processed predict data:", actualData);

      let botReply = '';

      // 2) Branch based on intent
      console.log("Checking intent:", actualData?.intent, "Type:", typeof actualData?.intent);
      console.log("Intent comparison:", actualData?.intent === 'request_estimate');
      
      if (actualData && actualData.intent === 'request_estimate') {
        console.log("✅ Taking estimate path");
        console.log("Entities:", actualData.entities);
        
        const estimatePayload = {
          conversationId,
          service_type: actualData.entities?.service_type || 'general',
          complexity: actualData.entities?.complexity || 'standard'
        };
        
        console.log("Sending to estimate:", estimatePayload);

        const estimateRes = await fetch('https://primary-production-03c8.up.railway.app/webhook/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(estimatePayload)
        });

        if (!estimateRes.ok) {
          throw new Error(`Estimate API failed: ${estimateRes.status}`);
        }

        const estimateData = await estimateRes.json();
        console.log("Estimate response:", estimateData);

        botReply = estimateData.message || `Estimated cost: $${estimateData.estimate || 'Contact us for pricing'}`;
        onSendMessage(null, botReply);

      } else if (actualData && actualData.intent === 'greeting') {
        console.log("✅ Taking greeting path");
        botReply = 'Hello! How can I help you today?';
        onSendMessage(null, botReply);

      } else if (actualData && (actualData.intent === 'navigate_contact' || 
                         actualData.intent === 'navigate_about' || 
                         actualData.intent === 'navigate_home')) {
  console.log("✅ Taking navigation path");
  
  const navigateRes = await fetch('https://primary-production-03c8.up.railway.app/webhook/navigate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      intent: actualData.intent,
      body: { intent: actualData.intent }
    })
  });

  if (!navigateRes.ok) {
    throw new Error(`Navigate API failed: ${navigateRes.status}`);
  }

  const navigateData = await navigateRes.json();
  console.log("Navigate response:", navigateData);

  // Show message then redirect
    onSendMessage(null, navigateData.message);
  setTimeout(() => {
    window.location.href = navigateData.redirectUrl;
  }, 1500);

  

      } else {
        console.log("❌ Taking general question path - Intent was:", actualData?.intent);

        const answerRes = await fetch('https://primary-production-03c8.up.railway.app/webhook/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            conversationId,
            question: userMessage 
          })
        });

        if (answerRes.status === 302) {
          const redirectUrl = answerRes.headers.get('Location');
          if (redirectUrl && !redirectUrl.includes(window.location.origin)) {
            window.location.href = redirectUrl;
            return;
          }
        }

        if (!answerRes.ok && answerRes.status !== 302) {
          console.log("Answer workflow not available, using fallback");
          onSendMessage(null, "I understand your question. Our answer system is currently being set up. For now, you can ask me about pricing estimates!");
          return;
        }

        const answerData = await answerRes.json();

if (answerData.type === 'redirect' && answerData.redirectUrl) {
  onSendMessage(null, answerData.message);
  setTimeout(() => {
    window.location.href = answerData.redirectUrl;
  }, 1000); // 1 second delay to show message
  return;
}

        if (answerData.type === 'clarification') {
          onSendMessage(null, answerData.message, null, { 
            type: 'clarification',
            suggestions: answerData.suggestions || [] 
          });
        } else if (answerData.type === 'escalation') {
          onSendMessage(null, answerData.message, null, { 
            type: 'escalation',
            buttons: answerData.buttons || [],
            calendly_link: answerData.calendly_link,
            escalation_reason: answerData.escalation_reason
          });
        } else {
          onSendMessage(null, answerData.message || answerData.answer || 'I can help with that. Are you interested in our web or mobile services?', null, answerData);
        }
      }
    } catch (err) {
      console.error('ChatInput error:', err);
      onSendMessage(null, 'Sorry — something went wrong. Please try again. Error: ' + err.message);
    } finally {
      safeSetLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // UI Styles
  const formStyle = { width: '100%' };
  const containerStyle = {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
    backgroundColor: '#f8f9fa',
    borderRadius: '20px',
    padding: '8px 12px',
    border: '1px solid #e9ecef'
  };
  const inputStyle = {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'none',
    fontSize: '14px',
    resize: 'none',
    minHeight: '20px',
    maxHeight: '80px',
    fontFamily: 'inherit',
    padding: '4px 0'
  };
  const buttonStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: inputText.trim() ? '#007bff' : '#ccc',
    color: 'white',
    cursor: inputText.trim() ? 'pointer' : 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px'
  };
  const footerStyle = { marginTop: '8px', textAlign: 'right' };
  const counterStyle = { fontSize: '11px', color: '#666' };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <div style={containerStyle}>
        <textarea
          ref={inputRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          style={inputStyle}
          rows="1"
          maxLength="1000"
        />
        <button
          type="submit"
          style={buttonStyle}
          disabled={!inputText.trim()}
          aria-label="Send message"
        >
          ➤
        </button>
      </div>
      <div style={footerStyle}>
        <span style={counterStyle}>{inputText.length}/1000</span>
      </div>
    </form>
  );
};

export default ChatInput;
