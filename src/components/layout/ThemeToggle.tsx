'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className, compact = false }: { className?: string; compact?: boolean }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      const initial = prefersLight ? 'light' : 'dark';
      setTheme(initial);
      applyTheme(initial);
    }
  }, []);

  const applyTheme = (newTheme: 'dark' | 'light') => {
    const root = document.documentElement;
    if (newTheme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    applyTheme(nextTheme);
  };

  if (!mounted) {
    return (
      <div className={compact ? "w-9 h-9 rounded-xl bg-slate-800/40 animate-pulse" : `w-8 h-8 rounded-lg bg-zinc-800/50 animate-pulse ${className ?? ''}`} />
    );
  }

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 border cursor-pointer shadow-xs bg-slate-100 hover:bg-indigo-50/80 border-slate-200 hover:border-indigo-300 text-slate-700 dark:bg-[#1f1f2b] dark:hover:bg-[#282838] dark:border-[#2a2a3e] dark:hover:border-indigo-500/40 dark:text-slate-200 hover:scale-105 active:scale-95 flex-shrink-0"
        aria-label="Toggle Theme"
      >
        {theme === 'dark' ? (
          <Sun className="w-4 h-4 text-amber-400 animate-in fade-in zoom-in" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600 animate-in fade-in zoom-in" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`flex items-center justify-center gap-2 p-2 rounded-xl transition-all border cursor-pointer active:scale-98 ${
        theme === 'dark'
          ? 'bg-[#202020] hover:bg-[#252525] border-[#2a2a2a] text-[#e8e8e8]'
          : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
      } ${className ?? ''}`}
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold">Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold">Dark Mode</span>
        </>
      )}
    </button>
  );
}
