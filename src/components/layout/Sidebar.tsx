'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

import { ThemeToggle } from '@/components/layout/ThemeToggle';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/trades', label: 'Trades', icon: TableProperties },
  { href: '/routine', label: 'Routine', icon: Clock },
  { href: '/coach', label: 'AI Coach', icon: Sparkles },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/accounts', label: 'Accounts', icon: Wallet },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
      <nav className="flex-1 p-3 space-y-1">
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

      {/* Footer & Theme Toggle */}
      <div className="p-4 border-t border-slate-100 dark:border-[#2a2a2a] space-y-3">
        <ThemeToggle className="w-full justify-center" />
        <div>
          <p className="text-[11px] font-bold text-slate-500 dark:text-[#4a4a4a]">Local storage mode</p>
          <p className="text-[10px] text-slate-400 dark:text-[#3a3a3a] mt-0.5">Drop CSVs in /data folder</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-52 bg-white border-r border-slate-200/80 dark:bg-[#191919] dark:border-[#2a2a2a] h-screen sticky top-0 flex-shrink-0 shadow-xs">
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
