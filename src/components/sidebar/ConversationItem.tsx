import React from 'react';
import { format, isToday, isYesterday, isThisYear } from 'date-fns';
import Avatar from '../common/Avatar';
import OnlineStatus from '../chat/OnlineStatus';

interface Contact {
  _id: string;
  username: string;
  avatar: string;
  status: string;
  isOnline: boolean;
  lastSeen: Date;
}

interface ConversationItemProps {
  contact: Contact;
  lastMessage: string;
  unreadCount: number;
  time: string;
  isActive: boolean;
  isOnline: boolean;
  onClick: () => void;
  isNewContact?: boolean;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  contact,
  lastMessage,
  unreadCount,
  time,
  isActive,
  isOnline,
  onClick,
  isNewContact = false
}) => {
  // Format time
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    
    const date = new Date(timeString);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else if (isThisYear(date)) {
      return format(date, 'dd MMM');
    } else {
      return format(date, 'dd/MM/yyyy');
    }
  };

  const formattedTime = formatTime(time);

  // Truncate long messages
  const truncateMessage = (message: string, maxLength = 30) => {
    if (message.length <= maxLength) return message;
    return `${message.substring(0, maxLength)}...`;
  };

  return (
    <li
      className={`
        border-b border-[var(--color-border)] hover:bg-gray-50 transition-colors
        ${isActive ? 'bg-gray-100' : ''}
      `}
    >
      <button
        onClick={onClick}
        className="w-full p-3 flex items-center gap-3 text-left"
      >
        <div className="relative">
          <Avatar 
            src={contact.avatar} 
            alt={contact.username} 
            size="medium" 
          />
          <OnlineStatus isOnline={isOnline} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium truncate">{contact.username}</span>
            {formattedTime && (
              <span className="text-xs text-[var(--color-text-secondary)]">
                {formattedTime}
              </span>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-[var(--color-text-secondary)] truncate">
              {isNewContact ? (
                <span className="italic">{truncateMessage(lastMessage)}</span>
              ) : (
                truncateMessage(lastMessage)
              )}
            </p>
            
            {unreadCount > 0 && (
              <span className="flex-shrink-0 bg-[var(--color-primary)] text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
        </div>
      </button>
    </li>
  );
};

export default ConversationItem;