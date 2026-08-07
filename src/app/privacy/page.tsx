import Link from 'next/link';
import { TrendingUp, Lock, ShieldCheck, ArrowLeft, Database, EyeOff } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy — Options Journal',
  description: 'Privacy Policy, Data Security Protocols, and AI Data Governance for Options Journal.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e8e8e8] font-sans antialiased flex flex-col justify-between selection:bg-indigo-500/30">
      {/* Navigation Header */}
      <header className="border-b border-[#1f1f2e] bg-[#12121a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-md group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="font-black text-sm text-white tracking-tight">Options Journal</span>
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-1.5 text-xs font-bold text-[#a3a3a3] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Application
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-10 flex-1">
        <div className="space-y-3 border-b border-[#1f1f2e] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Lock className="w-3.5 h-3.5" /> Privacy & Data Protection
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Privacy Policy & Data Security
          </h1>
          <p className="text-xs text-[#a3a3a3] font-mono">
            Last Updated: August 7, 2026 • Version 1.0 (Bank-Grade RLS Security)
          </p>
        </div>

        <article className="space-y-8 text-sm text-[#d4d4d4] leading-relaxed font-normal">
          {/* Summary Box */}
          <section className="p-6 bg-[#12121a] border border-[#1f1f2e] rounded-2xl space-y-3 shadow-sm">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Our Core Privacy Commitment
            </h2>
            <p className="text-xs text-[#a3a3a3] leading-relaxed">
              At Options Journal, we treat trading data with strict confidentiality. 
              <strong> We never sell, rent, monetize, or publicly share your trade history, execution notes, or financial metrics to third parties or ad networks.</strong>
            </p>
          </section>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base font-black text-white">1. Information We Collect</h2>
            <p className="text-xs text-[#a3a3a3] leading-relaxed">
              We collect only information necessary to deliver seamless trading analytics:
            </p>
            <ul className="list-disc list-inside text-xs text-[#a3a3a3] space-y-1 pl-2 font-mono">
              <li>Account Info: Email address, display name, trader handle, preferred timezone & currency.</li>
              <li>Trading Records: Symbol, contracts, opened/closed timestamps, quantities, prices, commissions, setup tags, and user notes.</li>
              <li>Chart Ideas: Optional uploaded chart screenshots and setup observations.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base font-black text-white">2. Multi-Tenant Database Security (Supabase RLS)</h2>
            <p className="text-xs text-[#a3a3a3] leading-relaxed">
              Every database table (<code className="text-indigo-400 font-mono">trades</code>, <code className="text-indigo-400 font-mono">accounts</code>, <code className="text-indigo-400 font-mono">routine</code>, <code className="text-indigo-400 font-mono">chart_observations</code>, <code className="text-indigo-400 font-mono">user_profiles</code>) is guarded by Supabase Row Level Security (RLS) policies enforcing <code className="text-indigo-400 font-mono">auth.uid() = user_id</code>. Your records are strictly inaccessible to other users.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base font-black text-white">3. Artificial Intelligence & Third-Party LLM Policy</h2>
            <p className="text-xs text-[#a3a3a3] leading-relaxed">
              When you generate an AI Coach Report, quantitative trade statistics (e.g. win rate, profit factor, session P&L) are sent to DeepSeek’s API over encrypted HTTPS. 
              <strong> Personal identifying information (like your real name, email, or broker account numbers) is NEVER sent to AI models.</strong>
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-t border-[#1f1f2e] pt-6">
            <h2 className="text-base font-black text-white">4. Data Ownership & Right to be Forgotten</h2>
            <p className="text-xs text-[#a3a3a3] leading-relaxed">
              You maintain 100% ownership of your trading data. You can download a complete CSV export or execute permanent account and data deletion at any time via Settings → Danger Zone.
            </p>
          </section>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1f1f2e] bg-[#12121a] py-6 text-center text-xs text-[#737373]">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Options Journal. All rights reserved.</p>
          <div className="flex items-center gap-4 font-semibold">
            <Link href="/terms" className="text-[#a3a3a3] hover:text-white transition-colors">Terms of Use</Link>
            <span>•</span>
            <Link href="/privacy" className="text-white hover:underline">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
