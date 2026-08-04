'use client';

import { Account, ConfluenceTag } from '@/lib/types';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Trash2, Pencil, Plus, Check, X } from 'lucide-react';

interface SettingsClientProps {
  accounts: Account[];
  tags: ConfluenceTag[];
}

const inputClass = "bg-[#191919] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#e8e8e8] placeholder-[#3a3a3a] focus:outline-none focus:border-indigo-600 transition-colors";

export function SettingsClient({ accounts: initialAccounts, tags: initialTags }: SettingsClientProps) {
  const router = useRouter();
  const [accounts, setAccounts] = useState(initialAccounts);
  const [tags, setTags] = useState(initialTags);

  // New account form
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<'backtest' | 'live'>('live');
  const [newAccBal, setNewAccBal] = useState('');
  const [newAccGoal, setNewAccGoal] = useState('');

  // New tag form
  const [newTagLabel, setNewTagLabel] = useState('');

  // Editing
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Account>>({});

  const createAccount = async () => {
    if (!newAccName.trim()) return;
    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newAccName,
        account_type: newAccType,
        initial_balance: Number(newAccBal) || 0,
        goal: Number(newAccGoal) || 0,
      }),
    });
    if (res.ok) {
      const account = await res.json();
      setAccounts([...accounts, account]);
      setNewAccName(''); setNewAccBal(''); setNewAccGoal('');
      toast.success('Account created!');
      router.refresh();
    } else {
      toast.error('Failed to create account');
    }
  };

  const deleteAccount = async (id: string) => {
    if (!confirm('Delete this account and all its trades?')) return;
    await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
    setAccounts(accounts.filter((a) => a.id !== id));
    toast.success('Account deleted');
    router.refresh();
  };

  const saveAccount = async (id: string) => {
    const res = await fetch(`/api/accounts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editValues),
    });
    if (res.ok) {
      const updated = await res.json();
      setAccounts(accounts.map((a) => a.id === id ? updated : a));
      setEditingAccount(null);
      toast.success('Account updated!');
      router.refresh();
    } else {
      toast.error('Failed to update account');
    }
  };

  const createTag = async () => {
    if (!newTagLabel.trim()) return;
    const res = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: newTagLabel, color: 'indigo' }),
    });
    if (res.ok) {
      const tag = await res.json();
      setTags([...tags, tag]);
      setNewTagLabel('');
      toast.success('Tag created!');
    }
  };

  const deleteTag = async (id: string) => {
    await fetch(`/api/tags?id=${id}`, { method: 'DELETE' });
    setTags(tags.filter((t) => t.id !== id));
    toast.success('Tag deleted');
  };

  return (
    <div className="space-y-8">
      {/* Accounts */}
      <section>
        <h2 className="text-sm font-semibold text-[#e8e8e8] mb-4">Accounts</h2>
        <div className="bg-[#202020] border border-[#2a2a2a] rounded-xl overflow-hidden">
          {accounts.length === 0 ? (
            <p className="px-4 py-6 text-xs text-[#3a3a3a] text-center">No accounts. Create one below.</p>
          ) : (
            <table className="w-full text-xs">
              <thead className="border-b border-[#2a2a2a] bg-[#191919]">
                <tr>
                  {['Name', 'Type', 'Initial Balance', 'Goal', ''].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-[#4a4a4a] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                {accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-[#252525] transition-colors">
                    <td className="px-4 py-3">
                      {editingAccount === acc.id ? (
                        <input value={editValues.name ?? acc.name} onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                          className={`${inputClass} w-32`} />
                      ) : (
                        <span className="font-medium text-[#e8e8e8]">{acc.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingAccount === acc.id ? (
                        <select value={editValues.account_type ?? acc.account_type}
                          onChange={(e) => setEditValues({ ...editValues, account_type: e.target.value as 'backtest' | 'live' })}
                          className={inputClass}>
                          <option value="live">Live</option>
                          <option value="backtest">Backtest</option>
                        </select>
                      ) : (
                        <span className={`pill border ${acc.account_type === 'backtest' ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/40' : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40'}`}>
                          {acc.account_type === 'backtest' ? 'Backtest' : 'Live'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#a0a0a0]">
                      {editingAccount === acc.id ? (
                        <input type="number" value={editValues.initial_balance ?? acc.initial_balance}
                          onChange={(e) => setEditValues({ ...editValues, initial_balance: Number(e.target.value) })}
                          className={`${inputClass} w-28`} />
                      ) : `$${acc.initial_balance.toLocaleString()}`}
                    </td>
                    <td className="px-4 py-3 text-[#a0a0a0]">
                      {editingAccount === acc.id ? (
                        <input type="number" value={editValues.goal ?? acc.goal}
                          onChange={(e) => setEditValues({ ...editValues, goal: Number(e.target.value) })}
                          className={`${inputClass} w-28`} />
                      ) : acc.goal > 0 ? `$${acc.goal.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 justify-end">
                        {editingAccount === acc.id ? (
                          <>
                            <button onClick={() => saveAccount(acc.id)} className="p-1.5 bg-emerald-950/40 text-emerald-400 rounded-md hover:bg-emerald-950/60">
                              <Check className="w-3 h-3" />
                            </button>
                            <button onClick={() => setEditingAccount(null)} className="p-1.5 bg-[#2a2a2a] text-[#737373] rounded-md hover:bg-[#333]">
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditingAccount(acc.id); setEditValues(acc); }}
                              className="p-1.5 text-[#4a4a4a] hover:text-[#e8e8e8] hover:bg-[#2a2a2a] rounded-md transition-colors">
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button onClick={() => deleteAccount(acc.id)}
                              className="p-1.5 text-[#4a4a4a] hover:text-red-400 hover:bg-red-950/40 rounded-md transition-colors">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* New account form */}
          <div className="border-t border-[#2a2a2a] p-4 bg-[#191919]">
            <p className="text-[10px] font-semibold text-[#4a4a4a] uppercase tracking-wide mb-2">New Account</p>
            <div className="flex flex-wrap gap-2">
              <input value={newAccName} onChange={(e) => setNewAccName(e.target.value)}
                placeholder="Account name" className={`${inputClass} flex-1 min-w-32`} />
              <select value={newAccType} onChange={(e) => setNewAccType(e.target.value as 'backtest' | 'live')} className={inputClass}>
                <option value="live">Live</option>
                <option value="backtest">Backtest</option>
              </select>
              <input type="number" value={newAccBal} onChange={(e) => setNewAccBal(e.target.value)}
                placeholder="Initial balance" className={`${inputClass} w-32`} />
              <input type="number" value={newAccGoal} onChange={(e) => setNewAccGoal(e.target.value)}
                placeholder="Goal (optional)" className={`${inputClass} w-32`} />
              <button onClick={createAccount}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Confluence Tags */}
      <section>
        <h2 className="text-sm font-semibold text-[#e8e8e8] mb-4">Confluence Tags</h2>
        <div className="bg-[#202020] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.length === 0 ? (
              <p className="text-xs text-[#3a3a3a]">No tags yet.</p>
            ) : (
              tags.map((tag) => (
                <div key={tag.id} className="tag-pill-selected">
                  {tag.label}
                  <button onClick={() => deleteTag(tag.id)} className="ml-1 hover:text-red-400 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <input value={newTagLabel} onChange={(e) => setNewTagLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createTag()}
              placeholder="Add tag..." className={`${inputClass} flex-1`} />
            <button onClick={createTag}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>
      </section>

      {/* Export */}
      <section>
        <h2 className="text-sm font-semibold text-[#e8e8e8] mb-4">Data</h2>
        <div className="bg-[#202020] border border-[#2a2a2a] rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#a0a0a0] font-medium">Export all trades</p>
            <p className="text-[10px] text-[#4a4a4a] mt-0.5">Download a CSV of your entire trade history</p>
          </div>
          <a href="/api/export"
            className="bg-[#252525] hover:bg-[#2a2a2a] border border-[#2a2a2a] text-[#a0a0a0] hover:text-[#e8e8e8] text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
            Export CSV
          </a>
        </div>
      </section>
    </div>
  );
}
