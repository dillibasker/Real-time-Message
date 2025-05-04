import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import MessageItem from './MessageItem';
import LoadingSpinner from '../common/LoadingSpinner';
import TypingIndicator from './TypingIndicator';
import { formatDistanceToNow } from 'date-fns';

interface MessageListProps {
  recipientId: string;
}

const MessageList: React.FC<MessageListProps> = ({ recipientId }) => {
  const { user } = useAuth();
  const { 
    messages, 
    loadMessages, 
    loadingMessages, 
    typingUsers,
    markMessageAsRead
  } = useChat();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentMessages = messages[recipientId] || [];
  const isTyping = typingUsers[recipientId] || false;

  // Load messages when recipient changes
  useEffect(() => {
    if (recipientId) {
      loadMessages(recipientId);
    }
  }, [recipientId, loadMessages]);

  // Mark unread messages as read
  useEffect(() => {
    if (user && currentMessages.length > 0) {
      currentMessages.forEach(message => {
        const senderId = typeof message.sender === 'string' 
          ? message.sender 
          : message.sender._id;
        
        if (
          senderId !== user._id && 
          message.status !== 'read'
        ) {
          markMessageAsRead(message._id, senderId);
        }
      });
    }
  }, [currentMessages, user, markMessageAsRead]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentMessages, isTyping]);

  if (loadingMessages) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  const groupMessagesByDate = () => {
    const groups: { date: string; messages: typeof currentMessages }[] = [];
    
    currentMessages.forEach(message => {
      const messageDate = new Date(message.createdAt).toDateString();
      const existingGroup = groups.find(group => group.date === messageDate);
      
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({
          date: messageDate,
          messages: [message]
        });
      }
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate();

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-[#E4DDD6] bg-opacity-30 bg-[url('https://web.whatsapp.com/img/bg-chat-tile-light_a4be512e7195b6b733d9110b408f075d.png')] bg-repeat">
      {messageGroups.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-secondary)]">
          <p className="text-center mb-2">No messages yet</p>
          <p className="text-sm text-center">Send a message to start the conversation</p>
        </div>
      ) : (
        <>
          {messageGroups.map((group, groupIndex) => (
            <div key={`group-${groupIndex}`}>
              <div className="flex justify-center my-3">
                <span className="bg-white px-3 py-1 rounded-full text-xs text-[var(--color-text-secondary)] shadow-sm">
                  {new Date().toDateString() === group.date 
                    ? 'Today' 
                    : formatDistanceToNow(new Date(group.date), { addSuffix: true })}
                </span>
              </div>
              
              {group.messages.map((message, index) => (
                <MessageItem 
                  key={message._id || `temp-${index}`}
                  message={message}
                  isOwnMessage={
                    typeof message.sender === 'string'
                      ? message.sender === user?._id
                      : message.sender._id === user?._id
                  }
                  showSender={index === 0 || group.messages[index - 1]?.sender !== message.sender}
                />
              ))}
            </div>
          ))}
          
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default MessageList;