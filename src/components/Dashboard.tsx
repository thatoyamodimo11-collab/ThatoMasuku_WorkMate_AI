import { Mail, FileText, ListTodo, ArrowRight, Sparkles, Clock, ShieldCheck, Users } from 'lucide-react';
import type { View } from '@/types';

interface DashboardProps {
  onNavigate: (view: View) => void;
}

const tools = [
  {
    id: 'email' as View,
    icon: Mail,
    title: 'Smart Email Generator',
    description: 'Draft professional emails in seconds. Choose your recipient, tone, and purpose — get a polished email ready to send.',
    features: ['Subject line generation', 'Tone & audience adaptation', 'Formal to friendly styles'],
    accent: 'from-sky-500 to-blue-500',
    glow: 'shadow-sky-500/20',
  },
  {
    id: 'meeting' as View,
    icon: FileText,
    title: 'Meeting Notes Summarizer',
    description: 'Transform raw, unstructured meeting notes into clear summaries, decisions, action items, and deadlines.',
    features: ['Key discussion points', 'Decisions & action items', 'Deadline extraction'],
    accent: 'from-emerald-500 to-teal-500',
    glow: 'shadow-emerald-500/20',
  },
  {
    id: 'tasks' as View,
    icon: ListTodo,
    title: 'AI Task Planner',
    description: 'Organize your tasks by urgency, importance, and effort. Get a recommended schedule and optimization tips.',
    features: ['Priority categorization', 'Recommended schedule', 'Time optimization tips'],
    accent: 'from-amber-500 to-orange-500',
    glow: 'shadow-amber-500/20',
  },
  {
    id: 'queue' as View,
    icon: Users,
    title: 'Client Queue',
    description: 'Track client work across four stages — from pending to in progress to done. Move clients between statuses as work advances.',
    features: ['Four-stage status board', 'Add, move, and remove clients', 'Notes for each client'],
    accent: 'from-violet-500 to-fuchsia-500',
    glow: 'shadow-violet-500/20',
  },
];

export default function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* Hero */}
      <div className="text-center mb-12 md:mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200 mb-5">
          <Sparkles className="w-4 h-4 text-sky-500" />
          <span className="text-sm font-medium text-sky-700">AI-Powered Workplace Assistant</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
          WorkMate AI
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
          Your AI-powered workplace productivity assistant. Reduce time on repetitive tasks and focus on what matters.
        </p>
      </div>

      {/* Tool cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mb-12">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => onNavigate(tool.id)}
              className="group text-left bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-slate-300 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${tool.accent} shadow-lg ${tool.glow} mb-4`}>
                <Icon className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{tool.title}</h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">{tool.description}</p>
              <ul className="space-y-1.5 mb-4">
                {tool.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-sky-400 transition-colors" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-sky-600 group-hover:gap-2.5 transition-all">
                Open tool
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Info bar */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-4 border border-slate-200">
          <Clock className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-slate-800">Save Time</h4>
            <p className="text-xs text-slate-500 mt-0.5">Cut hours off repetitive writing and planning tasks each week.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-4 border border-slate-200">
          <ShieldCheck className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-slate-800">Responsible AI</h4>
            <p className="text-xs text-slate-500 mt-0.5">Outputs use only your input. Always review before sending.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-4 border border-slate-200">
          <Sparkles className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-slate-800">Unified Experience</h4>
            <p className="text-xs text-slate-500 mt-0.5">Three tools, one assistant. Switch between them seamlessly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
