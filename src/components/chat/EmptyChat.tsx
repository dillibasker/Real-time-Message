import React from 'react';
import { MessageSquare } from 'lucide-react';

const EmptyChat: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[var(--color-background-light)] p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center mb-4">
        <MessageSquare size={28} className="text-[var(--color-primary-dark)]" />
      </div>
      
      <h2 className="text-xl font-semibold mb-2">Welcome to WhatsApp Clone</h2>
      
      <p className="text-[var(--color-text-secondary)] max-w-md mb-6">
        Select a contact from the sidebar to start messaging. Your conversations will appear here.
      </p>
      
      <div className="max-w-md text-sm text-[var(--color-text-secondary)]">
        <p className="mb-3">
          💬 Message your contacts in real-time
        </p>
        <p className="mb-3">
          🔒 End-to-end encrypted conversations
        </p>
        <p>
          🌐 Stay connected anywhere, anytime
        </p>
      </div>
    </div>
  );
};

export default EmptyChat;