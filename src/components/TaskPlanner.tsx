import { useState } from 'react';
import { ListTodo, Copy, Trash2, Check, Loader2, Sparkles, Plus, Calendar, Clock, Flag, StickyNote, CalendarDays, Lightbulb, ArrowUp, ArrowRight, ArrowDown, Download, AlertCircle, RefreshCw } from 'lucide-react';
import type { TaskInput, TaskPlan, Priority } from '@/types';
import { callAI } from '@/lib/aiClient';
import { TASK_SYSTEM_PROMPT } from '@/lib/aiPrompts';
import { downloadICS } from '@/lib/icsExport';
import { demoTasks } from '@/lib/demoData';
import CalendarView from '@/components/CalendarView';

const priorities: Priority[] = ['High', 'Medium', 'Low'];

const priorityStyles: Record<Priority, { bg: string; text: string; border: string; icon: typeof Flag }> = {
  High: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', icon: ArrowUp },
  Medium: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', icon: ArrowRight },
  Low: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', icon: ArrowDown },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
    >
      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
      {copied ? 'Copied' : 'Copy Plan'}
    </button>
  );
}

function buildCopyText(plan: TaskPlan): string {
  let text = `PRIORITY LIST\n\nHigh Priority\n${plan.highPriority.map((t) => `- ${t}`).join('\n') || '- None'}\n\n`;
  text += `Medium Priority\n${plan.mediumPriority.map((t) => `- ${t}`).join('\n') || '- None'}\n\n`;
  text += `Low Priority\n${plan.lowPriority.map((t) => `- ${t}`).join('\n') || '- None'}\n\n`;
  text += `RECOMMENDED SCHEDULE\n`;
  plan.schedule.forEach((s) => {
    text += `- ${s.time}: ${s.name} (${s.reason})\n`;
  });
  text += `\nTIME OPTIMIZATION SUGGESTIONS\n${plan.suggestions.map((s) => `- ${s}`).join('\n')}`;
  return text;
}

const emptyTask: TaskInput = {
  id: '',
  name: '',
  deadline: '',
  duration: '',
  priority: 'Medium',
  notes: '',
};

export default function TaskPlanner() {
  const [tasks, setTasks] = useState<TaskInput[]>([{ ...emptyTask, id: '1' }]);
  const [result, setResult] = useState<TaskPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateTask = (id: string, field: keyof TaskInput, value: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const addTask = () => {
    setTasks((prev) => [...prev, { ...emptyTask, id: String(Date.now()) }]);
  };

  const removeTask = (id: string) => {
    setTasks((prev) => (prev.length > 1 ? prev.filter((t) => t.id !== id) : prev));
  };

  const handlePlan = async () => {
    const validTasks = tasks.filter((t) => t.name.trim());
    if (validTasks.length === 0) {
      setError('Please add at least one task with a name.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const taskDescriptions = validTasks.map((t, i) =>
        `Task ${i + 1}: ${t.name}${t.deadline ? ` (Deadline: ${t.deadline})` : ''}${t.duration ? ` (Duration: ${t.duration})` : ''} (Priority: ${t.priority})${t.notes ? ` Notes: ${t.notes}` : ''}`
      ).join('\n');
      const userPrompt = `Please analyze the following tasks and create a prioritized work plan as a JSON object with keys: highPriority, mediumPriority, lowPriority, schedule, suggestions.\n\nTasks:\n${taskDescriptions}`;
      const content = await callAI(TASK_SYSTEM_PROMPT, userPrompt, 'json');
      setResult(JSON.parse(content) as TaskPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTasks([{ ...emptyTask, id: '1' }]);
    setResult(null);
    setError('');
  };

  const handleLoadDemo = () => {
    setTasks(demoTasks);
    setResult(null);
    setError('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
            <ListTodo className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">AI Task Planner</h2>
            <p className="text-sm text-slate-500">Organize tasks by priority and get a recommended schedule.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Task input */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Your Tasks</h3>
            <button
              onClick={handleLoadDemo}
              className="text-xs font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load demo
            </button>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {tasks.map((task, idx) => {
              const ps = priorityStyles[task.priority];
              const PriorityIcon = ps.icon;
              return (
                <div key={task.id} className="rounded-xl border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Task {idx + 1}</span>
                    {tasks.length > 1 && (
                      <button
                        onClick={() => removeTask(task.id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <ListTodo className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={task.name}
                      onChange={(e) => updateTask(task.id, 'name', e.target.value)}
                      placeholder="Task name"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="date"
                        value={task.deadline}
                        onChange={(e) => updateTask(task.id, 'deadline', e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                      />
                    </div>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="time"
                        value={task.duration}
                        onChange={(e) => updateTask(task.id, 'duration', e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Flag className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-medium text-slate-500">Priority</span>
                    </div>
                    <div className="flex gap-1.5">
                      {priorities.map((p) => {
                        const style = priorityStyles[p];
                        const Icon = style.icon;
                        const active = task.priority === p;
                        return (
                          <button
                            key={p}
                            onClick={() => updateTask(task.id, 'priority', p)}
                            className={`flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                              active
                                ? `${style.bg} ${style.text} ${style.border}`
                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <Icon className="w-3 h-3" />
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="relative">
                    <StickyNote className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={task.notes}
                      onChange={(e) => updateTask(task.id, 'notes', e.target.value)}
                      placeholder="Optional notes"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={addTask}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border-2 border-dashed border-slate-200 text-slate-500 hover:border-amber-300 hover:text-amber-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>

          {error && (
            <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handlePlan}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-60 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Planning...' : 'Generate Plan'}
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Your AI Plan</h3>
            {result && <CopyButton text={buildCopyText(result)} />}
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-200">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-amber-500" />
              <p className="text-sm">AI is organizing your tasks...</p>
            </div>
          )}

          {!loading && error && !result && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-200">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-3">
                <AlertCircle className="w-7 h-7 text-rose-400" />
              </div>
              <p className="text-sm font-medium text-rose-600 mb-2">AI Error</p>
              <p className="text-xs text-slate-500 max-w-xs text-center mb-4">{error}</p>
              <button
                onClick={handlePlan}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          )}

          {!loading && !result && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-200">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
                <ListTodo className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500">No plan generated yet</p>
              <p className="text-xs text-slate-400 mt-1">Add your tasks and click Generate Plan.</p>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-4">
              {/* Calendar + Download */}
              <div className="space-y-3">
                <CalendarView tasks={tasks} />
                {tasks.some((t) => t.name.trim() && t.deadline) && (
                  <button
                    onClick={() => downloadICS(tasks)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Calendar File (.ics)
                  </button>
                )}
              </div>

              {/* Priority list */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-3">Priority List</h4>
                <div className="space-y-3">
                  {(['High', 'Medium', 'Low'] as Priority[]).map((p) => {
                    const items = p === 'High' ? result.highPriority : p === 'Medium' ? result.mediumPriority : result.lowPriority;
                    const style = priorityStyles[p];
                    const Icon = style.icon;
                    return (
                      <div key={p}>
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${style.bg} ${style.text} mb-1.5`}>
                          <Icon className="w-3 h-3" />
                          {p} Priority
                        </div>
                        {items.length > 0 ? (
                          <ul className="space-y-1 ml-1">
                            {items.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                <span className="w-1 h-1 rounded-full bg-slate-300 mt-2 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-400 ml-1">None</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50">
                    <CalendarDays className="w-4 h-4 text-amber-500" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Recommended Schedule</h4>
                </div>
                <div className="space-y-2">
                  {result.schedule.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{item.name}</p>
                        <p className="text-xs text-amber-600 font-medium mt-0.5">{item.time}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sky-50">
                    <Lightbulb className="w-4 h-4 text-sky-500" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Time Optimization</h4>
                </div>
                <ul className="space-y-2">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <Lightbulb className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
