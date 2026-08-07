'use client';

import { useState } from 'react';
import { Sparkles, ThumbsUp, Plus, X, MessageSquare, CheckCircle2, Send, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  category: 'Integration' | 'Automation' | 'Mobile' | 'Analytics';
  status: 'In Progress' | 'Planned' | 'Under Review';
  votes: number;
  hasVoted?: boolean;
}

const INITIAL_ROADMAP: RoadmapItem[] = [
  {
    id: '1',
    title: 'CSV Broker Auto-Import (ThinkOrSwim, Robinhood, Webull)',
    description: 'Upload broker statement CSVs to automatically parse contracts, fill prices, and executions.',
    category: 'Automation',
    status: 'In Progress',
    votes: 142,
  },
  {
    id: '2',
    title: 'TradingView Webhooks & Alert Execution Sync',
    description: 'Receive HTTP webhooks directly from your TradingView indicator alerts to auto-log trades.',
    category: 'Integration',
    status: 'In Progress',
    votes: 118,
  },
  {
    id: '3',
    title: 'iOS & Android Native App with Push Alerts',
    description: 'Native mobile app for on-the-go trade logging and pre-market execution alerts.',
    category: 'Mobile',
    status: 'Planned',
    votes: 95,
  },
  {
    id: '4',
    title: 'Multi-Currency Portfolios (CAD, EUR, GBP, AUD)',
    description: 'Log trades in your native local currency while keeping automated USD SPY/QQQ conversions.',
    category: 'Analytics',
    status: 'Planned',
    votes: 74,
  },
];

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const [items, setItems] = useState<RoadmapItem[]>(INITIAL_ROADMAP);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'submit'>('roadmap');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleVote = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const hasVoted = item.hasVoted;
          return {
            ...item,
            votes: hasVoted ? item.votes - 1 : item.votes + 1,
            hasVoted: !hasVoted,
          };
        }
        return item;
      })
    );
    toast.success('Vote recorded!');
  };

  const handleSubmitIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    setSubmitting(true);
    setTimeout(() => {
      const newItem: RoadmapItem = {
        id: crypto.randomUUID(),
        title: newTitle.trim(),
        description: newDescription.trim(),
        category: 'Analytics',
        status: 'Under Review',
        votes: 1,
        hasVoted: true,
      };
      setItems((prev) => [newItem, ...prev]);
      setNewTitle('');
      setNewDescription('');
      setSubmitting(false);
      setActiveTab('roadmap');
      toast.success('Feature suggestion submitted to engineering roadmap!');
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0e0e17] border border-[#1f1f2e] rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative overflow-hidden text-[#e8e8e8]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1f1f2e] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">
                Product Roadmap & Feature Voting
              </h3>
              <p className="text-xs text-[#a3a3a3] font-medium">
                Vote on upcoming features or submit your own ideas for Options Journal.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#737373] hover:text-white hover:bg-[#1a1a28] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1 bg-[#141420] border border-[#252538] rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('roadmap')}
            className={cn(
              'px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer',
              activeTab === 'roadmap' ? 'bg-indigo-600 text-white shadow-xs' : 'text-[#737373] hover:text-white'
            )}
          >
            Feature Voting Board
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('submit')}
            className={cn(
              'px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5',
              activeTab === 'submit' ? 'bg-indigo-600 text-white shadow-xs' : 'text-[#737373] hover:text-white'
            )}
          >
            <Plus className="w-3.5 h-3.5" /> Submit Idea
          </button>
        </div>

        {/* TAB 1: ROADMAP ITEMS */}
        {activeTab === 'roadmap' && (
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-[#141420] border border-[#222234] hover:border-indigo-500/30 rounded-2xl p-4 transition-all flex items-start justify-between gap-4 shadow-sm"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white tracking-tight">
                      {item.title}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full border',
                        item.status === 'In Progress'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : item.status === 'Planned'
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      )}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#a3a3a3] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleVote(item.id)}
                  className={cn(
                    'flex flex-col items-center justify-center min-w-[56px] px-3 py-2 rounded-xl border transition-all cursor-pointer active:scale-95 flex-shrink-0',
                    item.hasVoted
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : 'bg-[#1e1e2d] text-[#a3a3a3] hover:text-white border-[#2a2a3e] hover:border-indigo-500/50'
                  )}
                >
                  <ThumbsUp className={cn('w-4 h-4 mb-0.5', item.hasVoted && 'fill-current')} />
                  <span className="text-xs font-mono font-black">{item.votes}</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: SUBMIT FEATURE IDEA */}
        {activeTab === 'submit' && (
          <form onSubmit={handleSubmitIdea} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-white">Feature Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Interactive Risk Calculator / Commission Preset Rules"
                className="w-full bg-[#141420] border border-[#252538] text-white text-xs font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-[#525252]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-white">Why would this help your trading?</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={4}
                placeholder="Describe how this feature improves your daily options trading routine or journal analysis..."
                className="w-full bg-[#141420] border border-[#252538] text-white text-xs font-medium rounded-xl p-3.5 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-[#525252]"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('roadmap')}
                className="px-4 py-2 bg-[#191926] text-[#a3a3a3] text-xs font-bold rounded-xl hover:text-white transition-all cursor-pointer"
              >
                Back to Roadmap
              </button>
              <button
                type="submit"
                disabled={submitting || !newTitle.trim() || !newDescription.trim()}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-black px-5 py-2 rounded-xl transition-all shadow-md cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Idea
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
