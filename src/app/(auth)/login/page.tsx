'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { TrendingUp, Lock, Mail, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { toast } from 'sonner';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/dashboard';
  const registered = searchParams.get('registered') === 'true';
  const initialEmail = searchParams.get('email') ?? '';

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) {
        toast.error(error.message);
        setLoading(false);
      }
    } catch {
      toast.error('Failed to initiate Google authentication.');
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        const msg = error.message || '';
        const code = error.code || '';

        if (
          code === 'email_not_confirmed' ||
          msg.toLowerCase().includes('email not confirmed') ||
          msg.toLowerCase().includes('unconfirmed') ||
          msg.toLowerCase().includes('not confirmed') ||
          msg.toLowerCase().includes('verify your email')
        ) {
          setErrorMessage('Please verify your email address before logging in. Check your inbox (and spam folder) for the confirmation link.');
          toast.error('Email not verified. Please check your inbox.');
        } else if (
          code === 'invalid_credentials' ||
          msg.toLowerCase().includes('invalid login credentials') ||
          msg.toLowerCase().includes('invalid credentials')
        ) {
          setErrorMessage('Invalid email or password.');
          toast.error('Sign in failed. Check your credentials.');
        } else {
          setErrorMessage(msg);
          toast.error(msg);
        }
        setLoading(false);
        return;
      }

      toast.success('Welcome back! 👋');
      const target = (!next || next === '/') ? '/dashboard' : next;
      router.push(target);
      router.refresh();
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={loading}
        className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-3 text-xs border border-slate-200 cursor-pointer disabled:opacity-50"
      >
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        Sign in with Google (Gmail)
      </button>

      <div className="relative flex items-center justify-center my-1">
        <div className="border-t border-slate-800/80 w-full" />
        <span className="bg-[#0e1017] px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 absolute">
          or sign in with email
        </span>
      </div>

      {registered && (
        <div className="bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold p-3.5 rounded-xl space-y-1">
          <div className="flex items-center gap-2 font-bold text-indigo-200 text-sm">
            <Mail className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            Verification Link Sent!
          </div>
          <p className="text-slate-300 text-xs font-normal leading-relaxed">
            Account created! We&apos;ve sent a verification link to <span className="font-bold text-white">{email || initialEmail || 'your email'}</span>. Please check your inbox and verify your email before logging in.
          </p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-4 py-2.5 rounded-xl">
            {errorMessage}
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 block">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="trader@example.com"
              className="w-full bg-[#121420] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 block">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#121420] border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
            </>
          ) : (
            <>
              Sign In <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="bg-[#0e1017]/90 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-7 sm:p-8 shadow-2xl space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-2 flex-shrink-0">
          <img src="/logo.png" alt="TradeVault Logo" className="w-full h-full object-contain drop-shadow-lg" />
        </div>
        <h1 className="text-xl font-black tracking-tight text-white font-mono">TradeVault</h1>
        <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Options Journal</p>
      </div>

      <Suspense
        fallback={
          <div className="py-8 flex justify-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>

      {/* Footer link */}
      <div className="pt-2 text-center text-xs text-slate-500 space-y-3">
        <p>
          Don&apos;t have an account yet?{' '}
          <Link href="/signup" className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
            Create Account
          </Link>
        </p>

        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-center gap-3 text-[11px] text-slate-400 font-medium">
          <Link href="/terms" target="_blank" className="hover:text-indigo-400 transition-colors">
            Terms of Use
          </Link>
          <span>•</span>
          <Link href="/privacy" target="_blank" className="hover:text-indigo-400 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}

