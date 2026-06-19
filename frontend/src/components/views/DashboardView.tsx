import React from 'react';
import type { Task, TaskStats } from '../../types.ts';
import {
  CheckSquare, Clock, AlertTriangle, TrendingUp,
  Target, Zap, ArrowRight
} from 'lucide-react';
import { priorityConfig, statusConfig, isOverdue, formatDueDate } from '../../utils/helpers';

interface DashboardViewProps {
  stats: TaskStats | null;
  tasks: Task[];
  onViewTask: (task: Task) => void;
  onNewTask: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ stats, tasks, onViewTask, onNewTask }) => {
  const overdueTasks = tasks.filter((t) => isOverdue(t.dueDate, t.status));
  const urgentTasks = tasks.filter((t) => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'done');
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
  const completionRate = stats && stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">

      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-[#1a2c8a] via-[#4169e1]/40 to-[#0d0d15] border border-[#4169e1]/30 rounded-2xl px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-bold text-white leading-tight">
              Good {getGreeting()} 👋
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              <span className="text-[#f5c518] font-semibold">{stats?.inProgress || 0} in progress</span>
              {stats?.overdue ? (
                <> · <span className="text-red-400 font-semibold">{stats.overdue} overdue</span></>
              ) : null}
            </p>
          </div>
          <button
            onClick={onNewTask}
            className="flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 bg-[#f5c518] text-black rounded-xl font-semibold text-xs sm:text-sm hover:bg-[#e5b608] transition-colors flex-shrink-0"
          >
            <Zap size={14} />
            <span className="hidden xs:inline sm:inline">New Task</span>
          </button>
        </div>
      </div>

      {/* Stat cards — 2-col on mobile, 4-col on lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total" value={stats?.total || 0} icon={<CheckSquare size={18} />} color="text-[#4169e1]" bg="bg-[#4169e1]/10" border="border-[#4169e1]/20" />
        <StatCard label="In Progress" value={stats?.inProgress || 0} icon={<TrendingUp size={18} />} color="text-blue-400" bg="bg-blue-400/10" border="border-blue-400/20" />
        <StatCard label="Overdue" value={stats?.overdue || 0} icon={<AlertTriangle size={18} />} color="text-red-400" bg="bg-red-400/10" border="border-red-400/20" highlight={!!stats?.overdue} />
        <StatCard label="Done" value={stats?.done || 0} icon={<Target size={18} />} color="text-green-400" bg="bg-green-400/10" border="border-green-400/20" extra={`${completionRate}%`} />
      </div>

      {/* Progress bar */}
      <div className="bg-[#111118] border border-[#2a2a38] rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Overall Progress</h3>
          <span className="text-sm font-bold text-[#f5c518]">{completionRate}%</span>
        </div>
        <div className="h-2.5 bg-[#1a1a24] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#4169e1] to-[#f5c518] rounded-full transition-all duration-700"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        {/* Status breakdown — scrollable on very small screens */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {(['todo', 'in-progress', 'review', 'done'] as const).map((s) => {
            const cfg = statusConfig[s];
            const count = stats
              ? s === 'in-progress' ? stats.inProgress
              : s === 'todo' ? stats.todo
              : s === 'review' ? stats.review
              : stats.done
              : 0;
            return (
              <div key={s} className={`text-center px-2 py-2 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                <div className={`text-base sm:text-lg font-bold ${cfg.color}`}>{count}</div>
                <div className="text-xs text-gray-600 truncate">{cfg.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* High priority + Overdue — stack on mobile, 2-col on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <div className="bg-[#111118] border border-[#2a2a38] rounded-2xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <AlertTriangle size={14} className="text-[#f5c518]" />
            High Priority
            <span className="ml-auto text-xs text-gray-600">{urgentTasks.length}</span>
          </h3>
          <div className="space-y-1">
            {urgentTasks.slice(0, 4).map((task) => (
              <MiniTaskRow key={task.id} task={task} onClick={() => onViewTask(task)} />
            ))}
            {urgentTasks.length === 0 && <p className="text-xs text-gray-600 py-4 text-center">No high priority tasks 🎉</p>}
          </div>
        </div>

        <div className="bg-[#111118] border border-[#2a2a38] rounded-2xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Clock size={14} className="text-red-400" />
            Overdue
            <span className="ml-auto text-xs text-gray-600">{overdueTasks.length}</span>
          </h3>
          <div className="space-y-1">
            {overdueTasks.slice(0, 4).map((task) => (
              <MiniTaskRow key={task.id} task={task} onClick={() => onViewTask(task)} overdue />
            ))}
            {overdueTasks.length === 0 && <p className="text-xs text-gray-600 py-4 text-center">No overdue tasks 🎉</p>}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-[#111118] border border-[#2a2a38] rounded-2xl p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Recently Updated</h3>
        <div className="space-y-1">
          {recentTasks.map((task) => (
            <MiniTaskRow key={task.id} task={task} onClick={() => onViewTask(task)} showDate />
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  label: string; value: number; icon: React.ReactNode;
  color: string; bg: string; border: string; extra?: string; highlight?: boolean;
}> = ({ label, value, icon, color, bg, border, extra, highlight }) => (
  <div className={`bg-[#111118] border ${border} rounded-2xl p-3 sm:p-4 ${highlight && value > 0 ? 'ring-1 ring-red-500/30' : ''}`}>
    <div className="flex items-center justify-between mb-2 sm:mb-3">
      <div className={`w-8 h-8 sm:w-10 sm:h-10 ${bg} rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      {extra && <span className="text-xs text-gray-600">{extra}</span>}
    </div>
    <div className={`text-xl sm:text-2xl font-bold ${color}`}>{value}</div>
    <div className="text-xs text-gray-500 mt-0.5 truncate">{label}</div>
  </div>
);

const MiniTaskRow: React.FC<{
  task: Task; onClick: () => void; overdue?: boolean; showDate?: boolean;
}> = ({ task, onClick, overdue, showDate }) => {
  const priority = priorityConfig[task.priority];
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-[#1a1a24] active:bg-[#2a2a38] transition-colors text-left group"
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priority.dot}`} />
      <span className={`flex-1 text-sm truncate ${task.status === 'done' ? 'line-through text-gray-600' : 'text-gray-300'}`}>
        {task.title}
      </span>
      {overdue && task.dueDate && (
        <span className="text-xs text-red-400 flex-shrink-0 hidden xs:block">{formatDueDate(task.dueDate)}</span>
      )}
      {showDate && (
        <span className="text-xs text-gray-600 flex-shrink-0">
          {new Date(task.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      )}
      <ArrowRight size={12} className="text-gray-700 group-hover:text-gray-400 transition-colors flex-shrink-0" />
    </button>
  );
};

const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
};
