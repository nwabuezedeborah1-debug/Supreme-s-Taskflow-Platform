import React, { useState, useEffect } from 'react';
import { Plus, X, Tag } from 'lucide-react';
import type { Task, CreateTaskDTO, UpdateTaskDTO, Priority, Status, Category } from '../../types.ts';
import { Input, Select, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: CreateTaskDTO | UpdateTaskDTO) => Promise<void>;
  onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    status: task?.status || 'todo',
    category: task?.category || 'work',
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    assignee: task?.assignee || '',
    tags: task?.tags || [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        category: task.category,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        assignee: task.assignee || '',
        tags: task.tags,
      });
    }
  }, [task]);

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag))
      setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    setTagInput('');
  };

  const removeTag = (tag: string) =>
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setLoading(true);
    setError('');
    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority as Priority,
        status: form.status as Status,
        category: form.category as Category,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        assignee: form.assignee.trim() || null,
        tags: form.tags,
      });
      // If onSubmit resolves without throwing, we're done — parent will close the modal
    } catch (err) {
      console.error('TaskForm submit error:', err);
      // Only show error if parent explicitly threw — not for API fallbacks
      setError('Could not save task. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <Input
        label="Task Title *"
        placeholder="What needs to be done?"
        value={form.title}
        onChange={(e) => set('title', e.target.value)}
        autoFocus
      />

      <Textarea
        label="Description"
        placeholder="Add more details..."
        value={form.description}
        onChange={(e) => set('description', e.target.value)}
        rows={3}
      />

      {/* Priority + Status — side by side on all sizes */}
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Priority"
          value={form.priority}
          onChange={(e) => set('priority', e.target.value)}
          options={[
            { value: 'low',    label: '⬇ Low' },
            { value: 'medium', label: '➡ Medium' },
            { value: 'high',   label: '⬆ High' },
            { value: 'urgent', label: '🔥 Urgent' },
          ]}
        />
        <Select
          label="Status"
          value={form.status}
          onChange={(e) => set('status', e.target.value)}
          options={[
            { value: 'todo',        label: 'To Do' },
            { value: 'in-progress', label: 'In Progress' },
            { value: 'review',      label: 'Review' },
            { value: 'done',        label: 'Done' },
          ]}
        />
      </div>

      {/* Category + Due Date */}
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Category"
          value={form.category}
          onChange={(e) => set('category', e.target.value)}
          options={[
            { value: 'work',     label: '💼 Work' },
            { value: 'personal', label: '👤 Personal' },
            { value: 'shopping', label: '🛒 Shopping' },
            { value: 'health',   label: '❤️ Health' },
            { value: 'finance',  label: '💰 Finance' },
            { value: 'other',    label: '📌 Other' },
          ]}
        />
        <Input
          label="Due Date"
          type="date"
          value={form.dueDate}
          onChange={(e) => set('dueDate', e.target.value)}
        />
      </div>

      <Input
        label="Assignee"
        placeholder="Who is responsible?"
        value={form.assignee}
        onChange={(e) => set('assignee', e.target.value)}
      />

      {/* Tags */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Tags</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Type and press Enter..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              className="w-full bg-[#0a0a0f] border border-[#2a2a38] text-gray-200 placeholder-gray-600 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4169e1]/50 focus:border-[#4169e1] transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={addTag}
            className="px-3 py-2 bg-[#1a1a24] border border-[#2a2a38] rounded-xl text-gray-300 hover:bg-[#2a2a38] transition-colors text-sm"
          >
            <Plus size={16} />
          </button>
        </div>
        {form.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#4169e1]/10 text-[#4169e1] text-xs rounded-full border border-[#4169e1]/20"
              >
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="text-[#4169e1]/60 hover:text-[#4169e1]">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions — sticky on mobile */}
      <div className="flex gap-3 pt-2 sticky bottom-0 bg-[#111118] pb-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 bg-[#1a1a24] border border-[#2a2a38] hover:bg-[#2a2a38] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-black bg-[#f5c518] hover:bg-[#e5b608] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
          {task ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};
