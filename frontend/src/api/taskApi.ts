import axios from 'axios';
import type { Task, TaskStats, CreateTaskDTO, UpdateTaskDTO } from '../types.ts';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const taskApi = {
  getAll: async (params?: Record<string, string>): Promise<Task[]> => {
    const { data } = await api.get<ApiResponse<Task[]>>('/tasks', { params });
    return data.data || [];
  },

  getById: async (id: string): Promise<Task> => {
    const { data } = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return data.data!;
  },

  getStats: async (): Promise<TaskStats> => {
    const { data } = await api.get<ApiResponse<TaskStats>>('/tasks/stats');
    return data.data!;
  },

  create: async (payload: CreateTaskDTO): Promise<Task> => {
    const { data } = await api.post<ApiResponse<Task>>('/tasks', payload);
    return data.data!;
  },

  update: async (id: string, payload: UpdateTaskDTO): Promise<Task> => {
    const { data } = await api.put<ApiResponse<Task>>(`/tasks/${id}`, payload);
    return data.data!;
  },

  updateStatus: async (id: string, status: string): Promise<Task> => {
    const { data } = await api.patch<ApiResponse<Task>>(`/tasks/${id}/status`, { status });
    return data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  addSubtask: async (taskId: string, title: string): Promise<Task> => {
    const { data } = await api.post<ApiResponse<Task>>(`/tasks/${taskId}/subtasks`, { title });
    return data.data!;
  },

  toggleSubtask: async (taskId: string, subtaskId: string): Promise<Task> => {
    const { data } = await api.patch<ApiResponse<Task>>(`/tasks/${taskId}/subtasks/${subtaskId}`);
    return data.data!;
  },

  deleteSubtask: async (taskId: string, subtaskId: string): Promise<Task> => {
    const { data } = await api.delete<ApiResponse<Task>>(`/tasks/${taskId}/subtasks/${subtaskId}`);
    return data.data!;
  },
};
