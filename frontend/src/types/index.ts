export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'todo' | 'in-progress' | 'review' | 'done';
export type Category = 'work' | 'personal' | 'shopping' | 'health' | 'finance' | 'other';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

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

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  review: number;
  done: number;
  overdue: number;
  highPriority: number;
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

export interface UpdateTaskDTO extends Partial<CreateTaskDTO> {}

export type ViewMode = 'board' | 'list' | 'calendar';
export type FilterState = {
  status: Status | 'all';
  priority: Priority | 'all';
  category: Category | 'all';
  search: string;
  sortBy: 'createdAt' | 'dueDate' | 'priority' | 'title';
  order: 'asc' | 'desc';
};
