import React from 'react';
import type { Task, Status } from '../../types.ts';
import {
  Clock, User, Tag, CheckCircle2, Circle, Trash2, Edit2,
  ChevronRight, AlertCircle
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import {
  priorityConfig, statusConfig, categoryConfig,
  isOverdue, formatDueDate, getSubtaskProgress
} from '../../utils/helpers';

interface ListViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Status) => void;
  onView: (task: Task) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  tasks, onEdit, onDelete, onStatusChange, onView
}) => {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-600">
        <span className="text-5xl mb-4">📋</span>
        <h3 className="text-lg font-semibold text-gray-500">No tasks found</h3>
        <p className="text-sm mt-1">Try adjusting your filters or create a new task</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111118] border border-[#2a2a38] rounded-2xl overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-[#2a2a38] bg-[#0d0d15]">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Task</span>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</span>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</span>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</span>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assignee</span>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#1e1e2e]">
        {tasks.map((task) => {
          const overdue = isOverdue(task.dueDate, task.status);
          const priority = priorityConfig[task.priority];
          const status = statusConfig[task.status];
          const category = categoryConfig[task.category];
          const progress = getSubtaskProgress(task.subtasks);

          return (
            <div
              key={task.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center hover:bg-[#1a1a24] transition-colors cursor-pointer group animate-fade-in"
              onClick={() => onView(task)}
            >
              {/* Task info */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs text-gray-500">{category.icon}</span>
                  <span className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-gray-600' : 'text-white'}`}>
                    {task.title}
                  </span>
                  {overdue && <AlertCircle size={13} className="text-red-400 flex-shrink-0" />}
                </div>
                {task.subtasks.length > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1 flex-1 max-w-[80px] bg-[#2a2a38] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-[#4169e1]'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">{progress}%</span>
                  </div>
                )}
                {task.tags.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Tag size={10} className="text-gray-600" />
                    {task.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs text-gray-600">{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Priority */}
              <div>
                <Badge className={`${priority.bg} ${priority.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                  {priority.label}
                </Badge>
              </div>

              {/* Status */}
              <div onClick={(e) => e.stopPropagation()}>
                <select
                  value={task.status}
                  onChange={(e) => onStatusChange(task.id, e.target.value as Status)}
                  className={`text-xs font-medium px-2 py-1.5 rounded-xl border cursor-pointer bg-transparent focus:outline-none ${status.bg} ${status.color} ${status.border}`}
                >
                  <option value="todo" className="bg-[#111118] text-gray-300">To Do</option>
                  <option value="in-progress" className="bg-[#111118] text-gray-300">In Progress</option>
                  <option value="review" className="bg-[#111118] text-gray-300">Review</option>
                  <option value="done" className="bg-[#111118] text-gray-300">Done</option>
                </select>
              </div>

              {/* Due date */}
              <div>
                {task.dueDate ? (
                  <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-400' : 'text-gray-400'}`}>
                    <Clock size={12} />
                    {formatDueDate(task.dueDate)}
                  </span>
                ) : (
                  <span className="text-xs text-gray-700">—</span>
                )}
              </div>

              {/* Assignee */}
              <div>
                {task.assignee ? (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <User size={12} />
                    <span className="truncate max-w-[80px]">{task.assignee}</span>
                  </span>
                ) : (
                  <span className="text-xs text-gray-700">—</span>
                )}
              </div>

              {/* Actions */}
              <div
                className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onView(task)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
                  title="View"
                >
                  <ChevronRight size={15} />
                </button>
                <button
                  onClick={() => onEdit(task)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors"
                  title="Edit"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
