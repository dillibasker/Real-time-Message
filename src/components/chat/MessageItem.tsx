import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  _id: string;
  sender: string | {
    _id: string;
    username: string;
    avatar: string;
  };
  content: string;
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
  mediaUrl?: string;
  mediaType?: string;
}

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
  showSender?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  isOwnMessage,
  showSender = false
}) => {
  const messageTime = format(new Date(message.createdAt), 'h:mm a');
  
  return (
    <div className={`flex mb-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`
          relative rounded-lg p-3 shadow-sm max-w-[75%] 
          ${isOwnMessage 
            ? 'bg-[var(--color-primary-light)]' 
            : 'bg-white'
          }
        `}
      >
        {showSender && !isOwnMessage && typeof message.sender !== 'string' && (
          <div className="text-xs text-[var(--color-primary-dark)] font-medium mb-1">
            {message.sender.username}
          </div>
        )}
        
        <div className="mb-1">
          {message.content.split('\n').map((text, i) => (
            <p key={i}>{text}</p>
          ))}
        </div>
        
        <div className="flex items-center justify-end gap-1 text-[10px] text-[var(--color-text-secondary)]">
          <span>{messageTime}</span>
          
          {isOwnMessage && (
            message.status === 'read' ? (
              <CheckCheck size={14} className="text-blue-500" />
            ) : message.status === 'delivered' ? (
              <CheckCheck size={14} />
            ) : (
              <Check size={14} />
            )
          )}
        </div>
        
        {/* Triangle shape for message bubble */}
        <div
          className={`
            absolute top-0 w-0 h-0 
            border-solid border-t-8 border-transparent
            ${isOwnMessage 
              ? 'right-[-8px] border-r-0 border-l-8 border-l-[var(--color-primary-light)]' 
              : 'left-[-8px] border-l-0 border-r-8 border-r-white'
            }
          `}
        />
      </div>
    </div>
  );
};

export default MessageItem;