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
      <div className="flex items-center justify-between px-4 py-5 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#e8e8e8] leading-tight">Options Journal</p>
            <p className="text-[10px] text-[#737373]">Trading Tracker</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-600/20'
                  : 'text-[#737373] hover:text-[#e8e8e8] hover:bg-[#252525]'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer & Theme Toggle */}
      <div className="p-4 border-t border-[#2a2a2a] space-y-3">
        <ThemeToggle className="w-full justify-center" />
        <div>
          <p className="text-[11px] text-[#4a4a4a]">Local storage mode</p>
          <p className="text-[10px] text-[#3a3a3a] mt-0.5">Drop CSVs in /data folder</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-52 bg-[#191919] border-r border-[#2a2a2a] h-screen sticky top-0 flex-shrink-0">
        <NavContent />
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#191919] border-b border-[#2a2a2a] h-12 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-[#737373] hover:text-[#e8e8e8]"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-[#e8e8e8]">Options Journal</span>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          <div className="w-52 bg-[#191919] border-r border-[#2a2a2a] flex flex-col mt-12">
            <NavContent />
          </div>
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
    </>
  );
}
