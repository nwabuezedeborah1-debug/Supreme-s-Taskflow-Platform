import { useState, useEffect, useRef, useCallback } from 'react';
import type { Task, TaskStats, CreateTaskDTO, UpdateTaskDTO, FilterState } from '../types.ts';
import { taskApi } from '../api/taskApi';
import { demoTasks } from '../data/demoTasks.ts';

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

const applyFilters = (all: Task[], filters: FilterState): Task[] => {
  let result = [...all];
  if (filters.status !== 'all') result = result.filter((t) => t.status === filters.status);
  if (filters.priority !== 'all') result = result.filter((t) => t.priority === filters.priority);
  if (filters.category !== 'all') result = result.filter((t) => t.category === filters.category);
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }
  const field = filters.sortBy as keyof Task;
  const dir = filters.order === 'asc' ? 1 : -1;
  result.sort((a, b) => {
    const av = String((a[field] as string) ?? '');
    const bv = String((b[field] as string) ?? '');
    return av < bv ? -dir : av > bv ? dir : 0;
  });
  return result;
};

export const useTasks = (filters: FilterState) => {
  // ── mode flag — set once, never oscillates
  const [demoMode, setDemoMode] = useState(false);
  const demoModeRef = useRef(false);

  // ── raw unfiltered local store (demo mode)
  const [localTasks, setLocalTasks] = useState<Task[]>(demoTasks);

  // ── displayed tasks & stats (derived from either API or local)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── initial API fetch — runs once on mount
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([taskApi.getAll(), taskApi.getStats()])
      .then(([taskData, statsData]) => {
        if (cancelled) return;
        setDemoMode(false);
        demoModeRef.current = false;
        setLocalTasks(taskData); // store API data as the local source too
        setStats(statsData);
      })
      .catch(() => {
        if (cancelled) return;
        setDemoMode(true);
        demoModeRef.current = true;
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── re-derive displayed tasks whenever localTasks or filters change
  useEffect(() => {
    setTasks(applyFilters(localTasks, filters));
  }, [localTasks, filters]);

  // ── keep stats in sync with local tasks
  useEffect(() => {
    setStats(computeStats(localTasks));
  }, [localTasks]);

  const refetch = useCallback(async () => {
    if (demoModeRef.current) return; // no backend — skip
    setLoading(true);
    try {
      const [taskData, statsData] = await Promise.all([taskApi.getAll(), taskApi.getStats()]);
      setLocalTasks(taskData);
      setStats(statsData);
      setError(null);
    } catch {
      setError('Failed to refresh tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────
  // CRUD — work on localTasks directly (both modes)
  // ─────────────────────────────────────────────

  const createTask = useCallback(async (payload: CreateTaskDTO): Promise<Task> => {
    const now = new Date().toISOString();
    const localTask: Task = {
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

    if (demoModeRef.current) {
      setLocalTasks((prev) => [localTask, ...prev]);
      return localTask;
    }

    try {
      const task = await taskApi.create(payload);
      setLocalTasks((prev) => [task, ...prev]);
      return task;
    } catch {
      // API failed — fall back to local creation so the user isn't blocked
      setLocalTasks((prev) => [localTask, ...prev]);
      return localTask;
    }
  }, []);

  const updateTask = useCallback(async (id: string, payload: UpdateTaskDTO): Promise<Task> => {
    if (demoModeRef.current) {
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
    try {
      const task = await taskApi.update(id, payload);
      setLocalTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
      return task;
    } catch {
      // Fall back to local update
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
  }, []);

  const updateStatus = useCallback(async (id: string, status: string): Promise<void> => {
    // Optimistic update first
    setLocalTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: status as Task['status'], updatedAt: new Date().toISOString() } : t
      )
    );
    if (!demoModeRef.current) {
      try {
        const task = await taskApi.updateStatus(id, status);
        setLocalTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
      } catch {
        // revert would go here; for now just refetch
        await refetch();
      }
    }
  }, [refetch]);

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    setLocalTasks((prev) => prev.filter((t) => t.id !== id));
    if (!demoModeRef.current) {
      try {
        await taskApi.delete(id);
      } catch {
        await refetch();
      }
    }
  }, [refetch]);

  const addSubtask = useCallback(async (taskId: string, title: string): Promise<void> => {
    if (demoModeRef.current) {
      const subtask = { id: crypto.randomUUID(), title, completed: false, createdAt: new Date().toISOString() };
      setLocalTasks((prev) =>
        prev.map((t) => t.id === taskId ? { ...t, subtasks: [...t.subtasks, subtask] } : t)
      );
      return;
    }
    const task = await taskApi.addSubtask(taskId, title);
    setLocalTasks((prev) => prev.map((t) => (t.id === taskId ? task : t)));
  }, []);

  const toggleSubtask = useCallback(async (taskId: string, subtaskId: string): Promise<void> => {
    // Optimistic
    setLocalTasks((prev) =>
      prev.map((t) =>
        t.id !== taskId ? t : {
          ...t,
          subtasks: t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          ),
        }
      )
    );
    if (!demoModeRef.current) {
      try {
        const task = await taskApi.toggleSubtask(taskId, subtaskId);
        setLocalTasks((prev) => prev.map((t) => (t.id === taskId ? task : t)));
      } catch {
        await refetch();
      }
    }
  }, [refetch]);

  const deleteSubtask = useCallback(async (taskId: string, subtaskId: string): Promise<void> => {
    setLocalTasks((prev) =>
      prev.map((t) =>
        t.id !== taskId ? t : { ...t, subtasks: t.subtasks.filter((s) => s.id !== subtaskId) }
      )
    );
    if (!demoModeRef.current) {
      try {
        await taskApi.deleteSubtask(taskId, subtaskId);
      } catch {
        await refetch();
      }
    }
  }, [refetch]);

  return {
    tasks,
    stats,
    loading,
    error,
    demoMode,
    refetch,
    createTask,
    updateTask,
    updateStatus,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
  };
};
