import { useState, useEffect, useCallback } from 'react';
import type { Task, TaskStats, CreateTaskDTO, UpdateTaskDTO, FilterState } from '../types.ts';
import { taskApi } from '../api/taskApi';

export const useTasks = (filters: FilterState) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch {
      setError('Failed to fetch tasks. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (payload: CreateTaskDTO): Promise<Task> => {
    const task = await taskApi.create(payload);
    await fetchTasks();
    return task;
  };

  const updateTask = async (id: string, payload: UpdateTaskDTO): Promise<Task> => {
    const task = await taskApi.update(id, payload);
    setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    await taskApi.getStats().then(setStats);
    return task;
  };

  const updateStatus = async (id: string, status: string): Promise<void> => {
    const task = await taskApi.updateStatus(id, status);
    setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    await taskApi.getStats().then(setStats);
  };

  const deleteTask = async (id: string): Promise<void> => {
    await taskApi.delete(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await taskApi.getStats().then(setStats);
  };

  const addSubtask = async (taskId: string, title: string): Promise<void> => {
    const task = await taskApi.addSubtask(taskId, title);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? task : t)));
  };

  const toggleSubtask = async (taskId: string, subtaskId: string): Promise<void> => {
    const task = await taskApi.toggleSubtask(taskId, subtaskId);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? task : t)));
  };

  const deleteSubtask = async (taskId: string, subtaskId: string): Promise<void> => {
    const task = await taskApi.deleteSubtask(taskId, subtaskId);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? task : t)));
  };

  return {
    tasks,
    stats,
    loading,
    error,
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
