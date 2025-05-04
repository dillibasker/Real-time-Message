import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  mediaUrl: {
    type: String,
    default: ''
  },
  mediaType: {
    type: String,
    enum: ['image', 'audio', 'video', 'document', ''],
    default: ''
  }
}, { timestamps: true });

// Create a compound index for querying conversation history efficiently
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;