import React, { useState } from 'react';
import {
  Clock, User, Tag, CheckCircle2, Circle, Trash2, Plus, AlertCircle
} from 'lucide-react';
import type { Task, Status } from '../../types.ts';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  priorityConfig, statusConfig, categoryConfig,
  isOverdue, formatDueDate, getSubtaskProgress
} from '../../utils/helpers';

interface TaskDetailProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: Status) => void;
  onAddSubtask: (title: string) => Promise<void>;
  onToggleSubtask: (subtaskId: string) => Promise<void>;
  onDeleteSubtask: (subtaskId: string) => Promise<void>;
}

export const TaskDetail: React.FC<TaskDetailProps> = ({
  task, onEdit, onDelete, onStatusChange,
  onAddSubtask, onToggleSubtask, onDeleteSubtask,
}) => {
  const [subtaskInput, setSubtaskInput] = useState('');
  const [addingSubtask, setAddingSubtask] = useState(false);

  const overdue = isOverdue(task.dueDate, task.status);
  const progress = getSubtaskProgress(task.subtasks);
  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];
  const category = categoryConfig[task.category];

  const statusOptions: Status[] = ['todo', 'in-progress', 'review', 'done'];

  const handleAddSubtask = async () => {
    if (!subtaskInput.trim()) return;
    setAddingSubtask(true);
    try {
      await onAddSubtask(subtaskInput.trim());
      setSubtaskInput('');
    } finally {
      setAddingSubtask(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & badges */}
      <div>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge className={`${priority.bg} ${priority.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
            {priority.label} Priority
          </Badge>
          <Badge className="bg-[#1a1a24] text-gray-400">
            {category.icon} {category.label}
          </Badge>
          {overdue && (
            <Badge className="bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertCircle size={11} /> Overdue
            </Badge>
          )}
        </div>
        <h3 className={`text-xl font-bold text-white leading-snug ${task.status === 'done' ? 'line-through text-gray-500' : ''}`}>
          {task.title}
        </h3>
        {task.description && (
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">{task.description}</p>
        )}
      </div>

      {/* Status selector */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</p>
        <div className="flex gap-2 flex-wrap">
          {statusOptions.map((s) => {
            const cfg = statusConfig[s];
            return (
              <button
                key={s}
                onClick={() => onStatusChange(s)}
                className={`
                  px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150
                  ${task.status === s ? `${cfg.bg} ${cfg.color} ${cfg.border} ring-1 ring-offset-1 ring-offset-[#111118] ring-current` : 'bg-[#1a1a24] text-gray-500 border-[#2a2a38] hover:text-gray-300'}
                `}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Meta info */}
      <div className="grid grid-cols-2 gap-4">
        {task.dueDate && (
          <MetaField icon={<Clock size={14} />} label="Due Date">
            <span className={overdue ? 'text-red-400' : 'text-gray-300'}>
              {formatDueDate(task.dueDate)}
              <span className="block text-xs text-gray-500 mt-0.5">
                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </span>
          </MetaField>
        )}
        {task.assignee && (
          <MetaField icon={<User size={14} />} label="Assignee">
            <span className="text-gray-300">{task.assignee}</span>
          </MetaField>
        )}
        <MetaField icon={<Clock size={14} />} label="Created">
          <span className="text-gray-400 text-xs">
            {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </MetaField>
        <MetaField icon={<Clock size={14} />} label="Updated">
          <span className="text-gray-400 text-xs">
            {new Date(task.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </MetaField>
      </div>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Tag size={12} /> Tags
          </p>
          <div className="flex flex-wrap gap-2">
            {task.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-[#4169e1]/10 text-[#4169e1] text-xs rounded-full border border-[#4169e1]/20">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Subtasks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Subtasks ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})
          </p>
          {task.subtasks.length > 0 && (
            <span className="text-xs text-gray-500">{progress}%</span>
          )}
        </div>

        {/* Progress bar */}
        {task.subtasks.length > 0 && (
          <div className="h-1.5 bg-[#2a2a38] rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-[#4169e1]'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="space-y-2 mb-3">
          {task.subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className="flex items-center gap-3 p-2.5 bg-[#0a0a0f] rounded-xl border border-[#1e1e2e] group/sub"
            >
              <button
                onClick={() => onToggleSubtask(subtask.id)}
                className={`flex-shrink-0 transition-colors ${subtask.completed ? 'text-green-400' : 'text-gray-600 hover:text-gray-400'}`}
              >
                {subtask.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
              </button>
              <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-gray-600' : 'text-gray-300'}`}>
                {subtask.title}
              </span>
              <button
                onClick={() => onDeleteSubtask(subtask.id)}
                className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover/sub:opacity-100"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        {/* Add subtask */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a subtask..."
            value={subtaskInput}
            onChange={(e) => setSubtaskInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubtask(); }}
            className="flex-1 bg-[#0a0a0f] border border-[#2a2a38] text-gray-300 placeholder-gray-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4169e1]/40 focus:border-[#4169e1] transition-colors"
          />
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus size={14} />}
            loading={addingSubtask}
            onClick={handleAddSubtask}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t border-[#2a2a38]">
        <Button variant="danger" size="md" icon={<Trash2 size={14} />} onClick={onDelete} className="flex-1">
          Delete Task
        </Button>
        <Button variant="yellow" size="md" onClick={onEdit} className="flex-1">
          Edit Task
        </Button>
      </div>
    </div>
  );
};

const MetaField: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({ icon, label, children }) => (
  <div className="bg-[#0a0a0f] rounded-xl p-3 border border-[#1e1e2e]">
    <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
      {icon}
      <span className="uppercase tracking-wider font-medium">{label}</span>
    </div>
    <div className="text-sm">{children}</div>
  </div>
);
