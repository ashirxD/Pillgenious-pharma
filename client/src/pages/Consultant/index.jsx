import React, { useState, useRef, useEffect } from 'react';

export default function Consultant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hello! I'm your medical AI assistant. I can help you with general health questions, medication information, and wellness advice. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickQuestions = [
    "What are the side effects of Paracetamol?",
    "How do I manage diabetes medication?",
    "When should I take my blood pressure medicine?",
    "What's the difference between generic and brand medicines?"
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        role: 'assistant',
        content: generateResponse(inputMessage),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateResponse = (question) => {
    // Simple response generator - in production, this would call an AI API
    const responses = {
      paracetamol: "Paracetamol (acetaminophen) is generally safe when taken as directed. Common side effects are rare but may include nausea or rash. The usual adult dose is 500-1000mg every 4-6 hours, not exceeding 4000mg per day. Always consult your healthcare provider for personalized advice.",
      diabetes: "For diabetes medication management, it's important to take your medications at the same time each day, monitor your blood sugar levels regularly, and maintain a balanced diet. Common diabetes medications include Metformin, which is usually taken with meals. Never adjust your dosage without consulting your doctor.",
      pressure: "Blood pressure medications are typically taken at the same time each day. Some are best taken in the morning, while others work better at night. It's important to take them consistently and not skip doses. If you experience dizziness or other side effects, contact your healthcare provider.",
      default: "That's a great question! For specific medical advice, I recommend consulting with your healthcare provider. However, I can provide general information about medications, remind you about proper medication usage, and help you understand basic health concepts. Is there something specific about your medications or health that you'd like to know more about?"
    };

    const lowerQuestion = question.toLowerCase();
    if (lowerQuestion.includes('paracetamol') || lowerQuestion.includes('acetaminophen')) {
      return responses.paracetamol;
    } else if (lowerQuestion.includes('diabetes')) {
      return responses.diabetes;
    } else if (lowerQuestion.includes('pressure') || lowerQuestion.includes('blood pressure')) {
      return responses.pressure;
    } else {
      return responses.default;
    }
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white py-4 px-6 shadow-lg sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Medical Consultation</h1>
              <p className="text-xs md:text-sm text-teal-100">AI-Powered Health Assistant</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Online</span>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-5xl mx-auto flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            {messages.length === 1 && (
              <div className="text-center py-8">
                <div className="inline-block bg-teal-100 p-4 rounded-full mb-4">
                  <svg className="w-12 h-12 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Start a Conversation</h2>
                <p className="text-gray-600 mb-6">Ask me anything about your health and medications</p>
                
                {/* Quick Questions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-teal-500 hover:shadow-md transition-all text-left group"
                    >
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-700 group-hover:text-teal-700 font-medium">{question}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`flex space-x-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 ${message.role === 'user' ? 'bg-teal-700' : 'bg-gradient-to-br from-purple-500 to-pink-500'} w-10 h-10 rounded-full flex items-center justify-center shadow-md`}>
                    {message.role === 'user' ? (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-5 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-teal-700 text-white rounded-br-none'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                    }`}>
                      <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 px-2">
                      {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex space-x-3 max-w-3xl">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="bg-white border border-gray-200 px-5 py-3 rounded-2xl rounded-bl-none shadow-sm">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white px-4 py-4 shadow-lg">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-end space-x-3">
                <div className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-2xl focus-within:border-teal-500 transition-colors">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about medications, health tips, or general wellness..."
                    rows="1"
                    className="w-full px-5 py-3 bg-transparent border-none outline-none resize-none text-gray-800 placeholder-gray-500 max-h-32"
                    style={{ minHeight: '48px' }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className={`p-3 rounded-xl transition-all shadow-md ${
                    inputMessage.trim() && !isTyping
                      ? 'bg-teal-700 hover:bg-teal-800 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Press Enter to send • Shift + Enter for new line
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

