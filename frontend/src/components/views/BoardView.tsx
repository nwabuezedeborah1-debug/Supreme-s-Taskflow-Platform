import React from 'react';
import type { Task, Status } from '../../types.ts';
import { TaskCard } from '../tasks/TaskCard';
import { statusConfig } from '../../utils/helpers';
import { Plus } from 'lucide-react';

interface BoardViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Status) => void;
  onView: (task: Task) => void;
  onNewTask: (defaultStatus?: Status) => void;
}

const columns: { status: Status; color: string }[] = [
  { status: 'todo',        color: 'border-t-gray-600' },
  { status: 'in-progress', color: 'border-t-blue-600' },
  { status: 'review',      color: 'border-t-yellow-600' },
  { status: 'done',        color: 'border-t-green-600' },
];

export const BoardView: React.FC<BoardViewProps> = ({
  tasks, onEdit, onDelete, onStatusChange, onView, onNewTask
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 h-full">
      {columns.map(({ status, color }) => {
        const columnTasks = tasks.filter((t) => t.status === status);
        const cfg = statusConfig[status];
        return (
          <div key={status} className="flex flex-col min-h-0">
            {/* Column header */}
            <div className={`bg-[#111118] border border-[#2a2a38] border-t-2 ${color} rounded-t-xl px-4 py-3 flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{cfg.label}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                  {columnTasks.length}
                </span>
              </div>
              <button
                onClick={() => onNewTask(status)}
                className="p-1 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-[#2a2a38] transition-colors"
                aria-label={`Add task to ${cfg.label}`}
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Task list */}
            <div className="flex-1 bg-[#0d0d15] border-x border-b border-[#2a2a38] rounded-b-xl p-3 space-y-3 overflow-y-auto min-h-[200px]">
              {columnTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 text-gray-700 text-xs text-center">
                  <span className="text-2xl mb-1">🗂</span>
                  <span>No tasks here</span>
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                    onView={onView}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
