import type { TaskInput } from '@/types';

function formatICSDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function generateICS(tasks: TaskInput[]): string {
  const now = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WorkMate AI//Task Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ].join('\r\n');

  for (const task of tasks) {
    if (!task.name.trim() || !task.deadline) continue;
    const dateStr = formatICSDate(task.deadline);
    if (!dateStr) continue;

    const endStr = formatICSDate(
      new Date(new Date(task.deadline + 'T00:00:00').getTime() + 86400000)
        .toISOString()
        .slice(0, 10)
    );

    ics += '\r\n' + [
      'BEGIN:VEVENT',
      `UID:${task.id || Date.now()}-${Math.random().toString(36).slice(2)}@workmate-ai`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${dateStr}`,
      `DTEND;VALUE=DATE:${endStr}`,
      `SUMMARY:${escapeICS(task.name)}`,
      task.notes ? `DESCRIPTION:${escapeICS(task.notes)}` : '',
      `CATEGORIES:${task.priority} Priority`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: ${escapeICS(task.name)} is due tomorrow`,
      'END:VALARM',
      'END:VEVENT',
    ].filter(Boolean).join('\r\n');
  }

  ics += '\r\n' + 'END:VCALENDAR';
  return ics;
}

export function downloadICS(tasks: TaskInput[]): void {
  const ics = generateICS(tasks);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'workmate-tasks.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
