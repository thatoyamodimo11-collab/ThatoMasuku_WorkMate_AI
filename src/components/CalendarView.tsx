import { useState, useMemo } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import type { TaskInput, Priority } from '@/types';

const priorityDot: Record<Priority, string> = {
  High: 'bg-rose-500',
  Medium: 'bg-amber-500',
  Low: 'bg-slate-400',
};

const priorityBg: Record<Priority, string> = {
  High: 'bg-rose-50 border-rose-300',
  Medium: 'bg-amber-50 border-amber-300',
  Low: 'bg-slate-50 border-slate-300',
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarViewProps {
  tasks: TaskInput[];
}

export default function CalendarView({ tasks }: CalendarViewProps) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const tasksByDate = useMemo(() => {
    const map = new Map<string, TaskInput[]>();
    for (const task of tasks) {
      if (!task.deadline) continue;
      const date = new Date(task.deadline + 'T00:00:00');
      if (isNaN(date.getTime())) continue;
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const existing = map.get(key);
      if (existing) existing.push(task);
      else map.set(key, [task]);
    }
    return map;
  }, [tasks]);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50">
            <CalendarDays className="w-4 h-4 text-amber-500" />
          </div>
          <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Deadline Calendar</h4>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToday}
            className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="text-center mb-3">
        <span className="text-base font-bold text-slate-800">
          {monthNames[viewMonth]} {viewYear}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-slate-400 py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={i} className="min-h-[64px] rounded-lg" />;
          }
          const dayTasks = tasksByDate.get(`${viewYear}-${viewMonth}-${day}`) || [];
          const hasTasks = dayTasks.length > 0;
          return (
            <div
              key={i}
              className={`min-h-[64px] rounded-lg border p-1 ${
                hasTasks ? priorityBg[dayTasks[0].priority] : 'border-slate-100'
              } ${isToday(day) ? 'ring-2 ring-amber-400 ring-offset-0' : ''}`}
            >
              <div className={`text-xs font-medium mb-0.5 ${isToday(day) ? 'text-amber-600' : 'text-slate-500'}`}>
                {day}
              </div>
              <div className="space-y-0.5">
                {dayTasks.slice(0, 2).map((task, j) => (
                  <div
                    key={j}
                    className="flex items-center gap-1 px-1 py-0.5 rounded text-[10px] leading-tight bg-white/80 truncate"
                    title={task.name}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityDot[task.priority]}`} />
                    <span className="text-slate-700 truncate">{task.name}</span>
                  </div>
                ))}
                {dayTasks.length > 2 && (
                  <div className="text-[10px] text-slate-500 px-1">+{dayTasks.length - 2} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
        {(['High', 'Medium', 'Low'] as Priority[]).map((p) => (
          <div key={p} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${priorityDot[p]}`} />
            <span className="text-xs text-slate-500">{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
