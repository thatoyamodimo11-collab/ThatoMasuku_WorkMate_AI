import type { TaskInput, TaskPlan, ScheduledItem, Priority } from '@/types';

interface ScoredTask {
  task: TaskInput;
  score: number;
}

function parseDate(dateStr: string): number {
  if (!dateStr.trim()) return Number.MAX_SAFE_INTEGER;
  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) return parsed;
  const lower = dateStr.toLowerCase();
  if (lower.includes('today')) return Date.now();
  if (lower.includes('tomorrow')) return Date.now() + 86400000;
  if (lower.includes('next week')) return Date.now() + 7 * 86400000;
  if (lower.includes('this week')) return Date.now() + 5 * 86400000;
  return Number.MAX_SAFE_INTEGER;
}

const MIN_SESSION_HOURS = 1.5;
const WORK_START = 9;
const WORK_END = 13;
const WORK_HOURS = WORK_END - WORK_START;

function parseDurationHours(duration: string): number {
  if (!duration.trim()) return 0;
  const timeMatch = duration.match(/^(\d{1,2}):(\d{2})$/);
  if (timeMatch) return parseInt(timeMatch[1]) + parseInt(timeMatch[2]) / 60;
  const lower = duration.toLowerCase();
  const hoursMatch = lower.match(/([\d.]+)\s*(?:h|hr|hour)/);
  if (hoursMatch) return parseFloat(hoursMatch[1]);
  const minMatch = lower.match(/([\d.]+)\s*(?:m|min)/);
  if (minMatch) return parseFloat(minMatch[1]) / 60;
  const bareNum = lower.match(/^([\d.]+)$/);
  if (bareNum) return parseFloat(bareNum[1]);
  return 1;
}

function effectiveHours(raw: number): number {
  if (raw === 0) return MIN_SESSION_HOURS;
  return Math.max(raw, MIN_SESSION_HOURS);
}

function scoreTask(task: TaskInput): number {
  let score = 0;
  const priorityWeight: Record<Priority, number> = { High: 30, Medium: 20, Low: 10 };
  score += priorityWeight[task.priority];

  const deadlineMs = parseDate(task.deadline);
  const daysUntil = (deadlineMs - Date.now()) / 86400000;
  if (daysUntil <= 1) score += 40;
  else if (daysUntil <= 3) score += 30;
  else if (daysUntil <= 7) score += 20;
  else if (daysUntil <= 14) score += 10;
  else if (deadlineMs === Number.MAX_SAFE_INTEGER) score += 5;

  const hours = parseDurationHours(task.duration);
  if (hours > 0 && hours <= 1) score += 15;
  else if (hours > 1 && hours <= 2) score += 10;
  else if (hours > 2 && hours <= 4) score += 5;
  else if (hours > 4) score += 2;

  return score;
}

function buildSchedule(scored: ScoredTask[]): ScheduledItem[] {
  const schedule: ScheduledItem[] = [];
  let workDay = 1;
  let cursor = WORK_START;
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  for (const { task } of scored) {
    const rawHours = parseDurationHours(task.duration);
    const hours = effectiveHours(rawHours);

    if (cursor + hours > WORK_END) {
      workDay++;
      cursor = WORK_START;
    }
    if (workDay > dayNames.length) {
      workDay = 1;
      cursor = WORK_START;
    }

    const day = dayNames[workDay - 1];
    const startHour = cursor;
    const endHour = cursor + hours;
    const timeStr = `${day}, ${formatHour(startHour)} – ${formatHour(endHour)}`;
    schedule.push({
      name: task.name,
      time: timeStr,
      reason: task.deadline
        ? `Scheduled early — deadline: ${task.deadline}.`
        : 'Scheduled based on priority and effort.',
    });
    cursor = endHour;
  }

  return schedule;
}

function formatHour(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return m > 0 ? `${displayH}:${String(m).padStart(2, '0')} ${period}` : `${displayH} ${period}`;
}

function buildSuggestions(scored: ScoredTask[]): string[] {
  const suggestions: string[] = [];
  const allHaveDeadlines = scored.every((s) => s.task.deadline.trim());
  const allHaveDuration = scored.every((s) => s.task.duration.trim());

  const quickTasks = scored.filter((s) => {
    const h = parseDurationHours(s.task.duration);
    return h > 0 && h <= 1;
  });
  if (quickTasks.length >= 2) {
    suggestions.push(
      `${quickTasks.length} tasks are under 1.5 hours. Each will be given a minimum 1.5-hour focused session per the schedule.`
    );
  }

  const longTasks = scored.filter((s) => parseDurationHours(s.task.duration) > 3);
  if (longTasks.length >= 1) {
    suggestions.push(
      `Break down "${longTasks[0].task.name}" into smaller sub-tasks — longer tasks benefit from focused intervals.`
    );
  }

  if (!allHaveDeadlines) {
    suggestions.push('Some tasks have no deadline. Consider setting target dates to improve prioritization and accountability.');
  }

  if (!allHaveDuration) {
    suggestions.push('Some tasks have no estimated duration. Each will default to a 1.5-hour minimum session.');
  }

  const highPriorityCount = scored.filter((s) => s.task.priority === 'High').length;
  if (highPriorityCount >= 3) {
    suggestions.push(
      `You have ${highPriorityCount} high-priority tasks. Consider tackling the most urgent one first thing at 9:00 AM when focus is highest.`
    );
  }

  suggestions.push('Each work session is at least 1.5 hours with a 9:00 AM – 1:00 PM daily work window. Schedule buffer time between sessions.');
  suggestions.push('Tasks that exceed the 4-hour daily window will overflow to the next workday.');

  return suggestions;
}

export function planTasks(tasks: TaskInput[]): TaskPlan {
  const scored: ScoredTask[] = tasks
    .filter((t) => t.name.trim())
    .map((task) => ({ task, score: scoreTask(task) }))
    .sort((a, b) => b.score - a.score);

  const high = scored.filter((s) => s.task.priority === 'High').map((s) => s.task.name);
  const medium = scored.filter((s) => s.task.priority === 'Medium').map((s) => s.task.name);
  const low = scored.filter((s) => s.task.priority === 'Low').map((s) => s.task.name);

  const schedule = buildSchedule(scored);
  const suggestions = buildSuggestions(scored);

  return {
    highPriority: high,
    mediumPriority: medium,
    lowPriority: low,
    schedule,
    suggestions,
  };
}
