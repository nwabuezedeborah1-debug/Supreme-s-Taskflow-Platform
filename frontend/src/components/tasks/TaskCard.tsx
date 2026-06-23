import React, { useState, useEffect, useRef } from 'react';
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

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'todo',        label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review',      label: 'Review' },
  { value: 'done',        label: 'Done' },
];

export const TaskCard: React.FC<TaskCardProps> = ({
  task, onEdit, onDelete, onStatusChange, onView
}) => {
  const [menuOpen,       setMenuOpen]       = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const menuRef   = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen && !statusMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuOpen       && menuRef.current   && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
      if (statusMenuOpen && statusRef.current && !statusRef.current.contains(e.target as Node))
        setStatusMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen, statusMenuOpen]);

  const overdue      = isOverdue(task.dueDate, task.status);
  const dueDateLabel = formatDueDate(task.dueDate);
  const progress     = getSubtaskProgress(task.subtasks);
  const priority     = priorityConfig[task.priority];
  const status       = statusConfig[task.status];
  const category     = categoryConfig[task.category];

  return (
    <div
      onClick={() => onView(task)}
      className={`
        group bg-[#111118] border rounded-2xl p-4 cursor-pointer
        transition-all duration-200
        hover:border-[#4169e1]/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30
        active:translate-y-0 active:shadow-none
        ${overdue ? 'border-red-500/30' : 'border-[#2a2a38]'}
        ${task.status === 'done' ? 'opacity-70' : ''}
        animate-slide-up
      `}
    >
      {/* ── Top row ── */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <span className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${priority.dot}`} />
          <Badge className={`${priority.bg} ${priority.color}`}>{priority.label}</Badge>
          <Badge className="bg-[#1a1a24] text-gray-400">{category.icon} {category.label}</Badge>
        </div>

        {/* ⋮ Context menu */}
        <div
          ref={menuRef}
          className="relative shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => { setMenuOpen(o => !o); setStatusMenuOpen(false); }}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-[#2a2a38] active:bg-[#3a3a48] transition-colors"
            aria-label="Task options"
          >
            <MoreVertical size={15} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-9 w-40 py-1 bg-[#1a1a24] border border-[#2a2a38] rounded-xl shadow-2xl animate-scale-in"
              style={{ zIndex: 500 }}
            >
              <Btn onClick={() => { onView(task); setMenuOpen(false); }} icon={<ChevronRight size={14} />}>
                View Details
              </Btn>
              <Btn onClick={() => { onEdit(task); setMenuOpen(false); }} icon={<Edit2 size={14} />}>
                Edit Task
              </Btn>
              <hr className="border-[#2a2a38] my-1" />
              <Btn onClick={() => { onDelete(task.id); setMenuOpen(false); }} icon={<Trash2 size={14} />} danger>
                Delete
              </Btn>
            </div>
          )}
        </div>
      </div>

      {/* ── Title ── */}
      <h3 className={`text-sm font-semibold mb-1.5 line-clamp-2 leading-snug
        ${task.status === 'done' ? 'line-through text-gray-500' : 'text-white'}`}>
        {task.title}
      </h3>

      {/* ── Description ── */}
      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* ── Tags ── */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-[#4169e1]/10 text-[#4169e1] text-xs rounded-full border border-[#4169e1]/20">
              <Tag size={9} /> {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="px-2 py-0.5 bg-[#2a2a38] text-gray-500 text-xs rounded-full">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* ── Subtask progress ── */}
      {task.subtasks.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">
              {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks
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

      {/* ── Footer ── */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1e1e2e] gap-2">
        {/* Due date */}
        {task.dueDate && (
          <span className={`flex items-center gap-1 text-xs truncate ${overdue ? 'text-red-400' : 'text-gray-500'}`}>
            {overdue
              ? <AlertCircle size={11} className="shrink-0" />
              : <Clock size={11} className="shrink-0" />}
            {dueDateLabel}
          </span>
        )}

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {task.assignee && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
              <User size={11} />
              <span className="max-w-[72px] truncate">{task.assignee.split(' ')[0]}</span>
            </span>
          )}

          {/* Status picker */}
          <div
            ref={statusRef}
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => { setStatusMenuOpen(o => !o); setMenuOpen(false); }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition-colors
                ${status.bg} ${status.color} ${status.border}`}
            >
              {task.status === 'done' ? <CheckCircle2 size={11} /> : <Circle size={11} />}
              <span className="hidden sm:inline">{status.label}</span>
              <ChevronDown size={10} />
            </button>

            {statusMenuOpen && (
              <div
                className="absolute right-0 bottom-9 w-36 py-1 bg-[#1a1a24] border border-[#2a2a38] rounded-xl shadow-2xl animate-scale-in"
                style={{ zIndex: 500 }}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { onStatusChange(task.id, opt.value); setStatusMenuOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-[#2a2a38] transition-colors
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

const Btn: React.FC<{
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}> = ({ icon, children, onClick, danger }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors
      ${danger
        ? 'text-red-400 hover:bg-red-500/10 active:bg-red-500/20'
        : 'text-gray-300 hover:bg-[#2a2a38] hover:text-white active:bg-[#3a3a48]'
      }`}
  >
    {icon} {children}
  </button>
);
