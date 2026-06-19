import React from 'react';
import { Search, Plus, Bell, Grid3X3, List } from 'lucide-react';
import { Button } from '../ui/Button';
import type { FilterState } from '../../types.ts';

interface HeaderProps {
  filters: FilterState;
  onFilterChange: (f: Partial<FilterState>) => void;
  onNewTask: () => void;
  viewMode: 'board' | 'list';
  onViewModeChange: (mode: 'board' | 'list') => void;
  activeView: string;
}

export const Header: React.FC<HeaderProps> = ({
  filters,
  onFilterChange,
  onNewTask,
  viewMode,
  onViewModeChange,
  activeView,
}) => {
  const titles: Record<string, string> = {
    dashboard: 'Dashboard',
    board: 'Task Board',
    list: 'Task List',
    calendar: 'Calendar',
    tags: 'Tags',
    settings: 'Settings',
  };

  return (
    <header className="bg-[#0d0d15]/90 backdrop-blur-sm border-b border-[#1e1e2e] px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Title */}
        <div className="flex-shrink-0">
          <h2 className="text-lg font-semibold text-white">{titles[activeView] || 'TaskFlow'}</h2>
          <p className="text-xs text-gray-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md relative ml-4">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search tasks, tags..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full bg-[#111118] border border-[#2a2a38] text-gray-300 placeholder-gray-600 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4169e1]/40 focus:border-[#4169e1] transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <FilterSelect
            value={filters.status}
            onChange={(v) => onFilterChange({ status: v as FilterState['status'] })}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'todo', label: 'To Do' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'review', label: 'Review' },
              { value: 'done', label: 'Done' },
            ]}
          />
          <FilterSelect
            value={filters.priority}
            onChange={(v) => onFilterChange({ priority: v as FilterState['priority'] })}
            options={[
              { value: 'all', label: 'All Priority' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ]}
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-[#111118] border border-[#2a2a38] rounded-xl p-1 gap-1">
          <button
            onClick={() => onViewModeChange('board')}
            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'board' ? 'bg-[#4169e1] text-white' : 'text-gray-500 hover:text-gray-300'}`}
            title="Board view"
          >
            <Grid3X3 size={15} />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#4169e1] text-white' : 'text-gray-500 hover:text-gray-300'}`}
            title="List view"
          >
            <List size={15} />
          </button>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-[#1a1a24] transition-colors" aria-label="Notifications">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#f5c518] rounded-full" />
        </button>

        {/* New Task */}
        <Button variant="yellow" size="sm" icon={<Plus size={15} />} onClick={onNewTask}>
          New Task
        </Button>
      </div>
    </header>
  );
};

const FilterSelect: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}> = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="bg-[#111118] border border-[#2a2a38] text-gray-400 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#4169e1]/40 cursor-pointer transition-colors hover:border-[#3a3a48]"
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value} className="bg-[#111118]">
        {opt.label}
      </option>
    ))}
  </select>
);
