'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Loader2, Check } from 'lucide-react';

interface DuplicateButtonProps {
  tradeId: string;
  /** visual variant — 'icon' for table row, 'full' for drawer */
  variant?: 'icon' | 'full';
  onSuccess?: (newId: string) => void;
}

export function DuplicateButton({ tradeId, variant = 'icon', onSuccess }: DuplicateButtonProps) {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation(); // don't open drawer when clicking in table row
    if (state !== 'idle') return;
    setState('loading');
    try {
      const res = await fetch(`/api/trades/${tradeId}/duplicate`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      const copy = await res.json();
      setState('done');
      onSuccess?.(copy.id);
      // Brief flash of ✓ then redirect to the new trade's edit page
      setTimeout(() => {
        router.push(`/trades/${copy.id}/edit`);
        router.refresh();
      }, 600);
    } catch {
      setState('idle');
    }
  };

  if (variant === 'full') {
    return (
      <button
        onClick={handleDuplicate}
        disabled={state !== 'idle'}
        className="flex items-center gap-2 w-full px-3 py-2 text-[12px] font-medium rounded-lg transition-all
          text-[#a0a0a0] hover:text-[#e8e8e8] hover:bg-[#1e1e1e] disabled:opacity-50"
      >
        {state === 'loading' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : state === 'done' ? (
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
        {state === 'loading' ? 'Duplicating…' : state === 'done' ? 'Duplicated!' : 'Duplicate Trade'}
      </button>
    );
  }

  // icon variant — compact for table row
  return (
    <button
      onClick={handleDuplicate}
      disabled={state !== 'idle'}
      title="Duplicate trade"
      className="p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100
        text-[#3a3a3a] hover:text-indigo-400 hover:bg-indigo-950/30 disabled:opacity-50"
    >
      {state === 'loading' ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : state === 'done' ? (
        <Check className="w-3 h-3 text-emerald-400" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
    </button>
  );
}
