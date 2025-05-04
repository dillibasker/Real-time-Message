import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  updateUserProfile,
  updateUserStatus
} from '../controllers/userController.js';

const router = express.Router();

// All routes are protected by auth middleware in server.js

// User routes
router.get('/', getAllUsers);
router.get('/:userId', getUserById);
router.patch('/profile', updateUserProfile);
router.patch('/status', updateUserStatus);

export default router;