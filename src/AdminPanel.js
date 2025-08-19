import React, { useState } from 'react';

const AdminPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleReindex = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('http://localhost:5678/webhook/reindex-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      setMessage(`✅ ${data.message}`);
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadTest = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('http://localhost:5678/webhook/load-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      setMessage(`🚀 ${data.message}`);
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Admin Panel</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleReindex}
          disabled={isLoading}
          style={{
            padding: '12px 24px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {isLoading ? 'Processing...' : 'Re-index Knowledge Base'}
        </button>

        <button 
          onClick={handleLoadTest}
          disabled={isLoading}
          style={{
            padding: '12px 24px',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Running...' : 'Start Load Test'}
        </button>

        <button 
  onClick={() => window.location.href='/dashboard'}
  style={{
    padding: '12px 24px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px'
  }}
>
  Open Analytics Dashboard
</button>

      </div>

      {message && (
        <div style={{
          padding: '10px',
          borderRadius: '5px',
          backgroundColor: message.includes('❌') ? '#ffebee' : '#e8f5e8',
          color: message.includes('❌') ? '#c62828' : '#2e7d32'
        }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;