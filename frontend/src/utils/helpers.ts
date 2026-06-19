import type { Priority, Status, Category } from '../types.ts';

export const priorityConfig: Record<Priority, { label: string; color: string; bg: string; dot: string }> = {
  low:    { label: 'Low',    color: 'text-gray-400',  bg: 'bg-gray-400/10',  dot: 'bg-gray-400' },
  medium: { label: 'Medium', color: 'text-blue-400',  bg: 'bg-blue-400/10',  dot: 'bg-blue-400' },
  high:   { label: 'High',   color: 'text-yellow-400',bg: 'bg-yellow-400/10',dot: 'bg-yellow-400' },
  urgent: { label: 'Urgent', color: 'text-red-400',   bg: 'bg-red-400/10',   dot: 'bg-red-500' },
};

export const statusConfig: Record<Status, { label: string; color: string; bg: string; border: string }> = {
  'todo':        { label: 'To Do',      color: 'text-gray-300',   bg: 'bg-gray-700/50',   border: 'border-gray-600' },
  'in-progress': { label: 'In Progress',color: 'text-blue-300',   bg: 'bg-blue-900/30',   border: 'border-blue-700' },
  'review':      { label: 'Review',     color: 'text-yellow-300', bg: 'bg-yellow-900/30', border: 'border-yellow-700' },
  'done':        { label: 'Done',       color: 'text-green-300',  bg: 'bg-green-900/30',  border: 'border-green-700' },
};

export const categoryConfig: Record<Category, { label: string; icon: string; color: string }> = {
  work:     { label: 'Work',     icon: '💼', color: 'text-blue-400' },
  personal: { label: 'Personal', icon: '👤', color: 'text-purple-400' },
  shopping: { label: 'Shopping', icon: '🛒', color: 'text-green-400' },
  health:   { label: 'Health',   icon: '❤️', color: 'text-red-400' },
  finance:  { label: 'Finance',  icon: '💰', color: 'text-yellow-400' },
  other:    { label: 'Other',    icon: '📌', color: 'text-gray-400' },
};

export const isOverdue = (dueDate: string | null, status: Status): boolean => {
  if (!dueDate || status === 'done') return false;
  return new Date(dueDate) < new Date();
};

export const formatDueDate = (dueDate: string | null): string => {
  if (!dueDate) return '';
  const date = new Date(dueDate);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days < 7) return `Due in ${days}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const getSubtaskProgress = (subtasks: { completed: boolean }[]): number => {
  if (!subtasks.length) return 0;
  return Math.round((subtasks.filter((s) => s.completed).length / subtasks.length) * 100);
};
