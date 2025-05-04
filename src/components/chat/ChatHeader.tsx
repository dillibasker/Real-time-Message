import React from 'react';
import { Menu, MoreVertical, Phone, Video, ArrowLeft, Search } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import Avatar from '../common/Avatar';
import OnlineStatus from './OnlineStatus';

interface ChatHeaderProps {
  toggleSidebar: () => void;
  isMobile: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ toggleSidebar, isMobile }) => {
  const { activeChat, contacts, onlineUsers } = useChat();

  // Find active contact
  const activeContact = contacts.find(contact => contact._id === activeChat);
  
  if (!activeContact) {
    return (
      <div className="bg-white border-b border-[var(--color-border)] p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isMobile && (
            <button 
              onClick={toggleSidebar} 
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <Menu size={20} />
            </button>
          )}
          <h1 className="text-lg font-semibold">WhatsApp Clone</h1>
        </div>
      </div>
    );
  }

  const isOnline = onlineUsers.includes(activeContact._id);

  return (
    <div className="bg-white border-b border-[var(--color-border)] p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {isMobile && (
          <button 
            onClick={toggleSidebar} 
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="Open sidebar"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        
        <div className="relative">
          <Avatar 
            src={activeContact.avatar} 
            alt={activeContact.username} 
            size="medium" 
          />
          <OnlineStatus isOnline={isOnline} />
        </div>
        
        <div>
          <h2 className="font-semibold">{activeContact.username}</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
          aria-label="Voice call"
        >
          <Phone size={20} />
        </button>
        
        <button 
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
          aria-label="Video call"
        >
          <Video size={20} />
        </button>
        
        <button 
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
          aria-label="Search"
        >
          <Search size={20} />
        </button>
        
        <button 
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
          aria-label="More options"
        >
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;