import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as store from '../data/store';
import {
  Task,
  CreateTaskDTO,
  UpdateTaskDTO,
  AddSubtaskDTO,
  ApiResponse,
  TaskStats,
} from '../types';

const param = (p: string | string[]): string => (Array.isArray(p) ? p[0] : p);

// GET /api/tasks
export const getAllTasks = (req: Request, res: Response): void => {
  const { status, priority, category, search, sortBy, order } = req.query;

  let tasks = store.getAll();

  // Filter
  if (status) tasks = tasks.filter((t) => t.status === status);
  if (priority) tasks = tasks.filter((t) => t.priority === priority);
  if (category) tasks = tasks.filter((t) => t.category === category);
  if (search) {
    const q = (search as string).toLowerCase();
    tasks = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  // Sort
  const sortField = (sortBy as string) || 'createdAt';
  const sortOrder = (order as string) === 'asc' ? 1 : -1;
  tasks.sort((a, b) => {
    const aVal = (a as unknown as Record<string, string>)[sortField] ?? '';
    const bVal = (b as unknown as Record<string, string>)[sortField] ?? '';
    if (aVal < bVal) return -1 * sortOrder;
    if (aVal > bVal) return 1 * sortOrder;
    return 0;
  });

  const response: ApiResponse<Task[]> = { success: true, data: tasks };
  res.json(response);
};

// GET /api/tasks/stats
export const getStats = (_req: Request, res: Response): void => {
  const tasks = store.getAll();
  const now = new Date();

  const stats: TaskStats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    review: tasks.filter((t) => t.status === 'review').length,
    done: tasks.filter((t) => t.status === 'done').length,
    overdue: tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
    ).length,
    highPriority: tasks.filter(
      (t) => (t.priority === 'high' || t.priority === 'urgent') && t.status !== 'done'
    ).length,
  };

  res.json({ success: true, data: stats });
};

// GET /api/tasks/:id
export const getTaskById = (req: Request, res: Response): void => {
  const task = store.getById(param(req.params.id));
  if (!task) {
    res.status(404).json({ success: false, error: 'Task not found' });
    return;
  }
  res.json({ success: true, data: task });
};

// POST /api/tasks
export const createTask = (req: Request, res: Response): void => {
  const body = req.body as CreateTaskDTO;

  if (!body.title || body.title.trim() === '') {
    res.status(400).json({ success: false, error: 'Title is required' });
    return;
  }

  const now = new Date().toISOString();
  const task: Task = {
    id: uuidv4(),
    title: body.title.trim(),
    description: body.description?.trim() || '',
    priority: body.priority || 'medium',
    status: body.status || 'todo',
    category: body.category || 'work',
    dueDate: body.dueDate || null,
    createdAt: now,
    updatedAt: now,
    tags: body.tags || [],
    assignee: body.assignee || null,
    subtasks: [],
  };

  store.create(task);
  res.status(201).json({ success: true, data: task, message: 'Task created successfully' });
};

// PUT /api/tasks/:id
export const updateTask = (req: Request, res: Response): void => {
  const existing = store.getById(param(req.params.id));
  if (!existing) {
    res.status(404).json({ success: false, error: 'Task not found' });
    return;
  }

  const body = req.body as UpdateTaskDTO;
  const updated: Task = {
    ...existing,
    ...body,
    id: existing.id,
    createdAt: existing.createdAt,
    subtasks: existing.subtasks,
    updatedAt: new Date().toISOString(),
  };

  store.update(param(req.params.id), updated);
  res.json({ success: true, data: updated, message: 'Task updated successfully' });
};

// PATCH /api/tasks/:id/status
export const updateTaskStatus = (req: Request, res: Response): void => {
  const existing = store.getById(param(req.params.id));
  if (!existing) {
    res.status(404).json({ success: false, error: 'Task not found' });
    return;
  }

  const { status } = req.body;
  const validStatuses = ['todo', 'in-progress', 'review', 'done'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ success: false, error: 'Invalid status value' });
    return;
  }

  const updated: Task = { ...existing, status, updatedAt: new Date().toISOString() };
  store.update(param(req.params.id), updated);
  res.json({ success: true, data: updated, message: 'Status updated' });
};

// DELETE /api/tasks/:id
export const deleteTask = (req: Request, res: Response): void => {
  if (!store.exists(param(req.params.id))) {
    res.status(404).json({ success: false, error: 'Task not found' });
    return;
  }
  store.remove(param(req.params.id));
  res.json({ success: true, message: 'Task deleted successfully' });
};

// POST /api/tasks/:id/subtasks
export const addSubtask = (req: Request, res: Response): void => {
  const task = store.getById(param(req.params.id));
  if (!task) {
    res.status(404).json({ success: false, error: 'Task not found' });
    return;
  }

  const { title } = req.body as AddSubtaskDTO;
  if (!title || title.trim() === '') {
    res.status(400).json({ success: false, error: 'Subtask title is required' });
    return;
  }

  const subtask = { id: uuidv4(), title: title.trim(), completed: false, createdAt: new Date().toISOString() };
  const updated: Task = {
    ...task,
    subtasks: [...task.subtasks, subtask],
    updatedAt: new Date().toISOString(),
  };

  store.update(task.id, updated);
  res.status(201).json({ success: true, data: updated, message: 'Subtask added' });
};

// PATCH /api/tasks/:id/subtasks/:subtaskId
export const toggleSubtask = (req: Request, res: Response): void => {
  const task = store.getById(param(req.params.id));
  if (!task) {
    res.status(404).json({ success: false, error: 'Task not found' });
    return;
  }

  const subtaskIndex = task.subtasks.findIndex((s) => s.id === param(req.params.subtaskId));
  if (subtaskIndex === -1) {
    res.status(404).json({ success: false, error: 'Subtask not found' });
    return;
  }

  const updatedSubtasks = [...task.subtasks];
  updatedSubtasks[subtaskIndex] = {
    ...updatedSubtasks[subtaskIndex],
    completed: !updatedSubtasks[subtaskIndex].completed,
  };

  const updated: Task = { ...task, subtasks: updatedSubtasks, updatedAt: new Date().toISOString() };
  store.update(task.id, updated);
  res.json({ success: true, data: updated, message: 'Subtask toggled' });
};

// DELETE /api/tasks/:id/subtasks/:subtaskId
export const deleteSubtask = (req: Request, res: Response): void => {
  const task = store.getById(param(req.params.id));
  if (!task) {
    res.status(404).json({ success: false, error: 'Task not found' });
    return;
  }

  const updated: Task = {
    ...task,
    subtasks: task.subtasks.filter((s) => s.id !== param(req.params.subtaskId)),
    updatedAt: new Date().toISOString(),
  };
  store.update(task.id, updated);
  res.json({ success: true, data: updated, message: 'Subtask deleted' });
};
