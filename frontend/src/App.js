import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your news assistant. Ask me about the latest technology news.",
      isUser: false
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([
    { id: 1, title: "Latest Tech News", timestamp: "Today" },
    { id: 2, title: "AI Developments", timestamp: "Yesterday" },
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      isUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: inputValue }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        text: data.response,
        isUser: false
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I encountered an error. Please try again.",
        isUser: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([
      {
        id: 1,
        text: "Hello! I'm your news assistant. Ask me about the latest technology news.",
        isUser: false
      }
    ]);
    setInputValue('');
  };

  return (
    <div className="grid-layout">
      {/* Left Sidebar */}
      <div className="left-sidebar">
        <div className="sidebar-header">
          <h1>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Gemini
          </h1>
        </div>
        
        <button 
          onClick={startNewChat}
          className="new-chat-btn"
        >
          ➕ New chat
        </button>
        
        <div className="recent-conversations">
          {conversations.map((conv) => (
            <div 
              key={conv.id} 
              className="conversation-item"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 16V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="truncate">{conv.title}</span>
            </div>
          ))}
        </div>
        
        <div className="profile-section">
          <div className="avatar">A</div>
          <div className="user-info">
            <div className="username">Akarsh Jaiswal</div>
            <div className="plan">Free Plan</div>
          </div>
        </div>
      </div>

      {/* Main Chat Column */}
      <div className="main-chat">
        <div className="chat-container">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat-message ${message.isUser ? 'user-message' : 'ai-message'}`}
            >
              <div className="message-content">
                {message.text}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="chat-message ai-message">
              <div className="message-content">
                <div className="loading-dots">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-container">
          <div className="input-wrapper">
            <div className="pill-input">
              <span className="input-placeholder">Ask News Agent</span>
              <div className="model-indicator">Flash</div>
            </div>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading || !inputValue.trim()}
              className="send-button"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L20 12L12 20L4 12L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
