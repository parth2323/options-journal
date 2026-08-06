'use client';

import { useState } from 'react';
import { Account, ConfluenceTag } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  User,
  ShieldCheck,
  Key,
  LogOut,
  CreditCard,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Clock,
  Zap,
  Tag,
  Bot,
  Sparkles,
  Download,
  Database,
  Sliders,
  AlertOctagon,
  Flame,
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

interface SettingsDashboardProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: { full_name?: string; avatar_url?: string };
  } | null;
  accounts: Account[];
  tags: ConfluenceTag[];
}

type TabType = 'profile' | 'accounts' | 'routine' | 'tags' | 'coach' | 'data';

export function SettingsDashboard({ user, accounts: initialAccounts, tags: initialTags }: SettingsDashboardProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  // Account management state
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<'backtest' | 'live'>('live');
  const [newAccBal, setNewAccBal] = useState('');
  const [newAccGoal, setNewAccGoal] = useState('');
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Account>>({});

  // Tag management state
  const [tags, setTags] = useState<ConfluenceTag[]>(initialTags);
  const [newTagLabel, setNewTagLabel] = useState('');
  const [newTagColor, setNewTagColor] = useState('indigo');

  // Routine & Coach Preferences state
  const [maxRiskPercent, setMaxRiskPercent] = useState('2.0');
  const [enableBlackoutWarning, setEnableBlackoutWarning] = useState(true);
  const [coachPersona, setCoachPersona] = useState('elite_options_coach');

  // ── Account Actions ────────────────────────────────────────────────────────
  const createAccount = async () => {
    if (!newAccName.trim()) return;
    try {
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
        toast.success('Trading account created!');
        router.refresh();
      } else {
        toast.error('Failed to create account');
      }
    } catch {
      toast.error('Error creating account');
    }
  };

  const deleteAccount = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account and its trades?')) return;
    try {
      await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
      setAccounts(accounts.filter((a) => a.id !== id));
      toast.success('Account deleted');
      router.refresh();
    } catch {
      toast.error('Error deleting account');
    }
  };

  const saveAccount = async (id: string) => {
    try {
      const res = await fetch(`/api/accounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues),
      });
      if (res.ok) {
        const updated = await res.json();
        setAccounts(accounts.map((a) => (a.id === id ? updated : a)));
        setEditingAccount(null);
        toast.success('Account updated!');
        router.refresh();
      }
    } catch {
      toast.error('Failed to update account');
    }
  };

  // ── Tag Actions ────────────────────────────────────────────────────────────
  const createTag = async () => {
    if (!newTagLabel.trim()) return;
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newTagLabel, color: newTagColor }),
      });
      if (res.ok) {
        const tag = await res.json();
        setTags([...tags, tag]);
        setNewTagLabel('');
        toast.success('Confluence tag added!');
      }
    } catch {
      toast.error('Failed to add tag');
    }
  };

  const deleteTag = async (id: string) => {
    try {
      await fetch(`/api/tags?id=${id}`, { method: 'DELETE' });
      setTags(tags.filter((t) => t.id !== id));
      toast.success('Tag removed');
    } catch {
      toast.error('Failed to remove tag');
    }
  };

  // ── Auth Actions ───────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    router.push('/login');
    router.refresh();
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password reset email sent!');
    }
  };

  const inputClass =
    'bg-white border border-slate-200 text-slate-900 dark:bg-[#191924] dark:border-[#2a2a3c] dark:text-[#e8e8e8] text-xs font-bold rounded-xl px-3.5 py-2 focus:outline-none focus:border-indigo-600 transition-all';

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/80 dark:bg-[#12121a] dark:border-[#1e1e2d] rounded-2xl p-5 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            System & Journal Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Manage your account security, trading accounts, SPY routine defaults, and AI coach options.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            Multi-Tenant Privacy Active
          </span>
        </div>
      </div>

      {/* ── Tabbed Navigation Bar ───────────────────────────────────────────── */}
      <div className="flex border-b border-slate-200 dark:border-[#1e1e2d] overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <User className="w-4 h-4" /> Account & Security
        </button>
        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'accounts'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Trading Accounts ({accounts.length})
        </button>
        <button
          onClick={() => setActiveTab('routine')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'routine'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" /> SPY Routine Defaults
        </button>
        <button
          onClick={() => setActiveTab('tags')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'tags'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Tag className="w-4 h-4" /> Confluence Tags ({tags.length})
        </button>
        <button
          onClick={() => setActiveTab('coach')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'coach'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4" /> AI Coach Persona
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'data'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" /> Data & Export
        </button>
      </div>

      {/* ── TAB 1: PROFILE & SECURITY ───────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 shadow-sm dark:bg-[#12121a] dark:border-[#1e1e2d] rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-[#1c1c2b] pb-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Authenticated Trader'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">
                  {user?.email || 'parthsep12@gmail.com'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-500/20">
                    UID: {user?.id ? `${user.id.slice(0, 8)}...` : 'c291e1bf...'}
                  </span>
                </div>
              </div>
            </div>

            {/* Security Badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-[#161622] border border-slate-200 dark:border-[#1e1e2d] rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Row Level Security (RLS) Policy</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                  Your trades, chart observations, and accounts are isolated under <code className="font-mono text-indigo-600 dark:text-indigo-400">auth.uid() = user_id</code>. Friends and outside accounts cannot access your data.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-[#161622] border border-slate-200 dark:border-[#1e1e2d] rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs">
                  <Key className="w-4 h-4" />
                  <span>JWT Auth Session Token</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                  Authenticated via Supabase SSR Cookies. Sessions refresh automatically for secure cross-device sync.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={handlePasswordReset}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-[#1f1f2e] border border-slate-200 dark:border-[#2a2a3e] text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#28283d] rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Key className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Send Password Reset Email
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60 hover:bg-red-100 rounded-xl text-xs font-bold transition-all cursor-pointer ml-auto"
              >
                <LogOut className="w-4 h-4" />
                Log Out of Journal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: TRADING ACCOUNTS ─────────────────────────────────────────── */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 shadow-sm dark:bg-[#12121a] dark:border-[#1e1e2d] rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Trading Accounts Manager
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Track live execution accounts vs backtesting sandboxes.
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-200 dark:border-[#1e1e2d] rounded-xl">
              <table className="w-full text-xs">
                <thead className="border-b border-slate-200 dark:border-[#1e1e2d] bg-slate-50 dark:bg-[#161622]">
                  <tr>
                    {['Account Name', 'Type', 'Initial Balance', 'Profit Goal', 'Actions'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#1e1e2d]">
                  {accounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50 dark:hover:bg-[#161622] transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        {editingAccount === acc.id ? (
                          <input
                            value={editValues.name ?? acc.name}
                            onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                            className={inputClass}
                          />
                        ) : (
                          acc.name
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                            acc.account_type === 'backtest'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/40'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40'
                          }`}
                        >
                          {acc.account_type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        ${acc.initial_balance.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {acc.goal > 0 ? `$${acc.goal.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {editingAccount === acc.id ? (
                            <>
                              <button
                                onClick={() => saveAccount(acc.id)}
                                className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingAccount(null)}
                                className="p-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingAccount(acc.id);
                                  setEditValues(acc);
                                }}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-[#1f1f2e] rounded-lg transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteAccount(acc.id)}
                                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Create Form */}
            <div className="bg-slate-50/80 border border-slate-200 dark:bg-[#161622] dark:border-[#1e1e2d] rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Create New Trading Account
              </h4>
              <div className="flex flex-wrap gap-2.5">
                <input
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  placeholder="Account Name (e.g. SPY Live 50k)"
                  className={`${inputClass} flex-1 min-w-[180px]`}
                />
                <select
                  value={newAccType}
                  onChange={(e) => setNewAccType(e.target.value as 'backtest' | 'live')}
                  className={inputClass}
                >
                  <option value="live">Live Execution</option>
                  <option value="backtest">Backtest Sandbox</option>
                </select>
                <input
                  type="number"
                  value={newAccBal}
                  onChange={(e) => setNewAccBal(e.target.value)}
                  placeholder="Initial Balance ($)"
                  className={`${inputClass} w-36`}
                />
                <input
                  type="number"
                  value={newAccGoal}
                  onChange={(e) => setNewAccGoal(e.target.value)}
                  placeholder="Target Goal ($)"
                  className={`${inputClass} w-36`}
                />
                <button
                  onClick={createAccount}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: SPY ROUTINE DEFAULTS ─────────────────────────────────────── */}
      {activeTab === 'routine' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 shadow-sm dark:bg-[#12121a] dark:border-[#1e1e2d] rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                SPY Routine Execution Defaults
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Configure primary session timing and news blackout warnings.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-[#161622] border border-slate-200 dark:border-[#1e1e2d] rounded-xl">
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">
                    9:55 AM Sticky Note Rule Warning
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    Display mandatory blackout warning when Tier-1 economic data is scheduled at 10:00 AM EST.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={enableBlackoutWarning}
                  onChange={(e) => setEnableBlackoutWarning(e.target.checked)}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              <div className="p-4 bg-slate-50 dark:bg-[#161622] border border-slate-200 dark:border-[#1e1e2d] rounded-xl space-y-2">
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  Default Timezone Protocol
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  America/New_York (EST) for NYSE/Cboe options market hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: CONFLUENCE TAGS MANAGER ─────────────────────────────────── */}
      {activeTab === 'tags' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 shadow-sm dark:bg-[#12121a] dark:border-[#1e1e2d] rounded-2xl p-6 space-y-5">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Strategy & Confluence Setup Manager
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Add setup tags (e.g. VWAP reclaim, ORB 5-min, Supply Zone rejection).
              </p>
            </div>

            {/* Tag Pills Grid */}
            <div className="flex flex-wrap gap-2.5 p-4 bg-slate-50 dark:bg-[#161622] border border-slate-200 dark:border-[#1e1e2d] rounded-xl">
              {tags.length === 0 ? (
                <p className="text-xs text-slate-500 font-medium">No custom tags created yet.</p>
              ) : (
                tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/40 shadow-xs"
                  >
                    {tag.label}
                    <button
                      onClick={() => deleteTag(tag.id)}
                      className="hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add Tag */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <input
                value={newTagLabel}
                onChange={(e) => setNewTagLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createTag()}
                placeholder="New setup tag (e.g. 10:00 AM Reversal)"
                className={`${inputClass} flex-1 min-w-[200px]`}
              />
              <button
                onClick={createTag}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Tag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: AI COACH PERSONA ─────────────────────────────────────────── */}
      {activeTab === 'coach' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 shadow-sm dark:bg-[#12121a] dark:border-[#1e1e2d] rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                AI Coach & DeepSeek Intelligence Configuration
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Configure your options mentor persona and quantitative sensitivity rules.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-[#161622] border border-slate-200 dark:border-[#1e1e2d] rounded-xl space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/20">
                  Active Persona
                </span>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Elite US SPY / QQQ Options Trader
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                  Focuses on capital preservation, win rate consistency, risk:reward multiples, and cutting tail losses immediately.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-[#161622] border border-slate-200 dark:border-[#1e1e2d] rounded-xl space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/20">
                  Leak Threshold Rule
                </span>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  2.0x Average Loss Cap
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                  Automatically flags any single loss exceeding 2.0x your average losing trade as an avoidable capital leak.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 6: DATA EXPORT & BACKUP ─────────────────────────────────────── */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 shadow-sm dark:bg-[#12121a] dark:border-[#1e1e2d] rounded-2xl p-6 space-y-5">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Data Management & CSV Export
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Export your full trade history for Excel, Google Sheets, or local backups.
              </p>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-[#161622] border border-slate-200 dark:border-[#1e1e2d] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Export Trade History (CSV)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-0.5">
                  Includes symbols, contract specs, gross PnL, commissions, net PnL, and setup confluences.
                </p>
              </div>
              <a
                href="/api/export"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-xs self-start sm:self-auto cursor-pointer"
              >
                <Download className="w-4 h-4" /> Export CSV
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
