import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { View } from '@/types';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import EmailGenerator from '@/components/EmailGenerator';
import MeetingSummarizer from '@/components/MeetingSummarizer';
import TaskPlanner from '@/components/TaskPlanner';
import ClientQueue from '@/components/ClientQueue';

function ResponsibleAIBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="relative bg-amber-50 border-b border-amber-200 px-4 md:px-8 py-2.5">
      <div className="max-w-6xl mx-auto flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs md:text-sm text-amber-800 leading-relaxed flex-1">
          AI-generated content should be reviewed before use. Verify names, dates, deadlines and factual information. AI may produce inaccurate or incomplete information.
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-400 hover:text-amber-600 transition-colors flex-shrink-0"
          aria-label="Dismiss notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>('dashboard');

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar current={view} onNavigate={setView} />
      <div className="md:pl-72">
        <ResponsibleAIBanner />
        <main>
          {view === 'dashboard' && <Dashboard onNavigate={setView} />}
          {view === 'email' && <EmailGenerator />}
          {view === 'meeting' && <MeetingSummarizer />}
          {view === 'tasks' && <TaskPlanner />}
          {view === 'queue' && <ClientQueue />}
        </main>
      </div>
    </div>
  );
}
