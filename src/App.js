// App.js
import { v4 as uuidv4 } from 'uuid';
import React, { useState, useRef } from 'react';
import './App.css';
import FloatingActionButton from './FloatingActionButton';
import ChatDrawer from './ChatDrawer';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Dashboard from './Dashboard';


// Simple AdminPanel component (you can move this to separate file later)
const AdminPanel = () => {
  const [isReindexing, setIsReindexing] = useState(false);
  
  const handleReindex = async () => {
    setIsReindexing(true);
    try {
      const response = await fetch('https://primary-production-03c8.up.railway.app/webhook/reindex-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      alert('Reindexing completed!');
    } catch (error) {
      alert('Reindexing failed: ' + error.message);
    }
    setIsReindexing(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Panel</h1>
      <button 
        onClick={handleReindex} 
        disabled={isReindexing}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: isReindexing ? 'not-allowed' : 'pointer'
        }}
      >
        {isReindexing ? 'Reindexing...' : 'Re-index Knowledge Base'}
      </button>
      <br /><br />
      <a href="/" style={{ color: '#007bff' }}>← Back to Main Site</a>
    </div>
  );
};

function App() {
  // Generate conversationId for Redis storage
  const conversationId = useRef(uuidv4());
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const initialMessages = () => {
    try {
      const saved = sessionStorage.getItem('chatHistory');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error reading saved chat history:', err);
    }

    return [
      {
        id: Date.now(),
        text: "Hi! I'm here to help you with questions about our services. How can I assist you today?",
        sender: 'bot',
        timestamp: new Date().toISOString()
      }
    ];
  };

  const [messages, setMessages] = useState(initialMessages);
  const toggleChat = () => setIsChatOpen(prev => !prev);

  /**
   * Unified send message handler with Redis integration
   */
  const handleSendMessage = (userText, botText, historyOverride = null, botExtra = {}) => {
    if (Array.isArray(historyOverride)) {
      setMessages(historyOverride);
      return;
    }

    if (userText) {
      const userMessage = {
        id: Date.now() + Math.random(),
        text: userText,
        sender: 'user',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => {
        const updatedMessages = [...prev, userMessage];
        // STORE IN REDIS for Day 7 memory feature
        fetch('https://primary-production-03c8.up.railway.app/webhook/store-conversation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            conversationId: conversationId.current, 
            messages: updatedMessages 
          })
        }).catch(err => console.error('Redis store failed:', err));
        
        return updatedMessages;
      });
    }

    if (botText) {
      const botMessage = {
        id: Date.now() + Math.random() + 1,
        text: botText,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        type: botExtra?.type || null,
        suggestions: botExtra?.suggestions || null,
        buttons: botExtra?.buttons || null,
        calendly_link: botExtra?.calendly_link || null,
        escalation_reason: botExtra?.escalation_reason || null
      };

      setMessages(prev => {
        const updatedMessages = [...prev, botMessage];
        // STORE IN REDIS
        fetch('http://localhost:5678/webhook/store-conversation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            conversationId: conversationId.current, 
            messages: updatedMessages 
          })
        }).catch(err => console.error('Redis store failed:', err));
        
        return updatedMessages;
      });
    }
  };

  return (
  <Router>
    <Switch>
      <Route exact path="/admin">
        <AdminPanel />
      </Route>

      {/* ✅ Add this BEFORE the "/" route */}
      <Route exact path="/dashboard">
        <Dashboard />
      </Route>

      <Route path="/">
        <div className="App">
          <header className="App-header">
            <h1>Welcome to Our Website</h1>
            <p>This is your main website content. The chat button will appear in the bottom-right corner.</p>
          </header>

          <FloatingActionButton onClick={toggleChat} isOpen={isChatOpen} />

          <ChatDrawer
            conversationId={conversationId.current}
            isOpen={isChatOpen}
            onClose={toggleChat}
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </div>
      </Route>
    </Switch>
  </Router>
);

}

export default App;
