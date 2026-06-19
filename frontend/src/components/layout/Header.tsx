import React, { useState } from 'react';
import { Search, Plus, Bell, Grid3X3, List, Menu, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '../ui/Button';
import type { FilterState } from '../../types.ts';

interface HeaderProps {
  filters: FilterState;
  onFilterChange: (f: Partial<FilterState>) => void;
  onNewTask: () => void;
  viewMode: 'board' | 'list';
  onViewModeChange: (mode: 'board' | 'list') => void;
  activeView: string;
  onMenuOpen: () => void;
}

const titles: Record<string, string> = {
  dashboard: 'Dashboard',
  board: 'Task Board',
  list: 'Task List',
  calendar: 'Calendar',
  tags: 'Tags',
  settings: 'Settings',
};

export const Header: React.FC<HeaderProps> = ({
  filters, onFilterChange, onNewTask, viewMode, onViewModeChange, activeView, onMenuOpen,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      <header className="bg-[#0d0d15]/90 backdrop-blur-sm border-b border-[#1e1e2e] px-4 py-3 sticky top-0 z-30">
        {/* ── Main row ── */}
        <div className="flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <button
            onClick={onMenuOpen}
            className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1a1a24] transition-colors flex-shrink-0"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-white truncate">{titles[activeView] || 'TaskFlow'}</h2>
            <p className="text-xs text-gray-500 hidden sm:block">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Desktop search */}
          <div className="hidden md:flex flex-1 max-w-xs relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="w-full bg-[#111118] border border-[#2a2a38] text-gray-300 placeholder-gray-600 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4169e1]/40 focus:border-[#4169e1] transition-colors"
            />
          </div>

          {/* Desktop filters */}
          <div className="hidden lg:flex items-center gap-2">
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

          {/* View toggle — hidden on mobile */}
          <div className="hidden sm:flex items-center bg-[#111118] border border-[#2a2a38] rounded-xl p-1 gap-1">
            <button
              onClick={() => onViewModeChange('board')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'board' ? 'bg-[#4169e1] text-white' : 'text-gray-500 hover:text-gray-300'}`}
              title="Board view"
            >
              <Grid3X3 size={14} />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#4169e1] text-white' : 'text-gray-500 hover:text-gray-300'}`}
              title="List view"
            >
              <List size={14} />
            </button>
          </div>

          {/* Mobile: search icon */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1a1a24] transition-colors"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          {/* Mobile: filter icon */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1a1a24] transition-colors relative"
            aria-label="Filters"
          >
            <SlidersHorizontal size={18} />
            {(filters.status !== 'all' || filters.priority !== 'all') && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#f5c518] rounded-full" />
            )}
          </button>

          {/* Bell */}
          <button
            className="relative p-2 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-[#1a1a24] transition-colors"
            aria-label="Notifications"
          >
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#f5c518] rounded-full" />
          </button>

          {/* New Task */}
          <Button variant="yellow" size="sm" icon={<Plus size={14} />} onClick={onNewTask}>
            <span className="hidden sm:inline">New Task</span>
          </Button>
        </div>

        {/* ── Mobile search bar (expandable) ── */}
        {showSearch && (
          <div className="mt-3 md:hidden relative animate-slide-up">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search tasks, tags..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              autoFocus
              className="w-full bg-[#111118] border border-[#2a2a38] text-gray-300 placeholder-gray-600 rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4169e1]/40 focus:border-[#4169e1] transition-colors"
            />
            {filters.search && (
              <button
                onClick={() => onFilterChange({ search: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {/* ── Mobile filter panel (expandable) ── */}
        {showFilters && (
          <div className="mt-3 lg:hidden grid grid-cols-2 gap-2 animate-slide-up">
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
            {/* View toggle in filter panel on mobile */}
            <div className="col-span-2 flex items-center gap-2 sm:hidden">
              <span className="text-xs text-gray-500">View:</span>
              <button
                onClick={() => { onViewModeChange('board'); setShowFilters(false); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${viewMode === 'board' ? 'bg-[#4169e1] text-white' : 'bg-[#1a1a24] text-gray-400'}`}
              >
                <Grid3X3 size={12} /> Board
              </button>
              <button
                onClick={() => { onViewModeChange('list'); setShowFilters(false); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${viewMode === 'list' ? 'bg-[#4169e1] text-white' : 'bg-[#1a1a24] text-gray-400'}`}
              >
                <List size={12} /> List
              </button>
            </div>
          </div>
        )}
      </header>
    </>
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
    className="w-full bg-[#111118] border border-[#2a2a38] text-gray-400 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#4169e1]/40 cursor-pointer transition-colors hover:border-[#3a3a48]"
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value} className="bg-[#111118]">
        {opt.label}
      </option>
    ))}
  </select>
);
