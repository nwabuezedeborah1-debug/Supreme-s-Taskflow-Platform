import React, { useState, useMemo } from 'react';
import { Tag, Search, X, ChevronRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import type { Task } from '../../types.ts';
import { priorityConfig, statusConfig, isOverdue, formatDueDate } from '../../utils/helpers.ts';

interface TagsViewProps {
  tasks: Task[];
  onViewTask: (task: Task) => void;
}

const TAG_COLORS = [
  'bg-[#4169e1]/15 text-[#4169e1] border-[#4169e1]/30',
  'bg-[#f5c518]/15 text-[#f5c518] border-[#f5c518]/30',
  'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'bg-green-500/15 text-green-400 border-green-500/30',
  'bg-pink-500/15 text-pink-400 border-pink-500/30',
  'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  'bg-rose-500/15 text-rose-400 border-rose-500/30',
];

export const TagsView: React.FC<TagsViewProps> = ({ tasks, onViewTask }) => {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const tagMap = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((task) =>
      task.tags.forEach((tag) => {
        if (!map.has(tag)) map.set(tag, []);
        map.get(tag)!.push(task);
      })
    );
    return map;
  }, [tasks]);

  const allTags = useMemo(() =>
    Array.from(tagMap.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .map(([tag, t]) => ({ tag, count: t.length })),
    [tagMap]
  );

  const filteredTags = allTags.filter((t) =>
    t.tag.toLowerCase().includes(search.toLowerCase())
  );

  const selectedTasks = selectedTag ? (tagMap.get(selectedTag) || []) : [];
  const color = (i: number) => TAG_COLORS[i % TAG_COLORS.length];

  if (allTags.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-600 animate-fade-in">
        <div className="w-16 h-16 bg-[#1a1a24] rounded-2xl flex items-center justify-center mb-4">
          <Tag size={28} className="text-gray-700" />
        </div>
        <h3 className="text-base font-semibold text-gray-500">No tags yet</h3>
        <p className="text-sm mt-1 text-gray-600">Add tags to tasks to organise them here</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6">

      {/* Header row */}
      <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-white">Tags</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {allTags.length} tag{allTags.length !== 1 ? 's' : ''} · {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </p>
        </div>
        {selectedTag && (
          <button
            onClick={() => setSelectedTag(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a24] border border-[#2a2a38] rounded-xl text-sm text-gray-400 hover:text-white hover:border-[#3a3a48] transition-colors"
          >
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-xs bg-[#111118] border border-[#2a2a38] text-gray-300 placeholder-gray-600 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4169e1]/40 focus:border-[#4169e1] transition-colors"
        />
      </div>

      {/* Layout: stacked on mobile, side-by-side on lg+ */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">

        {/* Left: tag list + cloud */}
        <div className="lg:col-span-1 space-y-4">
          {/* Tag list */}
          <div className="bg-[#111118] border border-[#2a2a38] rounded-2xl p-4 sm:p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">All Tags</h3>
            {filteredTags.length === 0 ? (
              <p className="text-sm text-gray-600 py-4 text-center">No tags match</p>
            ) : (
              <div className="space-y-1.5">
                {filteredTags.map(({ tag, count }, i) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-left tap-target
                      ${selectedTag === tag
                        ? 'bg-[#4169e1]/20 border-[#4169e1]/50 text-white'
                        : 'bg-[#0a0a0f] border-[#1e1e2e] hover:border-[#3a3a48] hover:bg-[#1a1a24]'}
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold border ${color(i)}`}>
                        {tag.charAt(0).toUpperCase()}
                      </span>
                      <span className={`text-sm font-medium ${selectedTag === tag ? 'text-white' : 'text-gray-300'}`}>
                        {tag}
                      </span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${selectedTag === tag ? 'bg-[#4169e1]/30 text-[#4169e1]' : 'bg-[#2a2a38] text-gray-500'}`}>
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tag cloud */}
          <div className="bg-[#111118] border border-[#2a2a38] rounded-2xl p-4 sm:p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Tag Cloud</h3>
            <div className="flex flex-wrap gap-2">
              {filteredTags.map(({ tag, count }, i) => {
                const max  = filteredTags[0]?.count || 1;
                const size = 0.7 + (count / max) * 0.45;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full border font-medium transition-all
                      ${selectedTag === tag ? 'ring-2 ring-[#4169e1] ring-offset-1 ring-offset-[#111118]' : ''}
                      ${color(i)}`}
                    style={{ fontSize: `${size}rem` }}
                  >
                    <Tag size={9} />
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: tasks panel */}
        <div className="lg:col-span-2">
          {selectedTag ? (
            <div className="bg-[#111118] border border-[#2a2a38] rounded-2xl overflow-hidden">
              {/* Panel header */}
              <div className="flex items-center gap-2 px-4 sm:px-5 py-3.5 border-b border-[#2a2a38] bg-[#0d0d15] flex-wrap gap-y-2">
                <Tag size={14} className="text-[#4169e1] flex-shrink-0" />
                <span className="text-sm font-semibold text-white">#{selectedTag}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#4169e1]/15 text-[#4169e1]">
                  {selectedTasks.length}
                </span>
                <div className="ml-auto flex items-center gap-2 sm:gap-3 text-xs text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    {selectedTasks.filter((t) => t.status === 'done').length} done
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4169e1]" />
                    {selectedTasks.filter((t) => t.status === 'in-progress').length} active
                  </span>
                  {selectedTasks.filter((t) => isOverdue(t.dueDate, t.status)).length > 0 && (
                    <span className="flex items-center gap-1 text-red-400">
                      <AlertCircle size={11} />
                      {selectedTasks.filter((t) => isOverdue(t.dueDate, t.status)).length} overdue
                    </span>
                  )}
                </div>
              </div>

              <div className="divide-y divide-[#1e1e2e]">
                {selectedTasks.map((task) => {
                  const overdue  = isOverdue(task.dueDate, task.status);
                  const priority = priorityConfig[task.priority];
                  const status   = statusConfig[task.status];
                  return (
                    <button
                      key={task.id}
                      onClick={() => onViewTask(task)}
                      className="w-full flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-[#1a1a24] active:bg-[#2a2a38] transition-colors text-left group tap-target"
                    >
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${priority.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-gray-600' : 'text-white'}`}>
                            {task.title}
                          </span>
                          {overdue && <AlertCircle size={12} className="text-red-400 flex-shrink-0" />}
                        </div>
                        {task.description && (
                          <p className="text-xs text-gray-600 truncate mt-0.5">{task.description}</p>
                        )}
                      </div>
                      <span className={`hidden sm:inline-flex items-center text-xs font-medium px-2 py-1 rounded-lg border flex-shrink-0 ${status.bg} ${status.color} ${status.border}`}>
                        {task.status === 'done' && <CheckCircle2 size={10} className="mr-1" />}
                        {status.label}
                      </span>
                      {task.dueDate && (
                        <span className={`hidden md:flex items-center gap-1 text-xs flex-shrink-0 ${overdue ? 'text-red-400' : 'text-gray-500'}`}>
                          <Clock size={11} />
                          {formatDueDate(task.dueDate)}
                        </span>
                      )}
                      <ChevronRight size={14} className="text-gray-700 group-hover:text-gray-400 flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Overview grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {filteredTags.map(({ tag, count }, i) => {
                const tagTasks    = tagMap.get(tag) || [];
                const doneTasks   = tagTasks.filter((t) => t.status === 'done').length;
                const overdueCount = tagTasks.filter((t) => isOverdue(t.dueDate, t.status)).length;
                const progress    = count > 0 ? Math.round((doneTasks / count) * 100) : 0;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className="bg-[#111118] border border-[#2a2a38] rounded-2xl p-4 sm:p-5 text-left hover:border-[#4169e1]/40 active:border-[#4169e1]/60 transition-all duration-150 group animate-slide-up"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`flex items-center justify-center w-8 h-8 rounded-xl text-sm font-bold border ${color(i)}`}>
                          {tag.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <span className="text-sm font-semibold text-white block">#{tag}</span>
                          <span className="text-xs text-gray-500">{count} task{count !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-gray-700 group-hover:text-[#4169e1] transition-colors" />
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">{doneTasks}/{count} done</span>
                        <span className="text-xs font-semibold text-gray-500">{progress}%</span>
                      </div>
                      <div className="h-1.5 bg-[#1e1e2e] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-[#4169e1]'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs flex-wrap">
                      <span className="flex items-center gap-1 text-blue-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        {tagTasks.filter((t) => t.status === 'in-progress').length} active
                      </span>
                      {overdueCount > 0 && (
                        <span className="flex items-center gap-1 text-red-400">
                          <AlertCircle size={9} /> {overdueCount} overdue
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
