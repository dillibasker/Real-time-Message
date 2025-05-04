import React, { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import SidebarHeader from '../components/sidebar/SidebarHeader';
import ConversationList from '../components/sidebar/ConversationList';
import ChatHeader from '../components/chat/ChatHeader';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';
import EmptyChat from '../components/chat/EmptyChat';

const Chat: React.FC = () => {
  const { activeChat } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // On desktop, always show sidebar
      if (!mobile) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // On mobile, close sidebar when a chat is active
  useEffect(() => {
    if (isMobile && activeChat) {
      setSidebarOpen(false);
    }
  }, [activeChat, isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Sidebar */}
      <div 
        className={`
          flex flex-col md:w-96 h-full bg-white border-r border-[var(--color-border)]
          ${isMobile ? 'absolute inset-0 z-10' : 'relative'}
          ${isMobile && !sidebarOpen ? 'hidden' : 'flex'}
        `}
      >
        <SidebarHeader toggleSidebar={toggleSidebar} isMobile={isMobile} />
        <ConversationList closeSidebar={() => setSidebarOpen(false)} />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        <ChatHeader toggleSidebar={toggleSidebar} isMobile={isMobile} />
        
        {activeChat ? (
          <>
            <MessageList recipientId={activeChat} />
            <MessageInput recipientId={activeChat} />
          </>
        ) : (
          <EmptyChat />
        )}
      </div>
    </div>
  );
};

export default Chat;