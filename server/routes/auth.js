import express from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.post('/logout', verifyToken, logout);
router.get('/me', verifyToken, getCurrentUser);

export default router;