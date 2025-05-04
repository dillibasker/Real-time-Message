import React, { useState, useRef, useEffect } from 'react';
import { Smile, Paperclip, Mic, Send } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

interface MessageInputProps {
  recipientId: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ recipientId }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { sendMessage, setTyping } = useChat();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle typing indicator
  useEffect(() => {
    if (message && !isTyping) {
      setIsTyping(true);
      setTyping(recipientId, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        setTyping(recipientId, false);
      }
    }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, recipientId, setTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessage(recipientId, message.trim());
    setMessage('');
    setIsTyping(false);
    setTyping(recipientId, false);
    
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white border-t border-[var(--color-border)] p-3">
      <form 
        className="flex items-end gap-2" 
        onSubmit={handleSubmit}
      >
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
          aria-label="Add emoji"
        >
          <Smile size={22} />
        </button>
        
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
          aria-label="Attach file"
        >
          <Paperclip size={22} />
        </button>
        
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            className="w-full p-3 pr-12 rounded-lg border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none resize-none max-h-32"
            rows={1}
          />
        </div>
        
        {message ? (
          <button
            type="submit"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        ) : (
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="Record voice message"
          >
            <Mic size={22} />
          </button>
        )}
      </form>
    </div>
  );
};

export default MessageInput;