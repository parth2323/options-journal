'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  TableProperties,
  CalendarDays,
  Wallet,
  Settings,
  TrendingUp,
  Menu,
  X,
  Sparkles,
  Clock,
  Lightbulb,
  BarChart2,
  BarChart3,
  LogOut,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { FeedbackModal } from '@/components/feedback/FeedbackModal';
import { toast } from 'sonner';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/trades', label: 'Trades', icon: TableProperties },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/ideas', label: 'Ideas', icon: Lightbulb },
  { href: '/market', label: 'Market', icon: BarChart2 },
  { href: '/routine', label: 'Routine', icon: Clock },
  { href: '/coach', label: 'AI Coach', icon: Sparkles },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/accounts', label: 'Accounts', icon: Wallet },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('tradevault_sidebar_collapsed');
    if (saved === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('tradevault_sidebar_collapsed', String(next));
      return next;
    });
  };

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email ?? null);
        setUserName(user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserEmail(session.user.email ?? null);
        setUserName(session.user.user_metadata?.full_name ?? session.user.email?.split('@')[0] ?? null);
      } else {
        setUserEmail(null);
        setUserName(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      toast.success('Logged out safely');
      router.push('/login');
      router.refresh();
    } catch {
      toast.error('Failed to log out');
    }
  };

  const NavContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <>
      {/* Logo Header */}
      <div className={cn(
        'flex items-center justify-between border-b border-slate-100 dark:border-[#2a2a2a] transition-all duration-300',
        collapsed ? 'px-3 py-4 flex-col gap-3' : 'px-4 py-4'
      )}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md flex-shrink-0 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-0.5">
            <img src="/logo_light.png" alt="TradeVault Logo" className="w-full h-full object-cover rounded-lg block dark:hidden" />
            <img src="/logo.png" alt="TradeVault Logo" className="w-full h-full object-cover rounded-lg hidden dark:block" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-base font-black text-slate-900 dark:text-white leading-tight font-mono tracking-tight truncate">TradeVault</p>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold uppercase tracking-wider truncate">Vault Your Trades</p>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-[#737373] dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop Collapse / Expand Toggle Button */}
        <button
          onClick={toggleCollapse}
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:bg-[#20202d] dark:hover:bg-[#2a2a3e] border border-slate-200/80 dark:border-[#2a2a3c] transition-all cursor-pointer shadow-xs active:scale-95"
          aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4 text-indigo-500" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav links */}
      <nav className={cn(
        'flex-1 p-2.5 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
        collapsed && 'flex flex-col items-center overflow-hidden'
      )}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center rounded-xl text-xs font-bold transition-all duration-200 relative active:scale-95',
                collapsed ? 'w-10 h-10 p-0 justify-center hover:scale-105' : 'gap-3 px-3.5 py-2.5 hover:scale-[1.01]',
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/90 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Footer & Theme Toggle */}
      <div className={cn('p-3 border-t border-slate-100 dark:border-[#2a2a2a] space-y-3 flex-shrink-0', collapsed && 'flex flex-col items-center p-2')}>
        <ThemeToggle compact={collapsed} className={cn('w-full justify-center', collapsed && 'w-auto')} />

        {userEmail && !collapsed && (
          <div className="pt-2 border-t border-slate-100 dark:border-[#252525]">
            <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-[#1f1f2b] border border-slate-200/80 dark:border-[#2a2a3c] rounded-xl p-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-500 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
                    {userName ?? 'Trader'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-tight">
                    {userEmail}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all flex-shrink-0 cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {userEmail && collapsed && (
          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-red-50 hover:border-red-200/80 dark:bg-[#1f1f2b] border border-slate-200 dark:border-[#2a2a3e] text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:scale-105 active:scale-95 transition-all cursor-pointer flex-shrink-0"
            aria-label="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}

        {!collapsed && (
          <button
            type="button"
            onClick={() => setFeedbackOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Roadmap & Feedback
          </button>
        )}

        {!collapsed && (
          <div className="pt-2 border-t border-slate-100 dark:border-[#252525] flex items-center justify-center gap-2 text-[10px] text-slate-600 dark:text-slate-400 font-semibold">
            <Link href="/terms" target="_blank" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Terms
            </Link>
            <span>•</span>
            <Link href="/privacy" target="_blank" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Privacy
            </Link>
            <span>•</span>
            <span className="text-slate-500 dark:text-slate-400">Beta v1.0</span>
          </div>
        )}
      </div>

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={cn(
        'hidden md:flex flex-col bg-white border-r border-slate-200/80 dark:bg-[#191919] dark:border-[#2a2a2a] h-full flex-shrink-0 shadow-xs overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-18 overflow-hidden' : 'w-56'
      )}>
        <NavContent collapsed={isCollapsed} />
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/90 border-b border-slate-200 dark:bg-[#191919]/90 dark:border-[#2a2a2a] backdrop-blur-lg h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 dark:text-[#737373] dark:hover:text-[#e8e8e8] active:scale-95 transition-all"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-extrabold text-slate-900 dark:text-[#e8e8e8]">TradeVault</span>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Mobile menu overlay (iOS Slide Sheet style) */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/70 backdrop-blur-md transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] bg-white border-r border-slate-200 dark:bg-[#121218] dark:border-white/10 flex flex-col h-full shadow-2xl z-10">
            <NavContent collapsed={false} />
          </div>
        </div>
      )}
    </>
  );
}
