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
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
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
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

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

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100 dark:border-[#2a2a2a]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-xs">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-slate-900 dark:text-[#e8e8e8] leading-tight">Options Journal</p>
            <p className="text-[10px] text-slate-500 dark:text-[#737373] font-medium">Trading Tracker</p>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-[#737373] dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150',
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-[#737373] dark:hover:text-[#e8e8e8] dark:hover:bg-[#252525]'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Footer & Theme Toggle */}
      <div className="p-4 border-t border-slate-100 dark:border-[#2a2a2a] space-y-3 flex-shrink-0">
        <ThemeToggle className="w-full justify-center" />

        {userEmail && (
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
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all flex-shrink-0"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

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
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-52 bg-white border-r border-slate-200/80 dark:bg-[#191919] dark:border-[#2a2a2a] h-full flex-shrink-0 shadow-xs overflow-y-auto">
        <NavContent />
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
            <span className="text-sm font-extrabold text-slate-900 dark:text-[#e8e8e8]">Options Journal</span>
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
            <NavContent />
          </div>
        </div>
      )}
    </>
  );
}
