import { Task } from '../types';
import { v4 as uuidv4 } from 'uuid';

// In-memory store — acts as our database
const tasks: Map<string, Task> = new Map();

// Seed with sample data
const seed = (): void => {
  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const tomorrow = new Date(Date.now() + 86400000).toISOString();
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString();

  const sampleTasks: Task[] = [
    {
      id: uuidv4(),
      title: 'Design system architecture',
      description: 'Plan the overall system architecture for the new platform including microservices breakdown and API contracts.',
      priority: 'urgent',
      status: 'in-progress',
      category: 'work',
      dueDate: tomorrow,
      createdAt: yesterday,
      updatedAt: now,
      tags: ['architecture', 'backend', 'planning'],
      assignee: 'Alex Johnson',
      subtasks: [
        { id: uuidv4(), title: 'Define service boundaries', completed: true, createdAt: yesterday },
        { id: uuidv4(), title: 'Write API spec', completed: false, createdAt: yesterday },
        { id: uuidv4(), title: 'Review with team', completed: false, createdAt: yesterday },
      ],
    },
    {
      id: uuidv4(),
      title: 'Q3 financial report review',
      description: 'Review and approve the Q3 financial reports before board presentation.',
      priority: 'high',
      status: 'review',
      category: 'finance',
      dueDate: tomorrow,
      createdAt: yesterday,
      updatedAt: now,
      tags: ['finance', 'report', 'Q3'],
      assignee: 'Sarah Mills',
      subtasks: [
        { id: uuidv4(), title: 'Check revenue figures', completed: true, createdAt: yesterday },
        { id: uuidv4(), title: 'Validate expense data', completed: true, createdAt: yesterday },
      ],
    },
    {
      id: uuidv4(),
      title: 'Team standup follow-ups',
      description: 'Address all action items raised during weekly standup meetings.',
      priority: 'medium',
      status: 'todo',
      category: 'work',
      dueDate: nextWeek,
      createdAt: now,
      updatedAt: now,
      tags: ['meetings', 'team'],
      assignee: null,
      subtasks: [],
    },
    {
      id: uuidv4(),
      title: 'Schedule annual health checkup',
      description: 'Book appointment with GP for annual physical exam and blood work.',
      priority: 'medium',
      status: 'todo',
      category: 'health',
      dueDate: nextWeek,
      createdAt: now,
      updatedAt: now,
      tags: ['health', 'appointment'],
      assignee: null,
      subtasks: [],
    },
    {
      id: uuidv4(),
      title: 'Update project documentation',
      description: 'Update the README and API documentation to reflect recent changes.',
      priority: 'low',
      status: 'done',
      category: 'work',
      dueDate: null,
      createdAt: yesterday,
      updatedAt: now,
      tags: ['docs', 'readme'],
      assignee: 'Alex Johnson',
      subtasks: [
        { id: uuidv4(), title: 'Update README', completed: true, createdAt: yesterday },
        { id: uuidv4(), title: 'Document new endpoints', completed: true, createdAt: yesterday },
      ],
    },
    {
      id: uuidv4(),
      title: 'Buy groceries for the week',
      description: 'Weekly grocery run — fruits, vegetables, proteins, and household essentials.',
      priority: 'low',
      status: 'todo',
      category: 'shopping',
      dueDate: tomorrow,
      createdAt: now,
      updatedAt: now,
      tags: ['groceries', 'personal'],
      assignee: null,
      subtasks: [
        { id: uuidv4(), title: 'Fruits & vegetables', completed: false, createdAt: now },
        { id: uuidv4(), title: 'Proteins', completed: false, createdAt: now },
        { id: uuidv4(), title: 'Household items', completed: false, createdAt: now },
      ],
    },
  ];

  sampleTasks.forEach((t) => tasks.set(t.id, t));
};

seed();

export const getAll = (): Task[] => Array.from(tasks.values());
export const getById = (id: string): Task | undefined => tasks.get(id);
export const create = (task: Task): Task => { tasks.set(task.id, task); return task; };
export const update = (id: string, task: Task): Task => { tasks.set(id, task); return task; };
export const remove = (id: string): boolean => tasks.delete(id);
export const exists = (id: string): boolean => tasks.has(id);
