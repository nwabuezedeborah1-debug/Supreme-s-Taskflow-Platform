import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Task } from '../../types.ts';
import { priorityConfig } from '../../utils/helpers';

interface CalendarViewProps {
  tasks: Task[];
  onViewTask: (task: Task) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onViewTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today       = new Date();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getTasksForDay = (day: number): Task[] =>
    tasks.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  // Abbreviated on mobile
  const dayNames    = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNamesMob = ['S',   'M',   'T',   'W',   'T',   'F',   'S'];

  return (
    <div className="bg-[#111118] border border-[#2a2a38] rounded-2xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#2a2a38]">
        <h3 className="text-sm sm:text-base font-semibold text-white">{monthName}</h3>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button onClick={prevMonth} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#2a2a38] transition-colors tap-target flex items-center justify-center">
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium text-[#4169e1] bg-[#4169e1]/10 border border-[#4169e1]/20 hover:bg-[#4169e1]/20 transition-colors"
          >
            Today
          </button>
          <button onClick={nextMonth} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#2a2a38] transition-colors tap-target flex items-center justify-center">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 border-b border-[#2a2a38]">
        {dayNames.map((d, i) => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider select-none">
            <span className="hidden sm:inline">{d}</span>
            <span className="sm:hidden">{dayNamesMob[i]}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          const isToday =
            day !== null &&
            today.getDate() === day &&
            today.getMonth() === month &&
            today.getFullYear() === year;
          const dayTasks = day ? getTasksForDay(day) : [];

          return (
            <div
              key={idx}
              className={`
                border-b border-r border-[#1e1e2e] p-1 sm:p-2 transition-colors
                min-h-[60px] sm:min-h-[90px]
                ${day ? 'hover:bg-[#1a1a24]' : 'bg-[#0d0d15]'}
                ${idx % 7 === 6 ? 'border-r-0' : ''}
              `}
            >
              {day && (
                <>
                  <span className={`
                    inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-xs sm:text-sm font-medium mb-1
                    ${isToday ? 'bg-[#4169e1] text-white' : 'text-gray-400'}
                  `}>
                    {day}
                  </span>
                  <div className="space-y-0.5">
                    {/* On mobile show dots only, on sm+ show labels */}
                    {dayTasks.length > 0 && (
                      <>
                        {/* Mobile: coloured dots */}
                        <div className="flex gap-0.5 flex-wrap sm:hidden">
                          {dayTasks.slice(0, 4).map((task) => (
                            <button
                              key={task.id}
                              onClick={() => onViewTask(task)}
                              className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityConfig[task.priority].dot}`}
                              title={task.title}
                            />
                          ))}
                          {dayTasks.length > 4 && (
                            <span className="text-gray-600" style={{ fontSize: '0.5rem' }}>+{dayTasks.length - 4}</span>
                          )}
                        </div>
                        {/* sm+: pill labels */}
                        <div className="hidden sm:block space-y-0.5">
                          {dayTasks.slice(0, 2).map((task) => {
                            const p = priorityConfig[task.priority];
                            return (
                              <button
                                key={task.id}
                                onClick={() => onViewTask(task)}
                                className={`w-full text-left text-xs px-1.5 py-0.5 rounded-md truncate ${p.bg} ${p.color} border border-current/10 hover:opacity-80 transition-opacity`}
                              >
                                {task.title}
                              </button>
                            );
                          })}
                          {dayTasks.length > 2 && (
                            <span className="text-xs text-gray-600 pl-1">+{dayTasks.length - 2}</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
