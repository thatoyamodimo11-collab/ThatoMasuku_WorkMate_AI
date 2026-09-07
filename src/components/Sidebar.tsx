import { Mail, FileText, ListTodo, LayoutDashboard, Bot, Users } from 'lucide-react';
import type { View } from '@/types';

interface NavItem {
  id: View;
  label: string;
  icon: typeof Mail;
  description: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview' },
  { id: 'email', label: 'Email Generator', icon: Mail, description: 'Draft professional emails' },
  { id: 'meeting', label: 'Meeting Summarizer', icon: FileText, description: 'Structure meeting notes' },
  { id: 'tasks', label: 'Task Planner', icon: ListTodo, description: 'Prioritize your work' },
  { id: 'queue', label: 'Client Queue', icon: Users, description: 'Track client work' },
];

interface SidebarProps {
  current: View;
  onNavigate: (view: View) => void;
}

export default function Sidebar({ current, onNavigate }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-slate-900 border-r border-slate-800">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 shadow-lg shadow-sky-500/20">
            <Bot className="w-6 h-6 text-white" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">WorkMate AI</h1>
            <p className="text-xs text-slate-400">Productivity Assistant</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  active
                    ? 'bg-sky-500/10 text-sky-400 border-l-2 border-sky-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border-l-2 border-transparent'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
                <div className="text-left">
                  <span className="block text-sm font-medium">{item.label}</span>
                  <span className="block text-xs text-slate-500 group-hover:text-slate-400">{item.description}</span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-slate-800">
          <p className="text-xs text-slate-500 leading-relaxed">
            AI-generated content should be reviewed before use. Verify names, dates, and facts.
          </p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-50 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-400">
              <Bot className="w-5 h-5 text-white" strokeWidth={2.2} />
            </div>
            <span className="text-base font-bold text-white">WorkMate AI</span>
          </div>
        </div>
        <nav className="flex px-2 pb-2 gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  active ? 'bg-sky-500/15 text-sky-400' : 'text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>
    </>
  );
}
