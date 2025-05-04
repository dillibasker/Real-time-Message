import express from 'express';
import http from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/auth.js';
import messageRoutes from './routes/messages.js';
import userRoutes from './routes/users.js';
import { verifyToken } from './middleware/auth.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', verifyToken, messageRoutes);
app.use('/api/users', verifyToken, userRoutes);

// Socket.io connection
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  // Authenticate socket connection
  socket.on('authenticate', async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
      
      // Store user connection
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      
      // Broadcast user online status
      io.emit('user_status', { userId, status: 'online' });
      
      // Send the online users list to the newly connected user
      const onlineUsersList = Array.from(onlineUsers.keys());
      socket.emit('online_users', onlineUsersList);
      
      console.log('User authenticated:', userId);
    } catch (error) {
      console.error('Authentication error:', error.message);
      socket.disconnect();
    }
  });

  // Handle private messages
  socket.on('private_message', async (data) => {
    const { content, recipient, sender, timestamp } = data;
    
    // Save message to database (handled by the client through API)
    
    // Forward message to recipient if online
    const recipientSocketId = onlineUsers.get(recipient);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receive_message', {
        content,
        sender,
        timestamp,
        status: 'delivered'
      });
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const { recipient, sender } = data;
    const recipientSocketId = onlineUsers.get(recipient);
    
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('user_typing', { sender });
    }
  });

  // Handle read receipts
  socket.on('message_read', (data) => {
    const { messageId, sender } = data;
    const senderSocketId = onlineUsers.get(sender);
    
    if (senderSocketId) {
      io.to(senderSocketId).emit('read_receipt', { messageId });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      // Broadcast user offline status
      io.emit('user_status', { userId: socket.userId, status: 'offline' });
      console.log('User disconnected:', socket.userId);
    }
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app')
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await mongoose.connection.close();
  process.exit(0);
});