import { useState } from 'react';
import { Mail, Copy, RefreshCw, Trash2, Check, Loader2, Sparkles, User, MessageSquare, AlertCircle } from 'lucide-react';
import type { EmailFormInput, EmailResult, RecipientType, ToneType, LengthType } from '@/types';
import { callAI } from '@/lib/aiClient';
import { EMAIL_SYSTEM_PROMPT } from '@/lib/aiPrompts';
import { demoEmail } from '@/lib/demoData';

const recipients: RecipientType[] = ['Client', 'Manager', 'Colleague', 'Team', 'Other'];
const tones: ToneType[] = ['Formal', 'Professional', 'Friendly', 'Persuasive', 'Apologetic'];
const lengths: LengthType[] = ['Short', 'Medium', 'Detailed'];

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
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function EmailGenerator() {
  const [form, setForm] = useState<EmailFormInput>(demoEmail);
  const [result, setResult] = useState<EmailResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!form.purpose.trim()) {
      setError('Please describe the purpose of your email.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const userPrompt = `Recipient: ${form.recipient}
Purpose: ${form.purpose}
Context: ${form.context || 'No additional context provided.'}
Tone: ${form.tone}
Length: ${form.length}

Please generate the email as a JSON object with keys: subject, greeting, body, closing.`;
      const content = await callAI(EMAIL_SYSTEM_PROMPT, userPrompt, 'json');
      const parsed = JSON.parse(content) as EmailResult;
      const full = `${parsed.greeting}\n\n${parsed.body}\n\n${parsed.closing}`;
      setResult({ ...parsed, full });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleClear = () => {
    setForm({ recipient: 'Client', purpose: '', context: '', tone: 'Professional', length: 'Medium' });
    setResult(null);
    setError('');
  };

  const handleLoadDemo = () => {
    setForm(demoEmail);
    setResult(null);
    setError('');
  };

  const update = (field: keyof EmailFormInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 shadow-lg shadow-sky-500/20">
            <Mail className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Smart Email Generator</h2>
            <p className="text-sm text-slate-500">Draft professional emails tailored to your audience and tone.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Email Details</h3>
            <button
              onClick={handleLoadDemo}
              className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load demo
            </button>
          </div>

          {/* Recipient */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Recipient type</label>
            <div className="flex flex-wrap gap-2">
              {recipients.map((r) => (
                <button
                  key={r}
                  onClick={() => update('recipient', r)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                    form.recipient === r
                      ? 'bg-sky-500 text-white border-sky-500'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Purpose of email <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.purpose}
              onChange={(e) => update('purpose', e.target.value)}
              placeholder="e.g. Project timeline update for Q3 redesign"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
            />
          </div>

          {/* Context */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Key information / context</label>
            <textarea
              value={form.context}
              onChange={(e) => update('context', e.target.value)}
              rows={4}
              placeholder="Add any details the email should mention..."
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all resize-none"
            />
          </div>

          {/* Tone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Desired tone</label>
            <div className="flex flex-wrap gap-2">
              {tones.map((t) => (
                <button
                  key={t}
                  onClick={() => update('tone', t)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                    form.tone === t
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Length */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email length</label>
            <div className="flex gap-2">
              {lengths.map((l) => (
                <button
                  key={l}
                  onClick={() => update('length', l)}
                  className={`px-4 py-1.5 text-sm rounded-lg border transition-all flex-1 ${
                    form.length === l
                      ? 'bg-sky-50 text-sky-700 border-sky-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-60 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Generating...' : 'Generate Email'}
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
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Generated Email</h3>
            {result && (
              <div className="flex gap-2">
                <CopyButton text={result.full} />
                <button
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-60"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>
              </div>
            )}
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-sky-500" />
              <p className="text-sm">AI is drafting your email...</p>
            </div>
          )}

          {!loading && error && !result && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-3">
                <AlertCircle className="w-7 h-7 text-rose-400" />
              </div>
              <p className="text-sm font-medium text-rose-600 mb-2">AI Error</p>
              <p className="text-xs text-slate-500 max-w-xs text-center mb-4">{error}</p>
              <button
                onClick={handleGenerate}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          )}

          {!loading && !result && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
                <Mail className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500">No email generated yet</p>
              <p className="text-xs text-slate-400 mt-1">Fill in the form and click Generate Email.</p>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Subject
                </div>
                <p className="text-sm font-medium text-slate-800 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                  {result.subject}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                  <User className="w-3.5 h-3.5" />
                  Greeting
                </div>
                <p className="text-sm text-slate-700">{result.greeting}</p>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Body</div>
                <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{result.body}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Closing</div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{result.closing}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
