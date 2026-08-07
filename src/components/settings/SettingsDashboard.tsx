'use client';

import { useState } from 'react';
import {
  Account,
  ConfluenceTag,
  CoachPreferences,
  CoachPersona,
  CoachTone,
  CoachModel,
  CoachFocusArea,
  DEFAULT_COACH_PREFS,
  UserProfile,
  SecurityAuditLog,
  DEFAULT_USER_PROFILE,
} from '@/lib/types';
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
  Target,
  ShieldAlert,
  BrainCircuit,
  TrendingUp,
  RotateCcw,
  Save,
  Loader2,
  CheckCircle2,
  HelpCircle,
  Cpu,
  Globe,
  DollarSign,
  Lock,
  Laptop,
  Activity,
  AlertTriangle,
  FileText,
  Copy,
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
  initialCoachPrefs?: CoachPreferences;
  initialUserProfile?: UserProfile | null;
  initialSecurityLogs?: SecurityAuditLog[];
}

type TabType = 'profile' | 'accounts' | 'routine' | 'tags' | 'coach' | 'data';

export function SettingsDashboard({
  user,
  accounts: initialAccounts,
  tags: initialTags,
  initialCoachPrefs,
  initialUserProfile,
  initialSecurityLogs = [],
}: SettingsDashboardProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  // Profile & Identity state
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({
    full_name: initialUserProfile?.full_name ?? user?.user_metadata?.full_name ?? '',
    trader_handle: initialUserProfile?.trader_handle ?? '',
    preferred_timezone: initialUserProfile?.preferred_timezone ?? DEFAULT_USER_PROFILE.preferred_timezone,
    preferred_currency: initialUserProfile?.preferred_currency ?? DEFAULT_USER_PROFILE.preferred_currency,
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // In-app Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Security Audit & Sessions state
  const [securityLogs, setSecurityLogs] = useState<SecurityAuditLog[]>(initialSecurityLogs);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Account management state
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<'backtest' | 'live'>('live');
  const [newAccBal, setNewAccBal] = useState('');
  const [newAccGoal, setNewAccGoal] = useState('');
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Account>>({});

  // ── Profile Actions ────────────────────────────────────────────────────────
  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userProfile),
      });
      if (res.ok) {
        const updated = await res.json();
        setUserProfile(updated);
        toast.success('Profile & Market Preferences updated!');
        router.refresh();
      } else {
        toast.error('Failed to update profile');
      }
    } catch {
      toast.error('Error updating profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Password Actions ───────────────────────────────────────────────────────
  const handleUpdatePasswordInApp = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Password updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data.error || 'Failed to update password');
      }
    } catch {
      toast.error('Error updating password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  // ── Session & Danger Zone Actions ─────────────────────────────────────────
  const handleRevokeOtherSessions = async () => {
    try {
      await supabase.auth.signOut({ scope: 'others' });
      toast.success('All other devices have been signed out!');
    } catch {
      toast.error('Failed to revoke sessions');
    }
  };

  const handleDeleteUserAccount = async () => {
    if (deleteInput !== 'DELETE MY ACCOUNT') return;
    setDeletingAccount(true);
    try {
      const res = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: deleteInput }),
      });
      if (res.ok) {
        toast.success('Account and all data deleted');
        router.push('/login');
        router.refresh();
      } else {
        toast.error('Failed to delete account');
      }
    } catch {
      toast.error('Error executing account deletion');
    } finally {
      setDeletingAccount(false);
    }
  };

  // Tag management state
  const [tags, setTags] = useState<ConfluenceTag[]>(initialTags);
  const [newTagLabel, setNewTagLabel] = useState('');
  const [newTagColor, setNewTagColor] = useState('indigo');

  // Routine & Coach Preferences state
  const [enableBlackoutWarning, setEnableBlackoutWarning] = useState(true);
  const [coachPrefs, setCoachPrefs] = useState<CoachPreferences>(
    initialCoachPrefs ?? DEFAULT_COACH_PREFS
  );
  const [savingCoachPrefs, setSavingCoachPrefs] = useState(false);

  const saveCoachPrefs = async (prefsToSave = coachPrefs) => {
    setSavingCoachPrefs(true);
    try {
      const res = await fetch('/api/coach/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefsToSave),
      });

      if (res.ok) {
        const updated = await res.json();
        setCoachPrefs(updated);
        toast.success('AI Coach preferences saved successfully!');
        router.refresh();
      } else {
        toast.error('Failed to save AI Coach preferences');
      }
    } catch {
      toast.error('Error connecting to server');
    } finally {
      setSavingCoachPrefs(false);
    }
  };

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

      {/* ── TAB 1: PROFILE & SECURITY (FAANG-Grade) ─────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* SECTION 1: Trader Identity & Market Preferences */}
          <div className="bg-white border border-slate-200/90 shadow-sm dark:bg-[#12121a] dark:border-[#1e1e2d] rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1c1c2b] pb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                  {userProfile.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    {userProfile.full_name || user?.user_metadata?.full_name || 'Authenticated Trader'}
                    {userProfile.trader_handle && (
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/20">
                        {userProfile.trader_handle.startsWith('@') ? userProfile.trader_handle : `@${userProfile.trader_handle}`}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium mt-0.5">
                    {user?.email || 'authenticated_user@domain.com'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-500/20">
                  UID: {user?.id ? `${user.id.slice(0, 8)}...` : 'c291e1bf...'}
                </span>
              </div>
            </div>

            {/* Profile Form */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-500" />
                Trader Identity & Regional Defaults
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Display / Full Name
                  </label>
                  <input
                    value={userProfile.full_name ?? ''}
                    onChange={(e) => setUserProfile({ ...userProfile, full_name: e.target.value })}
                    placeholder="Parth Patel"
                    className={inputClass}
                  />
                </div>

                {/* Trader Handle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Trader Alias / Handle
                  </label>
                  <input
                    value={userProfile.trader_handle ?? ''}
                    onChange={(e) => setUserProfile({ ...userProfile, trader_handle: e.target.value })}
                    placeholder="@parth_options"
                    className={inputClass}
                  />
                </div>

                {/* Market Timezone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-indigo-500" />
                    Market Timezone Protocol
                  </label>
                  <select
                    value={userProfile.preferred_timezone ?? 'America/New_York'}
                    onChange={(e) => setUserProfile({ ...userProfile, preferred_timezone: e.target.value })}
                    className={inputClass}
                  >
                    <option value="America/New_York">America/New_York (EST / NYSE Hours)</option>
                    <option value="America/Chicago">America/Chicago (CST / CME Futures)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                    <option value="Europe/London">Europe/London (GMT / LSE)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                  </select>
                </div>

                {/* Currency Symbol */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    Base Display Currency
                  </label>
                  <select
                    value={userProfile.preferred_currency ?? 'USD'}
                    onChange={(e) => setUserProfile({ ...userProfile, preferred_currency: e.target.value })}
                    className={inputClass}
                  >
                    <option value="USD">USD ($ United States Dollar)</option>
                    <option value="EUR">EUR (€ Euro)</option>
                    <option value="GBP">GBP (£ British Pound)</option>
                    <option value="CAD">CAD ($ Canadian Dollar)</option>
                    <option value="AUD">AUD ($ Australian Dollar)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={savingProfile}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Identity Profile
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: Password & Authentication Control */}
          <div className="bg-white border border-slate-200/90 shadow-sm dark:bg-[#12121a] dark:border-[#1e1e2d] rounded-2xl p-6 space-y-6">
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-indigo-500" />
                2. Authentication Credentials & Security
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Update your account password in-app or manage connected authentication providers.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* In-App Password Update */}
              <div className="p-4 bg-slate-50 dark:bg-[#161622] border border-slate-200 dark:border-[#1e1e2d] rounded-xl space-y-3">
                <h5 className="text-xs font-black text-slate-900 dark:text-white">
                  Update Account Password (In-App)
                </h5>

                <div className="space-y-2">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password (min. 6 characters)"
                    className={inputClass}
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm New Password"
                    className={inputClass}
                  />
                </div>

                {newPassword.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-500">Password Strength:</span>
                      <span className={newPassword.length >= 8 ? 'text-emerald-500' : 'text-amber-500'}>
                        {newPassword.length >= 10 ? 'Strong 💪' : newPassword.length >= 6 ? 'Moderate ⚖️' : 'Weak ⚠️'}
                      </span>
                    </div>
                    <div className="h-1 bg-slate-200 dark:bg-[#252535] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          newPassword.length >= 10 ? 'bg-emerald-500 w-full' : newPassword.length >= 6 ? 'bg-amber-500 w-2/3' : 'bg-red-500 w-1/3'
                        }`}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleUpdatePasswordInApp}
                  disabled={updatingPassword || !newPassword}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-xs w-full justify-center cursor-pointer"
                >
                  {updatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                  Update Password
                </button>
              </div>

              {/* Connected OAuth Providers */}
              <div className="p-4 bg-slate-50 dark:bg-[#161622] border border-slate-200 dark:border-[#1e1e2d] rounded-xl space-y-4 flex flex-col justify-between">
                <div>
                  <h5 className="text-xs font-black text-slate-900 dark:text-white mb-2">
                    Connected Authentication Providers
                  </h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-[#12121a] border border-slate-200 dark:border-[#1e1e2d] rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-md bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 flex items-center justify-center font-bold text-xs">
                          G
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">Google OAuth</p>
                          <p className="text-[10px] text-slate-500">{user?.email || 'Linked'}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                        Connected ✅
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-[#12121a] border border-slate-200 dark:border-[#1e1e2d] rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <Key className="w-5 h-5 text-indigo-500" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">Email & Password</p>
                          <p className="text-[10px] text-slate-500">Supabase Auth</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/20">
                        Active 🔑
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#12121a] border border-slate-200 dark:border-[#2a2a3e] text-slate-800 dark:text-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all justify-center cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-indigo-500" />
                  Send Password Reset Email
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 3: Active Device Sessions & Security Audit Logs */}
          <div className="bg-white border border-slate-200/90 shadow-sm dark:bg-[#12121a] dark:border-[#1e1e2d] rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Laptop className="w-4 h-4 text-indigo-500" />
                  3. Active Sessions & Security Operations
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Monitor active device connections and review security activity.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRevokeOtherSessions}
                className="flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 px-3 py-1.5 rounded-xl hover:bg-red-100 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out Other Devices
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-[#161622] border border-slate-200 dark:border-[#1e1e2d] rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Row Level Security (RLS) Active</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                  Your trades, chart observations, and accounts are isolated under <code className="font-mono text-indigo-600 dark:text-indigo-400">auth.uid() = user_id</code>.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-[#161622] border border-slate-200 dark:border-[#1e1e2d] rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs">
                  <Key className="w-4 h-4" />
                  <span>JWT Auth Cookie Session</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                  Authenticated via Supabase SSR Cookies. Sessions refresh automatically across browser tabs.
                </p>
              </div>
            </div>

            {/* Security Audit Log List */}
            {securityLogs.length > 0 && (
              <div className="space-y-2 pt-2">
                <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-500" />
                  Recent Security Activity
                </h5>
                <div className="divide-y divide-slate-200 dark:divide-[#1e1e2d] border border-slate-200 dark:border-[#1e1e2d] rounded-xl bg-slate-50 dark:bg-[#161622]">
                  {securityLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{log.description}</p>
                        <p className="text-[10px] text-slate-500 capitalize">{log.event_type.replace('_', ' ')}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: Danger Zone & Account Deletion */}
          <div className="bg-red-50/50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/40 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="text-sm font-black uppercase tracking-wider">Danger Zone — Danger Controls</h4>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 px-3.5 py-2 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 text-xs font-bold rounded-xl hover:bg-red-200 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Log Out of Journal
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
              Permanently purge your user account, trading records, journal entries, and saved settings from Supabase.
            </p>

            <div className="flex items-center justify-between pt-2">
              <a
                href="/api/export"
                className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors"
              >
                <Download className="w-4 h-4" /> Download Backup CSV before deleting
              </a>

              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Delete Account...
              </button>
            </div>
          </div>

          {/* Delete Account Modal */}
          {deleteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-[#1e1e2d] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-6 h-6" />
                  <h3 className="text-base font-black">Confirm Account Deletion</h3>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                  This action is <strong className="text-red-600 dark:text-red-400">irreversible</strong>. All your trades, accounts, pre-market routine, and AI coach history will be permanently erased.
                </p>

                <div className="space-y-2 bg-slate-50 dark:bg-[#161622] p-3 rounded-xl border border-slate-200 dark:border-[#1e1e2d]">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Type <code className="font-mono text-red-600 font-bold">DELETE MY ACCOUNT</code> to confirm:
                  </label>
                  <input
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value)}
                    placeholder="DELETE MY ACCOUNT"
                    className={inputClass}
                  />
                </div>

                <div className="flex gap-2 pt-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteModalOpen(false);
                      setDeleteInput('');
                    }}
                    className="px-4 py-2 bg-slate-100 dark:bg-[#1f1f2e] text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteUserAccount}
                    disabled={deleteInput !== 'DELETE MY ACCOUNT' || deletingAccount}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    {deletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Permanently Delete
                  </button>
                </div>
              </div>
            </div>
          )}
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

      {/* ── TAB 5: AI COACH & DEEPSEEK CONFIGURATION ────────────────────────── */}
      {activeTab === 'coach' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 shadow-sm dark:bg-[#12121a] dark:border-[#1e1e2d] rounded-2xl p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1e1e2d] pb-5">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  AI Coach & DeepSeek Intelligence Configuration
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Customize mentor personality, quantitative risk thresholds, and AI reasoning parameters.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setCoachPrefs(DEFAULT_COACH_PREFS);
                    saveCoachPrefs(DEFAULT_COACH_PREFS);
                  }}
                  disabled={savingCoachPrefs}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#1f1f2e] border border-slate-200 dark:border-[#2a2a3e] rounded-xl transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={() => saveCoachPrefs()}
                  disabled={savingCoachPrefs}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  {savingCoachPrefs ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Preferences
                </button>
              </div>
            </div>

            {/* SECTION 1: Persona Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  1. Select Active Mentor Persona
                </h4>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  1 Active at a Time
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  {
                    id: 'elite_options_coach' as CoachPersona,
                    title: 'Elite Options Mentor',
                    subtitle: 'SPY & QQQ Core Specialist',
                    desc: 'Focuses on capital preservation, probability, risk:reward ratios, and cutting tail losses immediately.',
                    icon: Target,
                    color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30',
                  },
                  {
                    id: 'scalper_coach' as CoachPersona,
                    title: '0DTE & Micro Scalper',
                    subtitle: 'Intraday Speed & Precision',
                    desc: 'Focuses on sub-5m execution speed, micro price action, ultra-tight stops, and fast profit taking.',
                    icon: Zap,
                    color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30',
                  },
                  {
                    id: 'swing_trader' as CoachPersona,
                    title: 'Swing Options Master',
                    subtitle: 'Multi-Day & Theta Cycles',
                    desc: 'Focuses on trend alignment, theta decay management, delta expansion, and multi-day holds.',
                    icon: TrendingUp,
                    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30',
                  },
                  {
                    id: 'risk_manager' as CoachPersona,
                    title: 'Prop Firm Risk Officer',
                    subtitle: 'Capital Protection Focus',
                    desc: 'Focuses on strict position sizing limits, drawdown caps, loss multipliers, and mathematical edge.',
                    icon: ShieldAlert,
                    color: 'text-red-500 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30',
                  },
                  {
                    id: 'psychologist' as CoachPersona,
                    title: 'Performance Psychologist',
                    subtitle: 'Behavioral & Mental Edge',
                    desc: 'Focuses on emotional discipline, overtrading, FOMO prevention, and building mental frameworks.',
                    icon: BrainCircuit,
                    color: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30',
                  },
                ].map((p) => {
                  const Icon = p.icon;
                  const isSelected = coachPrefs.persona === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setCoachPrefs({ ...coachPrefs, persona: p.id })}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? 'bg-indigo-50/70 border-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                          : 'bg-slate-50 dark:bg-[#161622] border-slate-200 dark:border-[#1e1e2d] hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className={`p-2 rounded-lg border ${p.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          )}
                        </div>
                        <h5 className="text-xs font-black text-slate-900 dark:text-white">
                          {p.title}
                        </h5>
                        <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mb-1.5">
                          {p.subtitle}
                        </p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          {p.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 2: Tone & Communication Style */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                2. Coaching Feedback Tone
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'tough_love' as CoachTone,
                    label: 'Tough Love 🔥',
                    desc: 'Direct, unfiltered, brutally honest. Zero sugarcoating.',
                  },
                  {
                    id: 'balanced' as CoachTone,
                    label: 'Balanced 🎯',
                    desc: 'Objective, fair, constructive, evidence-backed.',
                  },
                  {
                    id: 'encouraging' as CoachTone,
                    label: 'Encouraging 🌱',
                    desc: 'Supportive, growth-oriented, motivating framing.',
                  },
                ].map((t) => {
                  const isSelected = coachPrefs.tone === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setCoachPrefs({ ...coachPrefs, tone: t.id })}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-500 font-bold'
                          : 'bg-slate-50 dark:bg-[#161622] border-slate-200 dark:border-[#1e1e2d] hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {t.label}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                        {t.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: DeepSeek Model Choice */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-500" />
                  3. DeepSeek Intelligence Model
                </h4>
                <span className="text-[10px] text-slate-400 font-medium">
                  Select reasoning depth vs response speed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'deepseek-chat' as CoachModel,
                    title: 'DeepSeek Chat (V3)',
                    tag: 'Fast & Efficient',
                    desc: 'Standard high-speed JSON model. Best for instant daily reports and routine feedback.',
                    badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
                  },
                  {
                    id: 'deepseek-reasoner' as CoachModel,
                    title: 'DeepSeek Reasoner (R1)',
                    tag: 'Deep Reasoning',
                    desc: 'Chain-of-thought model. Deeper statistical pattern matching and thorough leak identification.',
                    badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
                  },
                ].map((m) => {
                  const isSelected = coachPrefs.model === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setCoachPrefs({ ...coachPrefs, model: m.id })}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-500 ring-1 ring-indigo-500'
                          : 'bg-slate-50 dark:bg-[#161622] border-slate-200 dark:border-[#1e1e2d] hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {m.title}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${m.badgeColor}`}>
                          {m.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                        {m.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 4: Quantitative Sensitivity Controls */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                4. Quantitative Rules & AI Sensitivity
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Slider 1: Leak Threshold */}
                <div className="p-4 bg-slate-50 dark:bg-[#161622] border border-slate-200 dark:border-[#1e1e2d] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-900 dark:text-white">
                      Capital Leak Threshold Multiplier
                    </label>
                    <span className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-500/20">
                      {coachPrefs.leakMultiplier.toFixed(1)}x Avg Loss
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.1"
                    value={coachPrefs.leakMultiplier}
                    onChange={(e) =>
                      setCoachPrefs({
                        ...coachPrefs,
                        leakMultiplier: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Losses exceeding <strong className="text-slate-700 dark:text-slate-200">{coachPrefs.leakMultiplier.toFixed(1)}x</strong> your average loss will be flagged as avoidable capital leaks.
                  </p>
                </div>

                {/* Slider 2: Max Risk Target */}
                <div className="p-4 bg-slate-50 dark:bg-[#161622] border border-slate-200 dark:border-[#1e1e2d] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-900 dark:text-white">
                      Max Risk Target Per Trade
                    </label>
                    <span className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-500/20">
                      {coachPrefs.maxRiskPercent.toFixed(1)}% Account
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="10.0"
                    step="0.5"
                    value={coachPrefs.maxRiskPercent}
                    onChange={(e) =>
                      setCoachPrefs({
                        ...coachPrefs,
                        maxRiskPercent: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    The AI coach references this <strong className="text-slate-700 dark:text-slate-200">{coachPrefs.maxRiskPercent.toFixed(1)}%</strong> cap when evaluating position sizing discipline.
                  </p>
                </div>

                {/* Slider 3: Temperature */}
                <div className="p-4 bg-slate-50 dark:bg-[#161622] border border-slate-200 dark:border-[#1e1e2d] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-900 dark:text-white">
                      AI Temperature (Creativity)
                    </label>
                    <span className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-500/20">
                      {coachPrefs.temperature.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={coachPrefs.temperature}
                    onChange={(e) =>
                      setCoachPrefs({
                        ...coachPrefs,
                        temperature: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {coachPrefs.temperature <= 0.3
                      ? '🎯 Low (0.0 - 0.3): Precise, deterministic, strictly math-focused.'
                      : coachPrefs.temperature <= 0.7
                      ? '⚖️ Medium (0.4 - 0.7): Balanced analytical & intuitive insights.'
                      : '🎨 High (0.8 - 1.0): Highly creative & exploratory narrative coaching.'}
                  </p>
                </div>

                {/* Slider 4: Trade Sample Size */}
                <div className="p-4 bg-slate-50 dark:bg-[#161622] border border-slate-200 dark:border-[#1e1e2d] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-900 dark:text-white">
                      Trade Sampling Window
                    </label>
                    <span className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-500/20">
                      {coachPrefs.tradeSampleSize} Recent Trades
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={coachPrefs.tradeSampleSize}
                    onChange={(e) =>
                      setCoachPrefs({
                        ...coachPrefs,
                        tradeSampleSize: parseInt(e.target.value),
                      })
                    }
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Sends the last <strong className="text-slate-700 dark:text-slate-200">{coachPrefs.tradeSampleSize}</strong> individual trade logs to DeepSeek for granular setup & note inspection.
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 5: Analysis Focus Areas */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                5. Analysis Focus Areas
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Check topics you want the AI coach to pay extra attention to in reports & chat.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {[
                  { id: 'risk' as CoachFocusArea, label: 'Risk Management', icon: ShieldAlert },
                  { id: 'timing' as CoachFocusArea, label: 'Timing & Sessions', icon: Clock },
                  { id: 'psychology' as CoachFocusArea, label: 'Psychology & FOMO', icon: BrainCircuit },
                  { id: 'commissions' as CoachFocusArea, label: 'Commission Drag', icon: Zap },
                  { id: 'consistency' as CoachFocusArea, label: 'Equity Consistency', icon: TrendingUp },
                ].map((item) => {
                  const Icon = item.icon;
                  const isChecked = coachPrefs.focusAreas.includes(item.id);
                  return (
                    <label
                      key={item.id}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'bg-indigo-50/80 border-indigo-600 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-500 dark:text-indigo-300'
                          : 'bg-slate-50 dark:bg-[#161622] border-slate-200 dark:border-[#1e1e2d] text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...coachPrefs.focusAreas, item.id]
                            : coachPrefs.focusAreas.filter((f) => f !== item.id);
                          setCoachPrefs({ ...coachPrefs, focusAreas: updated });
                        }}
                        className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                      />
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Footer Action Bar */}
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-[#1e1e2d] pt-5">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {coachPrefs.updatedAt
                  ? `Last saved: ${new Date(coachPrefs.updatedAt).toLocaleTimeString()}`
                  : 'Preferences active'}
              </p>

              <button
                type="button"
                onClick={() => saveCoachPrefs()}
                disabled={savingCoachPrefs}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                {savingCoachPrefs ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Configuration
              </button>
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
