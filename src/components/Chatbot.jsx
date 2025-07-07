import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Minimize2, 
  Maximize2,
  RotateCcw
} from 'lucide-react';
import chatbotService from '../services/chatbotService';

const Chatbot = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Get current page context
  const getCurrentPageContext = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path === '/new-issue') return 'new-issue';
    if (path.startsWith('/issue/')) return 'issue-details';
    if (path === '/login') return 'login';
    if (path === '/register') return 'register';
    if (path === '/admin') return 'admin';
    if (path === '/') return 'home';
    return 'general';
  };

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const context = getCurrentPageContext();
      const welcome = chatbotService.getWelcomeMessage();
      setMessages([{
        id: Date.now(),
        type: 'bot',
        content: welcome.message,
        suggestions: chatbotService.getSuggestedResponses(context),
        timestamp: new Date().toISOString()
      }]);
    }
  }, [isOpen, messages.length, location.pathname]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageText = null) => {
    const message = messageText || inputMessage.trim();
    if (!message || isLoading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send to chatbot service with current page context
      const currentPage = getCurrentPageContext();
      const response = await chatbotService.sendMessage(message, conversationHistory, currentPage);
      
      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.message,
        timestamp: response.timestamp,
        error: !response.success
      };

      setMessages(prev => [...prev, botMessage]);

      // Update conversation history for context
      if (response.success) {
        setConversationHistory(prev => [
          ...prev,
          { role: 'user', content: message },
          { role: 'assistant', content: response.message }
        ].slice(-10)); // Keep last 10 messages for context
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const clearChat = () => {
    setMessages([]);
    setConversationHistory([]);
    const context = getCurrentPageContext();
    const welcome = chatbotService.getWelcomeMessage();
    setMessages([{
      id: Date.now(),
      type: 'bot',
      content: welcome.message,
      suggestions: chatbotService.getSuggestedResponses(context),
      timestamp: new Date().toISOString()
    }]);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Don't render if not open
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
        title="Open Chat Assistant"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-80 h-96'
    }`}>
      {/* Chat Window */}
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 h-full flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5" />
            <div>
              <h3 className="font-semibold text-sm">LOKAWAZ Assistant</h3>
              <p className="text-xs text-blue-100">Online • Ready to help</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={clearChat}
              className="text-blue-100 hover:text-white p-1 rounded transition-colors"
              title="Clear Chat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-blue-100 hover:text-white p-1 rounded transition-colors"
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-blue-100 hover:text-white p-1 rounded transition-colors"
              title="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Content */}
        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : message.error
                      ? 'bg-red-100 text-red-800 border border-red-200 rounded-bl-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}>
                    <div className="flex items-start space-x-2">
                      {message.type === 'bot' && (
                        <Bot className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          message.error ? 'text-red-500' : 'text-blue-500'
                        }`} />
                      )}
                      {message.type === 'user' && (
                        <User className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-100" />
                      )}
                      <div className="flex-1">
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        <span className={`text-xs mt-1 block ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs text-gray-600 mb-2">Quick suggestions:</p>
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="block w-full text-left text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-200 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg rounded-bl-none px-3 py-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-blue-500" />
                      <div className="flex items-center space-x-1">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        <span className="text-gray-600">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-3 bg-white rounded-b-lg">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Minimized State */}
        {isMinimized && (
          <div className="flex-1 flex items-center justify-between px-4">
            <span className="text-sm text-gray-600">Chat minimized</span>
            <div className="flex items-center space-x-1">
              {messages.length > 1 && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {messages.length - 1} {messages.length - 1 === 1 ? 'message' : 'messages'}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
