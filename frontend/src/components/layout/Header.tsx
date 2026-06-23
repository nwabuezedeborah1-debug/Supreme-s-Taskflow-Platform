import React, { useState } from 'react';
import { Search, Plus, Bell, Grid3X3, List, Menu, SlidersHorizontal, X } from 'lucide-react';
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

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  board:     'Task Board',
  list:      'Task List',
  calendar:  'Calendar',
  tags:      'Tags',
  settings:  'Settings',
};

export const Header: React.FC<HeaderProps> = ({
  filters, onFilterChange, onNewTask, viewMode, onViewModeChange, activeView, onMenuOpen,
}) => {
  const [showSearch,  setShowSearch]  = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilter = filters.status !== 'all' || filters.priority !== 'all';

  return (
    <header
      className="bg-[#0d0d15] border-b border-[#1e1e2e] px-4 py-3 shrink-0"
      style={{ position: 'sticky', top: 0, zIndex: 200 }}
    >
      {/* ── Main row ── */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Hamburger — mobile only */}
        <button
          type="button"
          onClick={onMenuOpen}
          className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1a1a24] active:bg-[#2a2a38] transition-colors shrink-0"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-white truncate">
            {PAGE_TITLES[activeView] || "Supreme's TaskFlow"}
          </h2>
          <p className="text-xs text-gray-500 hidden sm:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Desktop search */}
        <div className="hidden md:flex flex-1 max-w-xs relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full bg-[#111118] border border-[#2a2a38] text-gray-300 placeholder-gray-600 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4169e1]/40 focus:border-[#4169e1] transition-colors"
          />
        </div>

        {/* Desktop status + priority filters */}
        <div className="hidden lg:flex items-center gap-2">
          <FilterSelect
            value={filters.status}
            onChange={(v) => onFilterChange({ status: v as FilterState['status'] })}
            options={[
              { value: 'all',         label: 'All Status' },
              { value: 'todo',        label: 'To Do' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'review',      label: 'Review' },
              { value: 'done',        label: 'Done' },
            ]}
          />
          <FilterSelect
            value={filters.priority}
            onChange={(v) => onFilterChange({ priority: v as FilterState['priority'] })}
            options={[
              { value: 'all',    label: 'All Priority' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'high',   label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low',    label: 'Low' },
            ]}
          />
        </div>

        {/* View toggle — sm+ */}
        <div className="hidden sm:flex items-center bg-[#111118] border border-[#2a2a38] rounded-xl p-1 gap-1">
          <button
            type="button"
            onClick={() => onViewModeChange('board')}
            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'board' ? 'bg-[#4169e1] text-white' : 'text-gray-500 hover:text-gray-300'}`}
            title="Board view"
          >
            <Grid3X3 size={14} />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#4169e1] text-white' : 'text-gray-500 hover:text-gray-300'}`}
            title="List view"
          >
            <List size={14} />
          </button>
        </div>

        {/* Mobile search toggle */}
        <button
          type="button"
          onClick={() => setShowSearch(s => !s)}
          className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1a1a24] active:bg-[#2a2a38] transition-colors"
          aria-label="Toggle search"
        >
          <Search size={18} />
        </button>

        {/* Mobile filter toggle */}
        <button
          type="button"
          onClick={() => setShowFilters(f => !f)}
          className="lg:hidden relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1a1a24] active:bg-[#2a2a38] transition-colors"
          aria-label="Toggle filters"
        >
          <SlidersHorizontal size={18} />
          {hasActiveFilter && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#f5c518] rounded-full pointer-events-none" />
          )}
        </button>

        {/* Notification bell */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1a1a24] active:bg-[#2a2a38] transition-colors"
          aria-label="Notifications"
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#f5c518] rounded-full pointer-events-none" />
        </button>

        {/* New Task — primary CTA */}
        <button
          type="button"
          onClick={onNewTask}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#f5c518] hover:bg-[#e5b608] active:bg-[#d4a707] text-black text-xs font-semibold rounded-lg transition-colors shrink-0"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">New Task</span>
        </button>
      </div>

      {/* ── Expandable search (mobile) ── */}
      {showSearch && (
        <div className="mt-3 md:hidden relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
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
              type="button"
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* ── Expandable filters (mobile) ── */}
      {showFilters && (
        <div className="mt-3 lg:hidden space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <FilterSelect
              value={filters.status}
              onChange={(v) => onFilterChange({ status: v as FilterState['status'] })}
              options={[
                { value: 'all',         label: 'All Status' },
                { value: 'todo',        label: 'To Do' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'review',      label: 'Review' },
                { value: 'done',        label: 'Done' },
              ]}
            />
            <FilterSelect
              value={filters.priority}
              onChange={(v) => onFilterChange({ priority: v as FilterState['priority'] })}
              options={[
                { value: 'all',    label: 'All Priority' },
                { value: 'urgent', label: 'Urgent' },
                { value: 'high',   label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low',    label: 'Low' },
              ]}
            />
          </div>
          {/* View toggle — tiny screens */}
          <div className="flex items-center gap-2 sm:hidden">
            <span className="text-xs text-gray-500 shrink-0">View:</span>
            <button
              type="button"
              onClick={() => { onViewModeChange('board'); setShowFilters(false); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${viewMode === 'board' ? 'bg-[#4169e1] text-white' : 'bg-[#1a1a24] text-gray-400 hover:bg-[#2a2a38]'}`}
            >
              <Grid3X3 size={12} /> Board
            </button>
            <button
              type="button"
              onClick={() => { onViewModeChange('list'); setShowFilters(false); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${viewMode === 'list' ? 'bg-[#4169e1] text-white' : 'bg-[#1a1a24] text-gray-400 hover:bg-[#2a2a38]'}`}
            >
              <List size={12} /> List
            </button>
          </div>
        </div>
      )}
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
    className="w-full bg-[#111118] border border-[#2a2a38] text-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#4169e1]/40 cursor-pointer hover:border-[#3a3a48] transition-colors"
  >
    {options.map((o) => (
      <option key={o.value} value={o.value} className="bg-[#111118] text-gray-300">
        {o.label}
      </option>
    ))}
  </select>
);
