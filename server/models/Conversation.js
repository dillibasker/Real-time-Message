import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  }
}, { timestamps: true });

// Ensure participants are always sorted to avoid duplicate conversations
conversationSchema.pre('save', function(next) {
  this.participants.sort();
  next();
});

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;