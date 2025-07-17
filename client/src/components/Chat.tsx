import { useState, useRef, useEffect } from 'react';
import { useChat } from '../lib/stores/useChat';
import { useMultiplayer } from '../lib/stores/useMultiplayer';

export default function Chat() {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    isVisible, 
    inputValue, 
    chatMode, 
    setInputValue, 
    setChatMode, 
    toggleVisibility 
  } = useChat();
  
  const { sendChatMessage } = useMultiplayer();
  
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);
  
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isInputFocused) {
        e.preventDefault();
        setIsInputFocused(true);
        inputRef.current?.focus();
      } else if (e.key === 'Tab' && !isInputFocused) {
        e.preventDefault();
        setChatMode(chatMode === 'global' ? 'gang' : 'global');
      } else if (e.key === 'Escape' && isInputFocused) {
        setIsInputFocused(false);
        inputRef.current?.blur();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isInputFocused, chatMode, setChatMode]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendChatMessage(inputValue, chatMode);
      setInputValue('');
    }
    setIsInputFocused(false);
    inputRef.current?.blur();
  };
  
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getChatModeColor = (mode: string) => {
    switch (mode) {
      case 'global': return 'text-blue-400';
      case 'gang': return 'text-green-400';
      case 'system': return 'text-yellow-400';
      default: return 'text-white';
    }
  };
  
  if (!isVisible) {
    return (
      <button
        onClick={toggleVisibility}
        className="fixed bottom-20 left-4 bg-black bg-opacity-70 text-white p-2 rounded-lg pointer-events-auto"
      >
        Show Chat
      </button>
    );
  }
  
  return (
    <div className="fixed bottom-20 left-4 w-80 pointer-events-auto">
      {/* Chat messages */}
      <div 
        ref={messagesRef}
        className="bg-black bg-opacity-70 text-white p-4 rounded-lg max-h-64 overflow-y-auto mb-2"
      >
        {messages.length === 0 ? (
          <div className="text-gray-400 text-sm">No messages yet...</div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="mb-1 text-sm">
              <span className="text-gray-400">
                {formatTimestamp(message.timestamp)}
              </span>
              <span className={`ml-2 ${getChatModeColor(message.type)}`}>
                [{message.type.toUpperCase()}]
              </span>
              <span className="ml-2 font-bold">
                {message.username}:
              </span>
              <span className="ml-2">
                {message.message}
              </span>
            </div>
          ))
        )}
      </div>
      
      {/* Chat input */}
      <form onSubmit={handleSubmit} className="flex">
        <div className="flex-1 flex">
          <div className={`px-3 py-2 rounded-l-lg ${getChatModeColor(chatMode)} bg-black bg-opacity-70 text-xs flex items-center`}>
            [{chatMode.toUpperCase()}]
          </div>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-black bg-opacity-70 text-white placeholder-gray-400 focus:outline-none"
            maxLength={200}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg transition-colors"
          >
            Send
          </button>
        </div>
      </form>
      
      {/* Chat controls */}
      <div className="flex justify-between items-center mt-2">
        <div className="text-xs text-gray-400">
          Enter: Send | Tab: Switch Mode | Esc: Close
        </div>
        <button
          onClick={toggleVisibility}
          className="text-xs text-gray-400 hover:text-white"
        >
          Hide Chat
        </button>
      </div>
    </div>
  );
}
