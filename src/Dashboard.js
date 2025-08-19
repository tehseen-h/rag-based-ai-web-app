import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalConversations: 0,
    totalEscalations: 0,
    positiveFeedback: 0, // <-- CHANGED: Corrected the typo from 'positveFeedback'
    negativeFeedback: 0,
    topIntents: [],
    recentActivity: [],
    loading: true
  });

  // Mock data can be used as a fallback if the API call fails
  const mockMetrics = {
    totalConversations: 156,
    totalEscalations: 12,
    positiveFeedback: 89,
    negativeFeedback: 23,
    topIntents: [
      { intent: 'request_estimate', count: 45 },
      { intent: 'general_inquiry', count: 34 },
    ],
    recentActivity: [
      { timestamp: '2024-08-17 14:30', intent: 'request_estimate', escalated: false, feedback: 'positive' },
      { timestamp: '2024-08-17 13:15', intent: 'general_inquiry', escalated: true, feedback: null },
    ]
  };

  useEffect(() => {
    // This function will fetch the metrics from your n8n webhook
    const loadMetrics = async () => {
      try {
        // <-- CHANGED: The actual API call is now active -->
        const response = await fetch('http://localhost:5678/webhook/get-metrics');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // <-- CHANGED: We process the response from n8n -->
        // n8n returns an array like [{...metrics...}], so we access the first element
        if (data && data.length > 0) {
            setMetrics({ ...data[0], loading: false });
        } else {
            // Handle cases where the API returns an empty array
            throw new Error("Received empty data from API");
        }

      } catch (error) {
        console.error('Error loading metrics:', error);
        // If the API call fails, we'll fall back to the mock data after a short delay
        setTimeout(() => {
            setMetrics({ ...mockMetrics, loading: false });
        }, 1000);
      }
    };

    loadMetrics();
  }, []); // The empty dependency array ensures this runs only once on mount

  const handleReindexKnowledge = async () => {
    try {
      const response = await fetch('http://localhost:5678/webhook/reindex-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        alert('Knowledge base reindex initiated!');
      }
    } catch (error) {
      alert('Reindex failed: ' + error.message);
    }
  };

  // Display a loading message while fetching data
  if (metrics.loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Dashboard</h1>
        <p>Loading metrics...</p>
      </div>
    );
  }

  // Render the dashboard once the data is loaded
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Analytics Dashboard</h1>
        <div>
          <button 
            onClick={handleReindexKnowledge}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              marginRight: '10px',
              cursor: 'pointer'
            }}
          >
            Re-index Knowledge Base
          </button>
          <a href="/" style={{ color: '#007bff', textDecoration: 'none' }}>← Back to Main Site</a>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>Total Conversations</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0', color: '#007bff' }}>
            {metrics.totalConversations}
          </p>
        </div>

        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>Escalations</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0', color: '#dc3545' }}>
            {metrics.totalEscalations}
          </p>
        </div>

        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>Positive Feedback</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0', color: '#28a745' }}>
            {metrics.positiveFeedback}
          </p>
        </div>

        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>Negative Feedback</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0', color: '#ffc107' }}>
            {metrics.negativeFeedback}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
        {/* Top Intents Chart */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '8px'
        }}>
          <h3 style={{ marginTop: '0', color: '#495057' }}>Top Intents</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {metrics.topIntents.map((item, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: index < metrics.topIntents.length - 1 ? '1px solid #eee' : 'none'
              }}>
                <span style={{ textTransform: 'capitalize' }}>
                  {item.intent.replace(/_/g, ' ')}
                </span>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: `${(item.count / (metrics.topIntents[0]?.count || 1)) * 100}px`,
                    height: '10px',
                    backgroundColor: '#007bff',
                    marginRight: '10px',
                    borderRadius: '5px'
                  }}></div>
                  <span style={{ fontWeight: 'bold' }}>{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '8px'
        }}>
          <h3 style={{ marginTop: '0', color: '#495057' }}>Recent Activity</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {metrics.recentActivity.map((activity, index) => (
              <div key={index} style={{
                padding: '12px 0',
                borderBottom: index < metrics.recentActivity.length - 1 ? '1px solid #eee' : 'none'
              }}>
                <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>
                  {new Date(activity.timestamp).toLocaleString()}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ textTransform: 'capitalize' }}>
                    {activity.intent.replace(/_/g, ' ')}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {activity.escalated && (
                      <span style={{ 
                        backgroundColor: '#dc3545', 
                        color: 'white', 
                        padding: '2px 6px', 
                        borderRadius: '3px', 
                        fontSize: '10px' 
                      }}>
                        ESCALATED
                      </span>
                    )}
                    {activity.feedback && activity.feedback !== 'neutral' && (
                      <span style={{ 
                        backgroundColor: activity.feedback === 'positive' ? '#28a745' : '#ffc107', 
                        color: 'white', 
                        padding: '2px 6px', 
                        borderRadius: '3px', 
                        fontSize: '10px' 
                      }}>
                        {activity.feedback.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;