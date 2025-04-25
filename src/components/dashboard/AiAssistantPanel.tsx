'use client';

import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const AiAssistantPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm your portfolio AI assistant. How can I help you with your investments today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  
  const togglePanel = () => {
    setIsOpen(!isOpen);
  };
  
  const handleNewMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };
  
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      text: newMessage,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponses = [
        "Your portfolio appears well-diversified, but you might consider reducing your Large Cap Growth exposure which is currently over 25% of your portfolio.",
        "I notice you have significant assets in retirement accounts. Consider optimizing your tax efficiency by keeping growth-oriented investments in Roth accounts if available.",
        "Your technology allocation is quite high. While the sector has performed well, consider diversification to reduce sector-specific risk.",
        "Based on your current asset mix, you might benefit from increasing your international exposure for better geographic diversification.",
        "Your fixed income allocation is relatively low at about 5%. Consider increasing this allocation if you're concerned about market volatility.",
        "Looking at your holdings, NVIDIA represents a significant position. Make sure you're comfortable with the concentration risk this presents.",
        "Your cash position is substantial. In this interest rate environment, ensure it's earning competitive yields in high-yield savings or short-term treasury funds.",
        "The BlackRock Equity Index Fund and Large Cap Growth Fund III together represent over 30% of your portfolio. Consider if this aligns with your desired asset allocation.",
        "Your real estate allocation through REITs and Fundrise provides good diversification. This asset class can offer inflation protection and income.",
        "Based on your portfolio composition, I'd recommend periodic rebalancing to maintain your target asset allocation, especially after significant market movements."
      ];
      
      // Select a random response
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const aiMessage: Message = {
        text: randomResponse,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating button */}
      <button
        className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg ${
          isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
        } text-white focus:outline-none transition-colors`}
        onClick={togglePanel}
      >
        <MessageSquare className={`h-6 w-6 ${isOpen ? 'hidden' : 'block'}`} />
        <span className={`text-xl ${isOpen ? 'block' : 'hidden'}`}>×</span>
      </button>
      
      {/* Chat panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 md:w-96 h-96 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3">
            <h3 className="font-medium">Portfolio AI Assistant</h3>
          </div>
          
          {/* Chat messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`mb-3 flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`px-3 py-2 rounded-lg max-w-[80%] ${
                    message.isUser 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="text-sm">{message.text}</div>
                  <div 
                    className={`text-xs mt-1 ${
                      message.isUser ? 'text-blue-200' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Input area */}
          <div className="border-t border-gray-200 p-3 flex">
            <input
              type="text"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ask about your portfolio..."
              value={newMessage}
              onChange={handleNewMessageChange}
              onKeyPress={handleKeyPress}
            />
            <button
              className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none"
              onClick={sendMessage}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAssistantPanel; 