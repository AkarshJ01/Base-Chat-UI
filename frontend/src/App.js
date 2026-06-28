import React, { useState } from 'react';

function App() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hello! I'm your news assistant. Ask me about the latest technology news." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // 1. Append user message
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // 2. Fetch from FastAPI backend
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      
      // Adjust data parsing depending on your exact FastAPI response key (e.g., data.response or data.reply)
      const botReply = data.response || data.reply || JSON.stringify(data);

      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Failed to connect to the backend server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      {/* LEFT SIDEBAR */}
      <aside className="sidebar" style={{ width: '260px', background: '#1e1e1f', display: 'flex', flexDirection: 'column', padding: '20px', justifyContent: 'space-between' }}>
        <div>
          <div className="logo" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', marginBottom: '20px' }}>Chat-Ai</div>
          <button className="new-chat-btn" style={{ width: '100%', padding: '12px', background: '#38bdf8', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px' }}>
            + New chat
          </button>
          <div className="recent-chats" style={{ color: '#aaa', fontSize: '0.9rem' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Recent</p>
            <div style={{ padding: '8px 0', cursor: 'pointer' }}>+ Latest Tech News</div>
            <div style={{ padding: '8px 0', cursor: 'pointer' }}>+ AI Developments</div>
          </div>
        </div>
        <div className="profile-section" style={{ color: '#fff', borderTop: '1px solid #334155', paddingTop: '15px' }}>
          <div style={{ fontWeight: 'bold' }}>Akarsh Jaiswal</div>
          <div style={{ fontSize: '0.8rem', color: '#aaa' }}>Free Plan</div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content" style={{ flex: 1, background: '#131314', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', position: 'relative' }}>
        
        {/* MESSAGE STREAM */}
        <div className="chat-stream" style={{ width: '100%', maxWidth: '820px', flex: 1, overflowY: 'auto', paddingBottom: '100px' }}>
          {messages.map((msg, index) => (
            <div key={index} className={`message-row ${msg.sender}`} style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 'bold', color: msg.sender === 'user' ? '#38bdf8' : '#4ade80', marginBottom: '4px' }}>
                {msg.sender === 'user' ? 'You' : 'News Agent'}
              </span>
              <p style={{ color: '#f3f4f6', margin: 0, lineHeight: '1.6', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
                {msg.text}
              </p>
            </div>
          ))}
          {isLoading && (
            <div className="loading" style={{ color: '#aaa', fontStyle: 'italic' }}>
              Fetching latest briefings...
            </div>
          )}
        </div>

        {/* PINNED INPUT FORM */}
        <form onSubmit={handleSubmit} style={{ position: 'absolute', bottom: '30px', width: '100%', maxWidth: '820px', display: 'flex', gap: '10px', background: '#1e1e1f', padding: '6px 12px', borderRadius: '28px', alignItems: 'center' }}>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask News Agent" 
            style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', padding: '12px', fontSize: '1rem', outline: 'none' }}
          />
          <span style={{ background: '#334155', color: '#38bdf8', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>Flash</span>
          <button type="submit" style={{ background: '#38bdf8', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#000', fontWeight: 'bold' }}>
            ➔
          </button>
        </form>
      </main>
    </div>
  );
}

export default App;
