import express from 'express';
import { 
  sendMessage, 
  getConversationMessages, 
  getUserConversations,
  updateMessageStatus
} from '../controllers/messageController.js';

const router = express.Router();

// All routes are protected by auth middleware in server.js

// Message routes
router.post('/', sendMessage);
router.get('/conversation/:recipientId', getConversationMessages);
router.get('/conversations', getUserConversations);
router.patch('/:messageId/status', updateMessageStatus);

export default router;