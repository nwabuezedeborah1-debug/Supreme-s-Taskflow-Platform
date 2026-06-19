import React, { useState } from 'react';
import {
  Clock, User, Tag, ChevronRight, CheckCircle2, Circle,
  AlertCircle, Trash2, Edit2, MoreVertical, ChevronDown
} from 'lucide-react';
import type { Task, Status } from '../../types.ts';
import { Badge } from '../ui/Badge';
import {
  priorityConfig, statusConfig, categoryConfig,
  isOverdue, formatDueDate, getSubtaskProgress
} from '../../utils/helpers';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Status) => void;
  onView: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task, onEdit, onDelete, onStatusChange, onView
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const overdue = isOverdue(task.dueDate, task.status);
  const dueDateLabel = formatDueDate(task.dueDate);
  const progress = getSubtaskProgress(task.subtasks);
  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];
  const category = categoryConfig[task.category];

  const statusOptions: { value: Status; label: string }[] = [
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'done', label: 'Done' },
  ];

  return (
    <div
      className={`
        group bg-[#111118] border rounded-2xl p-4 transition-all duration-200 cursor-pointer
        hover:border-[#4169e1]/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30
        ${overdue ? 'border-red-500/30' : 'border-[#2a2a38]'}
        ${task.status === 'done' ? 'opacity-70' : ''}
        animate-slide-up
      `}
      onClick={() => onView(task)}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority dot */}
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priority.dot}`} />
          <Badge className={`${priority.bg} ${priority.color}`}>
            {priority.label}
          </Badge>
          <Badge className="bg-[#1a1a24] text-gray-400">
            {category.icon} {category.label}
          </Badge>
        </div>
        {/* Actions */}
        <div
          className="relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-[#2a2a38] transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Task options"
          >
            <MoreVertical size={15} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 bg-[#1a1a24] border border-[#2a2a38] rounded-xl shadow-xl z-20 min-w-[140px] py-1 animate-scale-in">
              <button
                onClick={() => { onView(task); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#2a2a38] hover:text-white transition-colors"
              >
                <ChevronRight size={14} /> View Details
              </button>
              <button
                onClick={() => { onEdit(task); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#2a2a38] hover:text-white transition-colors"
              >
                <Edit2 size={14} /> Edit Task
              </button>
              <hr className="border-[#2a2a38] my-1" />
              <button
                onClick={() => { onDelete(task.id); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className={`text-sm font-semibold text-white mb-1.5 line-clamp-2 leading-snug ${task.status === 'done' ? 'line-through text-gray-500' : ''}`}>
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{task.description}</p>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-[#4169e1]/10 text-[#4169e1] text-xs rounded-full border border-[#4169e1]/20">
              <Tag size={10} /> {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="px-2 py-0.5 bg-[#2a2a38] text-gray-500 text-xs rounded-full">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Subtasks progress */}
      {task.subtasks.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">
              {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtasks
            </span>
            <span className="text-xs text-gray-500">{progress}%</span>
          </div>
          <div className="h-1.5 bg-[#2a2a38] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-[#4169e1]'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1e1e2e]">
        {/* Due date */}
        <div className="flex items-center gap-1.5">
          {task.dueDate && (
            <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-400' : 'text-gray-500'}`}>
              {overdue ? <AlertCircle size={12} /> : <Clock size={12} />}
              {dueDateLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Assignee */}
          {task.assignee && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <User size={11} />
              <span className="max-w-[80px] truncate">{task.assignee.split(' ')[0]}</span>
            </span>
          )}

          {/* Status badge — clickable */}
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setStatusMenuOpen(!statusMenuOpen)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${status.bg} ${status.color} ${status.border}`}
            >
              {task.status === 'done' ? <CheckCircle2 size={11} /> : <Circle size={11} />}
              {status.label}
              <ChevronDown size={10} />
            </button>
            {statusMenuOpen && (
              <div className="absolute right-0 bottom-8 bg-[#1a1a24] border border-[#2a2a38] rounded-xl shadow-xl z-20 min-w-[130px] py-1 animate-scale-in">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { onStatusChange(task.id, opt.value); setStatusMenuOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-[#2a2a38]
                      ${task.status === opt.value ? 'text-[#f5c518]' : 'text-gray-300'}`}
                  >
                    {statusConfig[opt.value].label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
