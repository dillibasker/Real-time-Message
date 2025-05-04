import React from 'react';
import { useChat } from '../../context/ChatContext';
import ConversationItem from './ConversationItem';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

interface ConversationListProps {
  closeSidebar?: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ closeSidebar }) => {
  const { user } = useAuth();
  const { 
    conversations, 
    contacts, 
    activeChat, 
    setActiveChat, 
    loadingConversations,
    onlineUsers
  } = useChat();

  if (!user) return null;

  const handleSelectConversation = (contactId: string) => {
    setActiveChat(contactId);
    if (closeSidebar) {
      closeSidebar();
    }
  };

  // Filter out the current user from contacts
  const filteredContacts = contacts.filter(contact => contact._id !== user._id);

  if (loadingConversations) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  // Display all contacts, prioritizing those with conversations
  const conversationContactIds = conversations.map(conv => conv.contact._id);
  const contactsWithoutConversations = filteredContacts.filter(
    contact => !conversationContactIds.includes(contact._id)
  );

  return (
    <div className="overflow-y-auto flex-1 bg-white">
      {conversations.length === 0 && contactsWithoutConversations.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center p-4 text-[var(--color-text-secondary)]">
          <p className="text-center">No conversations yet</p>
          <p className="text-sm text-center mt-2">Start a new conversation by selecting a contact</p>
        </div>
      ) : (
        <ul>
          {/* Show existing conversations first */}
          {conversations.map(conversation => {
            const isOnline = onlineUsers.includes(conversation.contact._id);
            return (
              <ConversationItem
                key={conversation.id}
                contact={conversation.contact}
                lastMessage={conversation.lastMessage?.content || ''}
                unreadCount={conversation.unreadCount}
                time={conversation.updatedAt}
                isActive={activeChat === conversation.contact._id}
                isOnline={isOnline}
                onClick={() => handleSelectConversation(conversation.contact._id)}
              />
            );
          })}
          
          {/* Then show contacts without conversations */}
          {contactsWithoutConversations.map(contact => {
            const isOnline = onlineUsers.includes(contact._id);
            return (
              <ConversationItem
                key={contact._id}
                contact={contact}
                lastMessage={contact.status || 'Hey there! I am using WhatsApp Clone.'}
                unreadCount={0}
                time=""
                isActive={activeChat === contact._id}
                isOnline={isOnline}
                onClick={() => handleSelectConversation(contact._id)}
                isNewContact
              />
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ConversationList;