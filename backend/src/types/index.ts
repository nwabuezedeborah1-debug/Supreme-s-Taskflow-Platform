export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'todo' | 'in-progress' | 'review' | 'done';
export type Category = 'work' | 'personal' | 'shopping' | 'health' | 'finance' | 'other';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  category: Category;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  subtasks: Subtask[];
  assignee: string | null;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  priority?: Priority;
  status?: Status;
  category?: Category;
  dueDate?: string | null;
  tags?: string[];
  assignee?: string | null;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: Status;
  category?: Category;
  dueDate?: string | null;
  tags?: string[];
  assignee?: string | null;
}

export interface AddSubtaskDTO {
  title: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  review: number;
  done: number;
  overdue: number;
  highPriority: number;
}
