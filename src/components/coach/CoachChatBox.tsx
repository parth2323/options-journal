'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/lib/types';
import { Bot, Send, User, Sparkles, RefreshCw, Zap, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CoachChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        "👋 Hello! I'm your AI Trading Mentor. I've analyzed your exclusive trading history and logged chart ideas from Supabase. Ask me anything about your win rate, risk:reward, oversized losses, or setup strategy!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = async (userText?: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim() || sending) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!userText) setInput('');
    setSending(true);

    try {
      const savedCode = localStorage.getItem('options_journal_ai_code') || '';
      const res = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          accessCode: savedCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'AI_ACCESS_REQUIRED') {
          const unlockMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: '🔑 Beta Access Code required to chat with AI Coach. Please click the "Unlock AI Coach" button at the top of this page to enter your access code.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, unlockMsg]);
          return;
        }

        const errMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.message || data.error || 'Unable to connect to AI Coach. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errMsg]);
        return;
      }

      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response || 'I am analyzing your trade logs. Ask me any follow-up question!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Coach Chat error:', err);
      const networkMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Connection error. Please check your network connection and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, networkMsg]);
    } finally {
      setSending(false);
    }
  };

  const promptSuggestions = [
    'How do I fix my biggest PnL leak?',
    'What is my average win vs average loss?',
    'Review my logged chart ideas & setups',
    'How can I improve my entry on SPY options?',
  ];

  return (
    <div className="bg-white border border-slate-200/80 shadow-md dark:bg-[#12121a] dark:border-[#1e1e2d] rounded-2xl overflow-hidden flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80 dark:border-[#1e1e2d] bg-slate-50/80 dark:bg-[#161622]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              Interactive AI Coach Conversation
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                ● Live Data Connected
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Ask questions about your isolated trading history & setups
            </p>
          </div>
        </div>
      </div>

      {/* Message Thread */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/40 dark:bg-[#0e0e14]">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={cn('flex items-start gap-3 max-w-[85%]', isUser ? 'ml-auto flex-row-reverse' : 'mr-auto')}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-xs',
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                )}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={cn(
                  'rounded-2xl px-4 py-3 text-xs md:text-sm leading-relaxed shadow-xs space-y-1',
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200/90 text-slate-900 dark:bg-[#161622] dark:border-[#222234] dark:text-slate-200 rounded-tl-none'
                )}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                <p className={cn('text-[10px] font-mono text-right', isUser ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500')}>
                  {m.timestamp}
                </p>
              </div>
            </div>
          );
        })}

        {sending && (
          <div className="flex items-center gap-3 mr-auto">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 text-slate-600 dark:bg-[#161622] dark:border-[#222234] dark:text-slate-300 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs font-medium flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              <span>Analyzing trade history...</span>
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-4 py-2.5 bg-white border-t border-slate-200/80 dark:bg-[#14141f] dark:border-[#1e1e2d] flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex-shrink-0 flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-500" /> Suggestions:
        </span>
        {promptSuggestions.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={sending}
            className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:hover:bg-indigo-500/20 px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer flex-shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Legal & Regulatory Risk Disclaimer Strip */}
      <div className="px-3.5 py-1.5 bg-amber-500/10 border-t border-amber-500/20 text-[10px] text-amber-700 dark:text-amber-300 font-medium flex items-center gap-1.5 leading-tight flex-shrink-0">
        <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
        <span><strong>Educational Journaling Tool:</strong> AI Coach responses are for statistical reflection only. Not financial advice or trade signals. Options trading carries substantial risk of loss.</span>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-slate-50/90 border-t border-slate-200/80 dark:bg-[#161622] dark:border-[#1e1e2d] flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI Coach about your trades, win rate, or setup risk..."
          disabled={sending}
          className="flex-1 bg-white border border-slate-200 dark:bg-[#101018] dark:border-[#2a2a3e] rounded-xl px-4 py-2.5 text-xs md:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer active:scale-95 flex-shrink-0"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
