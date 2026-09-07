import { useState } from 'react';
import { FileText, Copy, Trash2, Check, Loader2, Sparkles, ClipboardList, CheckCircle2, ListTodo, CalendarClock, AlertCircle, RefreshCw } from 'lucide-react';
import type { MeetingSummary } from '@/types';
import { callAI } from '@/lib/aiClient';
import { MEETING_SYSTEM_PROMPT } from '@/lib/aiPrompts';
import { demoMeetingNotes } from '@/lib/demoData';

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
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
      {copied ? 'Copied' : label}
    </button>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof FileText;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50">
          <Icon className="w-4 h-4 text-slate-500" strokeWidth={2} />
        </div>
        <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function buildCopyText(summary: MeetingSummary): string {
  let text = `MEETING SUMMARY\n${summary.summary}\n\n`;
  text += `KEY DISCUSSION POINTS\n${summary.keyPoints.map((p) => `- ${p}`).join('\n')}\n\n`;
  text += `DECISIONS MADE\n${summary.decisions.map((d) => `- ${d}`).join('\n')}\n\n`;
  text += `ACTION ITEMS\n`;
  if (summary.actionItems.length > 0) {
    summary.actionItems.forEach((a) => {
      text += `- ${a.task} (Owner: ${a.responsible}, Deadline: ${a.deadline})\n`;
    });
  } else {
    text += '- Not specified.\n';
  }
  text += `\nIMPORTANT DEADLINES\n${summary.deadlines.map((d) => `- ${d}`).join('\n')}`;
  return text;
}

export default function MeetingSummarizer() {
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<MeetingSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    if (notes.trim().length < 20) {
      setError('Please paste at least a few sentences of meeting notes.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const userPrompt = `Please analyze the following meeting notes and return a structured summary as a JSON object with keys: summary, keyPoints, decisions, actionItems, deadlines.\n\nMeeting notes:\n${notes}`;
      const content = await callAI(MEETING_SYSTEM_PROMPT, userPrompt, 'json');
      setResult(JSON.parse(content) as MeetingSummary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to summarize notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setNotes('');
    setResult(null);
    setError('');
  };

  const handleLoadDemo = () => {
    setNotes(demoMeetingNotes);
    setResult(null);
    setError('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20">
            <FileText className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Meeting Notes Summarizer</h2>
            <p className="text-sm text-slate-500">Turn raw meeting notes into structured, scannable summaries.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Paste Your Notes</h3>
            <button
              onClick={handleLoadDemo}
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load demo
            </button>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={16}
            placeholder="Paste your raw meeting notes here. Include topics, decisions, action items, and any deadlines mentioned..."
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all resize-none font-mono leading-relaxed"
          />
          {error && (
            <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSummarize}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Summarizing...' : 'Summarize Notes'}
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
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Structured Summary</h3>
            {result && <CopyButton text={buildCopyText(result)} label="Copy Summary" />}
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-200">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-emerald-500" />
              <p className="text-sm">AI is analyzing your meeting notes...</p>
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
                onClick={handleSummarize}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          )}

          {!loading && !result && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-200">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
                <ClipboardList className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500">No summary yet</p>
              <p className="text-xs text-slate-400 mt-1">Paste your notes and click Summarize.</p>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-4">
              <SectionCard icon={FileText} title="Meeting Summary">
                <p className="text-sm text-slate-700 leading-relaxed">{result.summary}</p>
              </SectionCard>

              <SectionCard icon={ClipboardList} title="Key Discussion Points">
                <ul className="space-y-1.5">
                  {result.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </SectionCard>

              <SectionCard icon={CheckCircle2} title="Decisions Made">
                <ul className="space-y-1.5">
                  {result.decisions.map((decision, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      {decision}
                    </li>
                  ))}
                </ul>
              </SectionCard>

              <SectionCard icon={ListTodo} title="Action Items">
                {result.actionItems.length > 0 ? (
                  <div className="space-y-2">
                    {result.actionItems.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <ListTodo className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800">{item.task}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-slate-500">
                            <span>Owner: <span className="text-slate-700 font-medium">{item.responsible}</span></span>
                            <span>Deadline: <span className="text-slate-700 font-medium">{item.deadline}</span></span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Not specified.</p>
                )}
              </SectionCard>

              <SectionCard icon={CalendarClock} title="Important Deadlines">
                <ul className="space-y-1.5">
                  {result.deadlines.map((deadline, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <CalendarClock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      {deadline}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
