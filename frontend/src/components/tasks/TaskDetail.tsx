import React, { useState } from 'react';
import { Clock, User, Tag, CheckCircle2, Circle, Trash2, Plus, AlertCircle, Edit2 } from 'lucide-react';
import type { Task, Status } from '../../types.ts';
import { Badge } from '../ui/Badge';
import { priorityConfig, statusConfig, categoryConfig, isOverdue, formatDueDate, getSubtaskProgress } from '../../utils/helpers';

interface TaskDetailProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: Status) => void;
  onAddSubtask: (title: string) => Promise<void>;
  onToggleSubtask: (subtaskId: string) => Promise<void>;
  onDeleteSubtask: (subtaskId: string) => Promise<void>;
}

const STATUS_OPTIONS: Status[] = ['todo', 'in-progress', 'review', 'done'];

export const TaskDetail: React.FC<TaskDetailProps> = ({
  task, onEdit, onDelete, onStatusChange,
  onAddSubtask, onToggleSubtask, onDeleteSubtask,
}) => {
  const [subtaskInput, setSubtaskInput] = useState('');
  const [addingSubtask, setAddingSubtask] = useState(false);

  const overdue  = isOverdue(task.dueDate, task.status);
  const progress = getSubtaskProgress(task.subtasks);
  const priority = priorityConfig[task.priority];
  const category = categoryConfig[task.category];

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
    <div className="space-y-5">

      {/* Badges + title */}
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
        <h3 className={`text-lg font-bold text-white leading-snug ${task.status === 'done' ? 'line-through text-gray-500' : ''}`}>
          {task.title}
        </h3>
        {task.description && (
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">{task.description}</p>
        )}
      </div>

      {/* Status pills — horizontally scrollable on tiny screens */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Change Status</p>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {STATUS_OPTIONS.map((s) => {
            const cfg = statusConfig[s];
            const active = task.status === s;
            return (
              <button
                key={s}
                onClick={() => onStatusChange(s)}
                className={`
                  flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
                  ${active ? `${cfg.bg} ${cfg.color} ${cfg.border} ring-2 ring-offset-1 ring-offset-[#111118] ring-current/50` : 'bg-[#1a1a24] text-gray-500 border-[#2a2a38] hover:text-gray-300 active:bg-[#2a2a38]'}
                `}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Meta grid — 2 col, auto-fills */}
      <div className="grid grid-cols-2 gap-3">
        {task.dueDate && (
          <MetaField icon={<Clock size={13} />} label="Due Date">
            <span className={`text-sm font-medium ${overdue ? 'text-red-400' : 'text-gray-300'}`}>
              {formatDueDate(task.dueDate)}
            </span>
            <span className="block text-xs text-gray-600 mt-0.5">
              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </MetaField>
        )}
        {task.assignee && (
          <MetaField icon={<User size={13} />} label="Assignee">
            <span className="text-sm text-gray-300 break-words">{task.assignee}</span>
          </MetaField>
        )}
        <MetaField icon={<Clock size={13} />} label="Created">
          <span className="text-xs text-gray-500">
            {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </MetaField>
        <MetaField icon={<Clock size={13} />} label="Updated">
          <span className="text-xs text-gray-500">
            {new Date(task.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </MetaField>
      </div>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Tag size={11} /> Tags
          </p>
          <div className="flex flex-wrap gap-2">
            {task.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 bg-[#4169e1]/10 text-[#4169e1] text-xs rounded-full border border-[#4169e1]/20">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Subtasks */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Subtasks ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})
          </p>
          {task.subtasks.length > 0 && <span className="text-xs text-gray-500">{progress}%</span>}
        </div>

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
            <div key={subtask.id} className="flex items-center gap-3 p-3 bg-[#0a0a0f] rounded-xl border border-[#1e1e2e] group/sub">
              <button
                onClick={() => onToggleSubtask(subtask.id)}
                className={`flex-shrink-0 transition-colors tap-target flex items-center justify-center
                  ${subtask.completed ? 'text-green-400' : 'text-gray-600 hover:text-gray-400'}`}
              >
                {subtask.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              </button>
              <span className={`flex-1 text-sm leading-snug ${subtask.completed ? 'line-through text-gray-600' : 'text-gray-300'}`}>
                {subtask.title}
              </span>
              <button
                onClick={() => onDeleteSubtask(subtask.id)}
                className="text-gray-600 hover:text-red-400 transition-colors p-1 opacity-100 sm:opacity-0 sm:group-hover/sub:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Add subtask input */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a subtask..."
            value={subtaskInput}
            onChange={(e) => setSubtaskInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubtask(); }}
            className="flex-1 bg-[#0a0a0f] border border-[#2a2a38] text-gray-300 placeholder-gray-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4169e1]/40 focus:border-[#4169e1] transition-colors"
          />
          <button
            onClick={handleAddSubtask}
            disabled={addingSubtask}
            className="px-3 py-2 bg-[#1a1a24] border border-[#2a2a38] rounded-xl text-gray-300 hover:bg-[#2a2a38] transition-colors disabled:opacity-50"
          >
            {addingSubtask
              ? <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin block" />
              : <Plus size={16} />
            }
          </button>
        </div>
      </div>

      {/* Action buttons — full width, side by side */}
      <div className="flex gap-3 pt-2 border-t border-[#2a2a38] sticky bottom-0 bg-[#111118] pb-1">
        <button
          onClick={onDelete}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 active:bg-red-500/30 transition-colors"
        >
          <Trash2 size={15} /> Delete
        </button>
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-black bg-[#f5c518] hover:bg-[#e5b608] active:bg-[#d4a707] transition-colors"
        >
          <Edit2 size={15} /> Edit Task
        </button>
      </div>
    </div>
  );
};

const MetaField: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({ icon, label, children }) => (
  <div className="bg-[#0a0a0f] rounded-xl p-3 border border-[#1e1e2e]">
    <div className="flex items-center gap-1.5 text-gray-600 text-xs mb-1.5">
      {icon}
      <span className="uppercase tracking-wider font-semibold">{label}</span>
    </div>
    <div>{children}</div>
  </div>
);
