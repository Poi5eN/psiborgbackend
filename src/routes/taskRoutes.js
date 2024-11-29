// In taskRoutes.js
import express from 'express';
import { 
  createTask, 
  getTasks, 
  getTaskById, 
  updateTask, 
  deleteTask, 
  getTaskStats,
  getNewTaskForm // New controller method
} from '../controllers/taskController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/new', authenticate, authorize('admin', 'manager'), getNewTaskForm);
router.post('/', authenticate, authorize('admin', 'manager'), createTask);
router.get('/', authenticate, getTasks);
router.put('/:id', authenticate, updateTask);
router.delete('/:id', authenticate, authorize('admin', 'manager'), deleteTask);
router.get('/stats', authenticate, getTaskStats);
router.get('/:id', authenticate, getTaskById);

export default router;