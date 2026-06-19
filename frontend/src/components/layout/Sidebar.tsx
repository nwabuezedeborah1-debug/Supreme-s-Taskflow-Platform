import React from 'react';
import { LayoutDashboard, CheckSquare, Calendar, Tag, BarChart2, Settings, Zap, X } from 'lucide-react';
import type { TaskStats } from '../../types.ts';

interface SidebarProps {
  stats: TaskStats | null;
  activeView: string;
  onViewChange: (view: string) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'board',     label: 'Board',     icon: CheckSquare },
  { id: 'list',      label: 'List',      icon: BarChart2 },
  { id: 'calendar',  label: 'Calendar',  icon: Calendar },
  { id: 'tags',      label: 'Tags',      icon: Tag },
];

export const Sidebar: React.FC<SidebarProps> = ({
  stats, activeView, onViewChange, mobileOpen, onMobileClose,
}) => {
  const handleNav = (id: string) => {
    onViewChange(id);
    onMobileClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 w-72
          bg-[#0d0d15] border-r border-[#1e1e2e] flex flex-col
          transition-transform duration-300 ease-in-out
          lg:static lg:w-64 lg:translate-x-0 lg:z-auto lg:flex-shrink-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="px-5 py-4 border-b border-[#1e1e2e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#4169e1] rounded-xl flex items-center justify-center shadow-lg shadow-[#4169e1]/20 flex-shrink-0">
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">Supreme's TaskFlow</h1>
              <p className="text-xs text-gray-500">Task Management</p>
            </div>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-[#2a2a38] transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 mb-3">Navigation</p>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${activeView === id
                  ? 'bg-[#4169e1]/15 text-[#4169e1] border border-[#4169e1]/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a24]'
                }
              `}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}

          {/* Stats */}
          {stats && (
            <div className="mt-6">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 mb-3">Overview</p>
              <div className="px-3 space-y-2">
                <StatRow label="Total" value={stats.total} color="text-gray-300" />
                <StatRow label="In Progress" value={stats.inProgress} color="text-blue-400" />
                <StatRow label="Review" value={stats.review} color="text-yellow-400" />
                <StatRow label="Done" value={stats.done} color="text-green-400" />
                {stats.overdue > 0 && (
                  <StatRow label="Overdue" value={stats.overdue} color="text-red-400" />
                )}
              </div>
            </div>
          )}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-[#1e1e2e]">
          <button
            onClick={() => handleNav('settings')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-[#1a1a24] transition-colors"
          >
            <Settings size={17} />
            Settings
          </button>
          <div className="mt-3 px-3 py-2.5 bg-[#4169e1]/10 rounded-xl border border-[#4169e1]/20">
            <p className="text-xs text-[#4169e1] font-medium">Pro Tip</p>
            <p className="text-xs text-gray-500 mt-0.5">Use filters to quickly find tasks</p>
          </div>
        </div>
      </aside>
    </>
  );
};

const StatRow: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-gray-500">{label}</span>
    <span className={`text-xs font-semibold ${color}`}>{value}</span>
  </div>
);
