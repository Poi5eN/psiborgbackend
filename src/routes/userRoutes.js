// In userRoutes.js
import express from 'express';
import { getUserProfile, updateUserProfile, getAllUsers } from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, authorize('admin', 'manager'), getAllUsers); // Add this route
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, authorize('admin', 'user'), updateUserProfile);

export default router;