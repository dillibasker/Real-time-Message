import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { formatISO } from 'date-fns';

interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  status: string;
  isOnline: boolean;
  lastSeen: Date;
}

interface Message {
  _id: string;
  sender: string | User;
  recipient: string;
  content: string;
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
  mediaUrl?: string;
  mediaType?: string;
}

interface Conversation {
  id: string;
  contact: User;
  lastMessage: Message;
  unreadCount: number;
  updatedAt: string;
}

interface ChatContextType {
  activeChat: string | null;
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  contacts: User[];
  loadingMessages: boolean;
  loadingConversations: boolean;
  typingUsers: Record<string, boolean>;
  onlineUsers: string[];
  setActiveChat: (userId: string | null) => void;
  sendMessage: (recipientId: string, content: string, mediaUrl?: string, mediaType?: string) => Promise<void>;
  loadMessages: (recipientId: string) => Promise<void>;
  markMessageAsRead: (messageId: string, senderId: string) => Promise<void>;
  setTyping: (recipientId: string, isTyping: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const SOCKET_URL = 'http://localhost:5000';
const API_URL = 'http://localhost:5000/api';

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [contacts, setContacts] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [loadingConversations, setLoadingConversations] = useState<boolean>(false);
  
  // Refs for cleanup and debounce
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Initialize socket connection
  useEffect(() => {
    if (token && user?._id && !socket) {
      const newSocket = io(SOCKET_URL);
      
      newSocket.on('connect', () => {
        console.log('Socket connected');
        // Authenticate socket
        newSocket.emit('authenticate', token);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      setSocket(newSocket);
      socketRef.current = newSocket;
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token, user?._id]);

  // Load user conversations
  useEffect(() => {
    if (token) {
      const loadConversations = async () => {
        try {
          setLoadingConversations(true);
          const res = await axios.get(`${API_URL}/messages/conversations`);
          setConversations(res.data.conversations);
        } catch (err) {
          console.error('Error loading conversations:', err);
        } finally {
          setLoadingConversations(false);
        }
      };

      loadConversations();
    }
  }, [token]);

  // Load contacts
  useEffect(() => {
    if (token) {
      const loadContacts = async () => {
        try {
          const res = await axios.get(`${API_URL}/users`);
          setContacts(res.data.users);
        } catch (err) {
          console.error('Error loading contacts:', err);
        }
      };

      loadContacts();
    }
  }, [token]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Handle receiving messages
    socket.on('receive_message', (data: Message) => {
      // Add message to state
      setMessages(prev => {
        const senderId = typeof data.sender === 'string' ? data.sender : data.sender._id;
        const newMessages = [...(prev[senderId] || []), data];
        return { ...prev, [senderId]: newMessages };
      });

      // Update conversations list
      updateConversationWithMessage(data);
    });

    // Handle typing indicator
    socket.on('user_typing', (data: { sender: string }) => {
      setTypingUsers(prev => ({ ...prev, [data.sender]: true }));
      
      // Clear typing indicator after 3 seconds of inactivity
      if (typingTimeoutRef.current[data.sender]) {
        clearTimeout(typingTimeoutRef.current[data.sender]);
      }
      
      typingTimeoutRef.current[data.sender] = setTimeout(() => {
        setTypingUsers(prev => ({ ...prev, [data.sender]: false }));
      }, 3000);
    });

    // Handle read receipts
    socket.on('read_receipt', (data: { messageId: string }) => {
      // Update message status to 'read'
      setMessages(prev => {
        const updatedMessages: Record<string, Message[]> = {};
        
        Object.keys(prev).forEach(userId => {
          updatedMessages[userId] = prev[userId].map(msg => 
            msg._id === data.messageId ? { ...msg, status: 'read' } : msg
          );
        });
        
        return updatedMessages;
      });
    });

    // Handle user status updates
    socket.on('user_status', (data: { userId: string, status: 'online' | 'offline' }) => {
      if (data.status === 'online') {
        setOnlineUsers(prev => [...prev, data.userId]);
      } else {
        setOnlineUsers(prev => prev.filter(id => id !== data.userId));
      }

      // Update contacts list
      setContacts(prev => 
        prev.map(contact => 
          contact._id === data.userId 
            ? { ...contact, isOnline: data.status === 'online' } 
            : contact
        )
      );
    });

    // Handle online users list
    socket.on('online_users', (onlineUserIds: string[]) => {
      setOnlineUsers(onlineUserIds);
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
      socket.off('read_receipt');
      socket.off('user_status');
      socket.off('online_users');
    };
  }, [socket]);

  // Cleanup typing timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(typingTimeoutRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  // Load chat messages
  const loadMessages = async (recipientId: string) => {
    if (!token || !recipientId) return;

    try {
      setLoadingMessages(true);
      const res = await axios.get(`${API_URL}/messages/conversation/${recipientId}`);
      setMessages(prev => ({ ...prev, [recipientId]: res.data.messages }));
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send a message
  const sendMessage = async (recipientId: string, content: string, mediaUrl?: string, mediaType?: string) => {
    if (!token || !user || !recipientId || !content) return;

    try {
      // Optimistic update with temporary ID
      const tempId = Date.now().toString();
      const tempMessage: Message = {
        _id: tempId,
        sender: user,
        recipient: recipientId,
        content,
        status: 'sent',
        createdAt: formatISO(new Date()),
        mediaUrl,
        mediaType
      };

      // Update local state first (optimistic)
      setMessages(prev => ({
        ...prev,
        [recipientId]: [...(prev[recipientId] || []), tempMessage]
      }));

      // Send to API
      const res = await axios.post(`${API_URL}/messages`, {
        recipient: recipientId,
        content,
        mediaUrl,
        mediaType
      });

      // Replace temp message with actual message from server
      setMessages(prev => ({
        ...prev,
        [recipientId]: prev[recipientId].map(msg => 
          msg._id === tempId ? res.data.data : msg
        )
      }));

      // Emit to socket for real-time
      if (socket) {
        socket.emit('private_message', {
          content,
          recipient: recipientId,
          sender: user._id,
          timestamp: new Date().toISOString(),
          ...(mediaUrl && { mediaUrl }),
          ...(mediaType && { mediaType })
        });
      }

      // Update conversations list
      updateConversationWithMessage(res.data.data);
    } catch (err) {
      console.error('Error sending message:', err);
      // Remove failed message from state
      setMessages(prev => ({
        ...prev,
        [recipientId]: prev[recipientId].filter(msg => msg._id !== 'temp')
      }));
    }
  };

  // Mark message as read
  const markMessageAsRead = async (messageId: string, senderId: string) => {
    try {
      // Update local state
      setMessages(prev => ({
        ...prev,
        [senderId]: prev[senderId].map(msg => 
          msg._id === messageId ? { ...msg, status: 'read' } : msg
        )
      }));

      // Update on server
      await axios.patch(`${API_URL}/messages/${messageId}/status`, {
        status: 'read'
      });

      // Emit read receipt
      if (socket) {
        socket.emit('message_read', {
          messageId,
          sender: senderId
        });
      }
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  // Set typing indicator
  const setTyping = (recipientId: string, isTyping: boolean) => {
    if (!socket || !user) return;

    socket.emit('typing', {
      sender: user._id,
      recipient: recipientId,
      isTyping
    });
  };

  // Helper to update conversations with new message
  const updateConversationWithMessage = (message: Message) => {
    const senderId = typeof message.sender === 'string' ? message.sender : message.sender._id;
    const recipientId = message.recipient;
    const otherUserId = user?._id === senderId ? recipientId : senderId;

    setConversations(prev => {
      // Find existing conversation
      const conversationIndex = prev.findIndex(c => c.contact._id === otherUserId);
      
      if (conversationIndex >= 0) {
        // Update existing conversation
        const updatedConversations = [...prev];
        updatedConversations[conversationIndex] = {
          ...updatedConversations[conversationIndex],
          lastMessage: message,
          updatedAt: message.createdAt,
          unreadCount: user?._id !== senderId 
            ? updatedConversations[conversationIndex].unreadCount + 1 
            : updatedConversations[conversationIndex].unreadCount
        };
        
        // Sort conversations by last message time
        return updatedConversations.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      } else {
        // Find contact info
        const contact = contacts.find(c => c._id === otherUserId);
        
        if (!contact) return prev;
        
        // Create new conversation
        const newConversation: Conversation = {
          id: `temp-${Date.now()}`,
          contact,
          lastMessage: message,
          unreadCount: user?._id !== senderId ? 1 : 0,
          updatedAt: message.createdAt
        };
        
        // Add new conversation and sort
        return [newConversation, ...prev].sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }
    });
  };

  return (
    <ChatContext.Provider
      value={{
        activeChat,
        conversations,
        messages,
        contacts,
        loadingMessages,
        loadingConversations,
        typingUsers,
        onlineUsers,
        setActiveChat,
        sendMessage,
        loadMessages,
        markMessageAsRead,
        setTyping
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};