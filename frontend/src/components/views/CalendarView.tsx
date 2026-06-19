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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getTasksForDay = (day: number): Task[] => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const d = new Date(task.dueDate);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to complete last week row
  while (cells.length % 7 !== 0) cells.push(null);

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-[#111118] border border-[#2a2a38] rounded-2xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a38]">
        <h3 className="text-base font-semibold text-white">{monthName}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#2a2a38] transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-[#4169e1] bg-[#4169e1]/10 border border-[#4169e1]/20 hover:bg-[#4169e1]/20 transition-colors"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#2a2a38] transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 border-b border-[#2a2a38]">
        {dayNames.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          const isToday = day !== null &&
            today.getDate() === day &&
            today.getMonth() === month &&
            today.getFullYear() === year;
          const dayTasks = day ? getTasksForDay(day) : [];

          return (
            <div
              key={idx}
              className={`
                min-h-[100px] p-2 border-b border-r border-[#1e1e2e] transition-colors
                ${day ? 'hover:bg-[#1a1a24]' : 'bg-[#0d0d15]'}
                ${idx % 7 === 6 ? 'border-r-0' : ''}
              `}
            >
              {day && (
                <>
                  <span
                    className={`
                      inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium mb-1
                      ${isToday ? 'bg-[#4169e1] text-white' : 'text-gray-400'}
                    `}
                  >
                    {day}
                  </span>
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map((task) => {
                      const p = priorityConfig[task.priority];
                      return (
                        <button
                          key={task.id}
                          onClick={() => onViewTask(task)}
                          className={`
                            w-full text-left text-xs px-1.5 py-1 rounded-lg truncate
                            ${p.bg} ${p.color} border border-current/20
                            hover:opacity-80 transition-opacity
                          `}
                        >
                          {task.title}
                        </button>
                      );
                    })}
                    {dayTasks.length > 3 && (
                      <span className="text-xs text-gray-600 pl-1">+{dayTasks.length - 3} more</span>
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
