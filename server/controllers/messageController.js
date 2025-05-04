import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import mongoose from 'mongoose';

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { recipient, content, mediaUrl, mediaType } = req.body;
    const sender = req.user.id;
    
    // Create new message
    const newMessage = new Message({
      sender,
      recipient,
      content,
      mediaUrl: mediaUrl || '',
      mediaType: mediaType || ''
    });
    
    await newMessage.save();
    
    // Update or create conversation
    const participants = [sender, recipient].sort();
    
    let conversation = await Conversation.findOne({
      participants: { $all: participants }
    });
    
    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants,
        lastMessage: newMessage._id,
        unreadCount: { [recipient]: 1 }
      });
    } else {
      // Update existing conversation
      conversation.lastMessage = newMessage._id;
      
      // Increment unread count for recipient
      const currentCount = conversation.unreadCount[recipient] || 0;
conversation.unreadCount[recipient] = currentCount + 1;

    }
    
    await conversation.save();
    
    // Populate sender information
    await newMessage.populate('sender', 'username avatar');
    
    res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get conversation messages
export const getConversationMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipientId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Find messages between users (in both directions)
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: recipientId },
        { sender: recipientId, recipient: userId }
      ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('sender', 'username avatar')
    .lean();
    
    // Update message status to 'read' for messages sent to current user
    await Message.updateMany(
      { sender: recipientId, recipient: userId, status: { $ne: 'read' } },
      { status: 'read' }
    );
    
    // Reset unread count in conversation
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] }
    });
    
    if (conversation) {
      await Conversation.findOneAndUpdate(
        { participants: { $all: [userId, recipientId] } },
        { $set: { [`unreadCount.${userId}`]: 0 } }
      );
      
    }
    
    res.status(200).json({
      messages: messages.reverse()
    });
  } catch (error) {
    console.error('Get conversation messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user conversations
export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all conversations for user
    const conversations = await Conversation.find({
      participants: userId
    })
    .sort({ updatedAt: -1 })
    .populate('participants', 'username email avatar status isOnline lastSeen')
    .populate('lastMessage')
    .lean();
    
    // Format conversations to include other participant info
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== userId
      );
      
      return {
        id: conv._id,
        contact: otherParticipant,
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount[userId] || 0,      
        updatedAt: conv.updatedAt
      };
    });
    
    res.status(200).json({
      conversations: formattedConversations
    });
  } catch (error) {
    console.error('Get user conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update message status
export const updateMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;
    
    // Update message status
    const message = await Message.findByIdAndUpdate(
      messageId,
      { status },
      { new: true }
    );
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.status(200).json({
      message: 'Message status updated',
      data: message
    });
  } catch (error) {
    console.error('Update message status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};