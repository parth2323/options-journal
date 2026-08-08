'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { TrendingUp, Lock, Mail, User, Eye, EyeOff, Loader2, CheckCircle2, ShieldCheck, ArrowRight, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === 'modal' || searchParams.get('preview') === 'true';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Email verification modal state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (isPreview) {
      setRegisteredEmail('trader.demo@example.com');
      setShowVerificationModal(true);
    }
  }, [isPreview]);

  // Password validation criteria
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const isPasswordValid = hasMinLength && hasNumber && hasUpper;

  const handleResendEmail = async () => {
    if (!registeredEmail) return;
    setResending(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: registeredEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Verification link resent! Check your inbox.');
      }
    } catch {
      toast.error('Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage('Password does not meet security requirements.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        toast.error('Sign up failed.');
        setLoading(false);
        return;
      }

      if (data.user) {
        if (!data.session) {
          // Email confirmation is required by Supabase configuration -> Open Security Modal
          setRegisteredEmail(email.trim());
          setLoading(false);
          setShowVerificationModal(true);
        } else {
          // Session is active immediately (email confirmation disabled)
          try {
            await fetch('/api/accounts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: 'Primary Live Account',
                account_type: 'live',
                initial_balance: 10000,
                goal: 25000,
              }),
            });
          } catch {
            // Account creation warning ignored, user can create manually
          }

          toast.success('Account created! Welcome to Options Journal 🎉');
          router.push('/dashboard');
          router.refresh();
        }
      }
    } catch {
      setErrorMessage('An unexpected error occurred during registration.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0e1017]/90 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-7 sm:p-8 shadow-2xl space-y-5">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-2 flex-shrink-0">
          <img src="/logo.png" alt="TradeVault Logo" className="w-full h-full object-contain drop-shadow-lg" />
        </div>
        <h1 className="text-xl font-black tracking-tight text-white font-mono">TradeVault</h1>
        <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Options Journal</p>
      </div>

      {/* Google OAuth Quick Sign Up */}
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
        Sign up with Google (Gmail)
      </button>

      <div className="relative flex items-center justify-center my-1">
        <div className="border-t border-slate-800/80 w-full" />
        <span className="bg-[#0e1017] px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 absolute">
          or continue with email
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSignup} className="space-y-3.5">
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-4 py-2.5 rounded-xl">
            {errorMessage}
          </div>
        )}

        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300 block">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-[#121420] border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300 block">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="trader@example.com"
              className="w-full bg-[#121420] border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300 block">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#121420] border border-slate-800 rounded-xl pl-10 pr-10 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
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

        {/* Password Checklist */}
        {password.length > 0 && (
          <div className="bg-[#121420]/80 rounded-xl p-2.5 border border-slate-800/80 space-y-1 text-[11px]">
            <div className={`flex items-center gap-1.5 font-medium ${hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" /> At least 8 characters
            </div>
            <div className={`flex items-center gap-1.5 font-medium ${hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" /> Contains a number
            </div>
            <div className={`flex items-center gap-1.5 font-medium ${hasUpper ? 'text-emerald-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" /> Contains an uppercase letter
            </div>
          </div>
        )}

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300 block">Confirm Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#121420] border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !isPasswordValid}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer mt-1"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Creating Account…
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* Footer link */}
      <div className="pt-1 text-center text-xs text-slate-500 space-y-3">
        <p>
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign In
          </Link>
        </p>

        <p className="text-[11px] text-slate-500 leading-normal pt-2 border-t border-slate-800/80">
          By registering, you agree to our{' '}
          <Link href="/terms" target="_blank" className="text-indigo-400 hover:underline">
            Terms of Use
          </Link>{' '}
          and{' '}
          <Link href="/privacy" target="_blank" className="text-indigo-400 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      {/* Refined FAANG-Style Email Verification Security Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#09090b] border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 overflow-hidden text-left">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowVerificationModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Brand Header */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex-shrink-0">
                <img src="/logo.png" alt="TradeVault" className="w-full h-full object-contain drop-shadow-md" />
              </div>
              <span className="text-sm font-extrabold text-white font-mono tracking-tight">TradeVault — Options Journal</span>
            </div>

            {/* Hero Icon & Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full">
                  Action Required
                </span>
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">Verify your email address</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Confirmation link dispatched to: <span className="font-mono font-bold text-zinc-200">{registeredEmail}</span>
                </p>
              </div>
            </div>

            {/* Email Inbox Skeleton Preview Card */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Email Preview (In Your Inbox)</span>
                <span className="text-[10px] font-medium text-zinc-500">Look for this email</span>
              </div>

              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-inner">
                {/* Header Bar */}
                <div className="bg-zinc-950/90 border-b border-zinc-800/80 px-3.5 py-2.5 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                      S
                    </div>
                    <div className="min-w-0 truncate">
                      <span className="font-bold text-zinc-200">Supabase Auth</span>{' '}
                      <span className="text-zinc-500 text-[10px] font-mono">&lt;noreply@mail.app.supabase.io&gt;</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono flex-shrink-0">Just now</span>
                </div>

                {/* Body Content Preview */}
                <div className="p-4 bg-zinc-950/40 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
                    <p className="text-xs font-bold text-white">Subject: Confirm your email address</p>
                    <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded">Inbox</span>
                  </div>

                  <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-3 space-y-2">
                    <p className="text-xs font-bold text-zinc-200">Confirm your email address</p>
                    <p className="text-[11px] text-zinc-400 leading-normal">
                      Follow the link below to confirm this email address and finish signing up.
                    </p>
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 underline decoration-indigo-400/60">
                        Confirm email address →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-zinc-900/50 border border-zinc-800/70 rounded-xl p-3 flex items-start gap-2 text-[11px] text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
              <p className="leading-normal">
                Email verification safeguards portfolio privacy and protects your trade records from unauthorized access.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => router.push(`/login?registered=true&email=${encodeURIComponent(registeredEmail)}`)}
                className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold py-3 px-4 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs cursor-pointer shadow-md"
              >
                Proceed to Sign In <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleResendEmail}
                disabled={resending}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold py-2.5 px-4 rounded-xl border border-zinc-800 transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
              >
                {resending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" /> Resending email...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-zinc-400" /> Resend verification link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="py-8 flex justify-center text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}

