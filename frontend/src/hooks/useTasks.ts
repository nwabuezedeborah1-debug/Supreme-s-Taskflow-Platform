import { useState, useEffect, useCallback } from 'react';
import type { Task, TaskStats, CreateTaskDTO, UpdateTaskDTO, FilterState } from '../types.ts';
import { taskApi } from '../api/taskApi';
import { demoTasks } from '../data/demoTasks.ts';

// Compute stats from a task array
const computeStats = (tasks: Task[]): TaskStats => {
  const now = new Date();
  return {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    review: tasks.filter((t) => t.status === 'review').length,
    done: tasks.filter((t) => t.status === 'done').length,
    overdue: tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done').length,
    highPriority: tasks.filter((t) => (t.priority === 'high' || t.priority === 'urgent') && t.status !== 'done').length,
  };
};

export const useTasks = (filters: FilterState) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  // Local in-memory store for demo mode
  const [localTasks, setLocalTasks] = useState<Task[]>(demoTasks);

  const buildParams = useCallback((): Record<string, string> => {
    const params: Record<string, string> = {};
    if (filters.status !== 'all') params.status = filters.status;
    if (filters.priority !== 'all') params.priority = filters.priority;
    if (filters.category !== 'all') params.category = filters.category;
    if (filters.search.trim()) params.search = filters.search.trim();
    params.sortBy = filters.sortBy;
    params.order = filters.order;
    return params;
  }, [filters]);

  // Apply client-side filters to local tasks when in demo mode
  const filterLocalTasks = useCallback((all: Task[]): Task[] => {
    let result = [...all];
    if (filters.status !== 'all') result = result.filter((t) => t.status === filters.status);
    if (filters.priority !== 'all') result = result.filter((t) => t.priority === filters.priority);
    if (filters.category !== 'all') result = result.filter((t) => t.category === filters.category);
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    result.sort((a, b) => {
      const field = filters.sortBy as keyof Task;
      const av = (a[field] as string) ?? '';
      const bv = (b[field] as string) ?? '';
      return filters.order === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return result;
  }, [filters]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [taskData, statsData] = await Promise.all([
        taskApi.getAll(buildParams()),
        taskApi.getStats(),
      ]);
      setTasks(taskData);
      setStats(statsData);
      setDemoMode(false);
    } catch {
      // Backend unreachable — switch to demo mode with local data
      setDemoMode(true);
      const filtered = filterLocalTasks(localTasks);
      setTasks(filtered);
      setStats(computeStats(localTasks));
      setError(null); // no error shown — demo mode is transparent
    } finally {
      setLoading(false);
    }
  }, [buildParams, filterLocalTasks, localTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // When in demo mode, re-filter whenever filters change
  useEffect(() => {
    if (demoMode) {
      setTasks(filterLocalTasks(localTasks));
    }
  }, [demoMode, filters, localTasks, filterLocalTasks]);

  /* ── Live API operations ── */
  const createTask = async (payload: CreateTaskDTO): Promise<Task> => {
    if (demoMode) {
      const now = new Date().toISOString();
      const task: Task = {
        id: crypto.randomUUID(),
        title: payload.title,
        description: payload.description ?? '',
        priority: payload.priority ?? 'medium',
        status: payload.status ?? 'todo',
        category: payload.category ?? 'work',
        dueDate: payload.dueDate ?? null,
        assignee: payload.assignee ?? null,
        tags: payload.tags ?? [],
        subtasks: [],
        createdAt: now,
        updatedAt: now,
      };
      setLocalTasks((prev) => [task, ...prev]);
      return task;
    }
    const task = await taskApi.create(payload);
    await fetchTasks();
    return task;
  };

  const updateTask = async (id: string, payload: UpdateTaskDTO): Promise<Task> => {
    if (demoMode) {
      let updated!: Task;
      setLocalTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          updated = { ...t, ...payload, updatedAt: new Date().toISOString() };
          return updated;
        })
      );
      return updated;
    }
    const task = await taskApi.update(id, payload);
    setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    await taskApi.getStats().then(setStats);
    return task;
  };

  const updateStatus = async (id: string, status: string): Promise<void> => {
    if (demoMode) {
      setLocalTasks((prev) =>
        prev.map((t) => t.id === id ? { ...t, status: status as Task['status'], updatedAt: new Date().toISOString() } : t)
      );
      return;
    }
    const task = await taskApi.updateStatus(id, status);
    setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    await taskApi.getStats().then(setStats);
  };

  const deleteTask = async (id: string): Promise<void> => {
    if (demoMode) {
      setLocalTasks((prev) => prev.filter((t) => t.id !== id));
      return;
    }
    await taskApi.delete(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await taskApi.getStats().then(setStats);
  };

  const addSubtask = async (taskId: string, title: string): Promise<void> => {
    if (demoMode) {
      const subtask = { id: crypto.randomUUID(), title, completed: false, createdAt: new Date().toISOString() };
      setLocalTasks((prev) =>
        prev.map((t) => t.id === taskId ? { ...t, subtasks: [...t.subtasks, subtask] } : t)
      );
      return;
    }
    const task = await taskApi.addSubtask(taskId, title);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? task : t)));
  };

  const toggleSubtask = async (taskId: string, subtaskId: string): Promise<void> => {
    if (demoMode) {
      setLocalTasks((prev) =>
        prev.map((t) =>
          t.id !== taskId ? t : {
            ...t,
            subtasks: t.subtasks.map((s) => s.id === subtaskId ? { ...s, completed: !s.completed } : s),
          }
        )
      );
      return;
    }
    const task = await taskApi.toggleSubtask(taskId, subtaskId);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? task : t)));
  };

  const deleteSubtask = async (taskId: string, subtaskId: string): Promise<void> => {
    if (demoMode) {
      setLocalTasks((prev) =>
        prev.map((t) =>
          t.id !== taskId ? t : { ...t, subtasks: t.subtasks.filter((s) => s.id !== subtaskId) }
        )
      );
      return;
    }
    const task = await taskApi.deleteSubtask(taskId, subtaskId);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? task : t)));
  };

  // Keep stats in sync with localTasks when in demo mode
  useEffect(() => {
    if (demoMode) {
      setStats(computeStats(localTasks));
    }
  }, [demoMode, localTasks]);

  return {
    tasks,
    stats,
    loading,
    error,
    demoMode,
    refetch: fetchTasks,
    createTask,
    updateTask,
    updateStatus,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
  };
};
