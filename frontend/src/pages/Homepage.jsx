import React, { useState, useRef, useEffect } from 'react';

const Homepage = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleSendMessage = () => {
    if (userInput.trim() === '') return;
    
    // Add user message
    const newUserMessage = { text: userInput, isUser: true };
    setMessages([...messages, newUserMessage]);
    
    // Clear input field
    setUserInput('');
    
    // Simulate bot response (you can replace this with actual API calls)
    setTimeout(() => {
      const botResponses = {
        'hello': 'Hi there! How can I help you today?',
        'help': 'I can assist with information about our services, pricing, or support.',
        'default': "I'm sorry, I don't understand. Could you please rephrase your question?"
      };
      
      const userText = userInput.toLowerCase();
      let botResponse = botResponses.default;
      
      Object.keys(botResponses).forEach(key => {
        if (userText.includes(key)) {
          botResponse = botResponses[key];
        }
      });
      
      setMessages(prevMessages => [...prevMessages, { text: botResponse, isUser: false }]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="w-full h-[675px] rounded-lg shadow-md flex flex-col overflow-hidden bg-white relative">
      <div className="flex items-center p-3 bg-gray-50 border-b border-gray-200">
        <button 
          className="bg-transparent border-none text-2xl cursor-pointer mr-2"
          onClick={toggleMenu}
        >
          <span>≡</span>
        </button>
        <div className="flex flex-1 items-center bg-gray-100 rounded-full px-4 py-1 mx-2">
          <input 
            type="text" 
            placeholder="Hinted search text" 
            disabled 
            className="flex-1 border-none bg-transparent p-2 text-sm"
          />
          <button className="bg-transparent border-none cursor-pointer">
            <span>🔍</span>
          </button>
        </div>
        <div className="flex justify-center items-center flex-1">
          <button className="mx-1 px-3 py-2 border-none rounded-full text-sm text-white bg-red-500 cursor-pointer">
            Emergency
          </button>
          <button className="mx-1 px-3 py-2 border-none rounded-full text-sm text-white bg-blue-500 cursor-pointer">
            Temp1
          </button>
          <button className="mx-1 px-3 py-2 border-none rounded-full text-sm text-white bg-blue-500 cursor-pointer">
            Temp2
          </button>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-48 bg-white border border-gray-200 rounded shadow-md z-10">
          <ul className="list-none p-0 m-0">
            <li className="p-3 cursor-pointer hover:bg-gray-100">Home</li>
            <li className="p-3 cursor-pointer hover:bg-gray-100">Settings</li>
            <li className="p-3 cursor-pointer hover:bg-gray-100">Help</li>
            <li className="p-3 cursor-pointer hover:bg-gray-100">About</li>
          </ul>
        </div>
      )}
      
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`max-w-[80%] p-3 mb-2 rounded-2xl break-words ${
              message.isUser 
                ? 'self-end bg-blue-500 text-white' 
                : 'self-start bg-gray-200 text-gray-800'
            }`}
          >
            {message.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="flex p-3 border-t border-gray-200 bg-white">
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 p-2 border border-gray-300 rounded-full mr-2"
        />
        <button 
          onClick={handleSendMessage}
          className="bg-blue-500 text-white border-none rounded-full px-5 py-2 cursor-pointer"
        >
          Send
        </button>
      </div>
      
      <div className="p-3 text-center bg-gray-50 border-t border-gray-200">
        <p className="m-0 text-sm font-bold text-gray-600">APNA CHATBOT</p>
      </div>
    </div>
  );
};

export default Homepage;
