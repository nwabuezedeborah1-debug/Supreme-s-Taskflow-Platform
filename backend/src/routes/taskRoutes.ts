import { Router } from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  getStats,
} from '../controllers/taskController';

const router = Router();

router.get('/stats', getStats);
router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.patch('/:id/status', updateTaskStatus);
router.delete('/:id', deleteTask);
router.post('/:id/subtasks', addSubtask);
router.patch('/:id/subtasks/:subtaskId', toggleSubtask);
router.delete('/:id/subtasks/:subtaskId', deleteSubtask);

export default router;
