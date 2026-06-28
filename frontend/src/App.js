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
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-800 flex flex-col">
        <div className="p-4">
          <button 
            onClick={startNewChat}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-4 font-medium transition-colors mb-6"
          >
            ➕ New Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-3">
          <h3 className="text-gray-400 text-sm font-semibold px-2 py-2">Recent Conversations</h3>
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div 
                key={conv.id} 
                className="px-3 py-2 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <div className="font-medium truncate">{conv.title}</div>
                <div className="text-xs text-gray-400">{conv.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">U</span>
            </div>
            <div>
              <div className="font-medium">User</div>
              <div className="text-xs text-gray-400">Free Plan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Column */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-hidden py-6 px-4">
          <div className="max-w-3xl mx-auto h-full flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.isUser
                        ? 'bg-gray-800 text-white rounded-br-none'
                        : 'bg-gray-800 text-white rounded-bl-none'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 text-white rounded-2xl rounded-bl-none px-4 py-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="mt-auto">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about the latest news..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full px-6 py-3 font-medium transition-colors"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-72 bg-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="font-bold text-lg">Quick Suggested Prompts</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 cursor-pointer transition-colors">
            <div className="font-medium">Summarize top tech news</div>
            <div className="text-xs text-gray-400 mt-1">Get a concise overview of today's tech headlines</div>
          </div>
          <div className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 cursor-pointer transition-colors">
            <div className="font-medium">What happened with Nvidia?</div>
            <div className="text-xs text-gray-400 mt-1">Latest updates and developments from Nvidia</div>
          </div>
          <div className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 cursor-pointer transition-colors">
            <div className="font-medium">AI breakthroughs this week</div>
            <div className="text-xs text-gray-400 mt-1">Latest advancements in artificial intelligence</div>
          </div>
          <div className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 cursor-pointer transition-colors">
            <div className="font-medium">Cryptocurrency market update</div>
            <div className="text-xs text-gray-400 mt-1">Latest trends in digital currencies</div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            <div className="font-semibold">News Agent v1.0</div>
            <div className="mt-2">Powered by Qwen3-Coder 30B</div>
            <div className="mt-1">Your AI-powered news assistant</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
