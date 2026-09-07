import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Clock,
  Play,
  Pause,
  CheckCircle2,
  ChevronRight,
  X,
  StickyNote,
} from 'lucide-react';
import type { Client, ClientStatus } from '@/types';
import { supabase } from '@/lib/supabaseClient';

const STATUSES: ClientStatus[] = ['pending', 'in_progress', 'on_hold', 'done'];

const statusConfig: Record<
  ClientStatus,
  { label: string; icon: typeof Clock; accent: string; headerBg: string; headerText: string; dot: string; ring: string }
> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    accent: 'text-slate-600',
    headerBg: 'bg-slate-100',
    headerText: 'text-slate-700',
    dot: 'bg-slate-400',
    ring: 'ring-slate-200',
  },
  in_progress: {
    label: 'In Progress',
    icon: Play,
    accent: 'text-sky-600',
    headerBg: 'bg-sky-50',
    headerText: 'text-sky-700',
    dot: 'bg-sky-500',
    ring: 'ring-sky-200',
  },
  on_hold: {
    label: 'On Hold',
    icon: Pause,
    accent: 'text-amber-600',
    headerBg: 'bg-amber-50',
    headerText: 'text-amber-700',
    dot: 'bg-amber-500',
    ring: 'ring-amber-200',
  },
  done: {
    label: 'Done',
    icon: CheckCircle2,
    accent: 'text-emerald-600',
    headerBg: 'bg-emerald-50',
    headerText: 'text-emerald-700',
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-200',
  },
};

const statusOrder: Record<ClientStatus, number> = {
  pending: 0,
  in_progress: 1,
  on_hold: 2,
  done: 3,
};

function nextStatus(s: ClientStatus): ClientStatus | null {
  const idx = STATUSES.indexOf(s);
  return idx < STATUSES.length - 1 ? STATUSES[idx + 1] : null;
}

function prevStatus(s: ClientStatus): ClientStatus | null {
  const idx = STATUSES.indexOf(s);
  return idx > 0 ? STATUSES[idx - 1] : null;
}

export default function ClientQueue() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newService, setNewService] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .order('status', { ascending: true })
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setClients((data as Client[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clients.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setUpdatingId('new');
    try {
      const { data, error: insertError } = await supabase
        .from('clients')
        .insert({
          name: newName.trim(),
          service: newService.trim(),
          notes: newNotes.trim(),
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) throw insertError;
      setClients((prev) => [...prev, data as Client]);
      setNewName('');
      setNewService('');
      setNewNotes('');
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add client.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusChange = async (clientId: string, newStatus: ClientStatus) => {
    setUpdatingId(clientId);
    try {
      const { error: updateError } = await supabase
        .from('clients')
        .update({ status: newStatus })
        .eq('id', clientId);

      if (updateError) throw updateError;
      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? { ...c, status: newStatus } : c)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (clientId: string) => {
    setUpdatingId(clientId);
    try {
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (deleteError) throw deleteError;
      setClients((prev) => prev.filter((c) => c.id !== clientId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete client.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNotes = async (clientId: string) => {
    setUpdatingId(clientId);
    try {
      const { error: updateError } = await supabase
        .from('clients')
        .update({ notes: editNotes.trim() })
        .eq('id', clientId);

      if (updateError) throw updateError;
      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? { ...c, notes: editNotes.trim() } : c)),
      );
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save notes.');
    } finally {
      setUpdatingId(null);
    }
  };

  const clientsByStatus = (status: ClientStatus) =>
    clients
      .filter((c) => c.status === status)
      .sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20">
            <Users className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Client Queue</h2>
            <p className="text-sm text-slate-500">Track client work from pending to done.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchClients}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-rose-400 hover:text-rose-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add form modal */}
      {showAddForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          onClick={() => setShowAddForm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-full max-w-md space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Add New Client</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  autoFocus
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                  Service / Work
                </label>
                <input
                  type="text"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  placeholder="e.g. Website redesign"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Any additional details..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleAdd}
                disabled={!newName.trim() || updatingId === 'new'}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                {updatingId === 'new' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Client
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 text-sm font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Board */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-violet-500" />
          <p className="text-sm">Loading client queue...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STATUSES.map((status) => {
            const config = statusConfig[status];
            const Icon = config.icon;
            const items = clientsByStatus(status);
            return (
              <div
                key={status}
                className="bg-slate-50 rounded-2xl border border-slate-200 flex flex-col min-h-[300px]"
              >
                {/* Column header */}
                <div className={`flex items-center justify-between px-4 py-3 rounded-t-2xl ${config.headerBg}`}>
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${config.accent}`} strokeWidth={2.2} />
                    <span className={`text-sm font-bold ${config.headerText}`}>{config.label}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {items.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
                  {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                      <Icon className="w-8 h-8 mb-2" />
                      <p className="text-xs text-slate-400">No clients</p>
                    </div>
                  )}
                  {items.map((client) => {
                    const isUpdating = updatingId === client.id;
                    const isEditing = editingId === client.id;
                    const next = nextStatus(client.status);
                    const prev = prevStatus(client.status);
                    return (
                      <div
                        key={client.id}
                        className={`bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow ring-1 ${config.ring}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dot}`} />
                            <h4 className="text-sm font-bold text-slate-900 truncate">{client.name}</h4>
                          </div>
                          {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400 flex-shrink-0" />}
                        </div>

                        {client.service && (
                          <p className="text-xs text-slate-600 mb-2 pl-4">{client.service}</p>
                        )}

                        {/* Notes */}
                        {isEditing ? (
                          <div className="mb-3 pl-4 space-y-1.5">
                            <textarea
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              rows={2}
                              autoFocus
                              className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all resize-none"
                              placeholder="Add notes..."
                            />
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleSaveNotes(client.id)}
                                disabled={updatingId === client.id}
                                className="px-2 py-1 text-xs font-medium rounded-md bg-violet-600 text-white hover:bg-violet-700 transition-colors"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-2 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          client.notes && (
                            <div className="mb-3 pl-4 flex items-start gap-1.5">
                              <StickyNote className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-slate-500 leading-relaxed">{client.notes}</p>
                            </div>
                          )
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-1 pl-4 pt-1 border-t border-slate-100 mt-2">
                          {prev && (
                            <button
                              onClick={() => handleStatusChange(client.id, prev)}
                              disabled={isUpdating}
                              title={`Move to ${statusConfig[prev].label}`}
                              className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-40"
                            >
                              <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                            </button>
                          )}
                          {next && (
                            <button
                              onClick={() => handleStatusChange(client.id, next)}
                              disabled={isUpdating}
                              title={`Move to ${statusConfig[next].label}`}
                              className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-40"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingId(client.id);
                              setEditNotes(client.notes);
                            }}
                            disabled={isUpdating}
                            title="Edit notes"
                            className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-40"
                          >
                            <StickyNote className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(client.id)}
                            disabled={isUpdating}
                            title="Remove client"
                            className="p-1 rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors disabled:opacity-40 ml-auto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
