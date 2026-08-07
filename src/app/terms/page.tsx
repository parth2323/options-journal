import Link from 'next/link';
import { TrendingUp, ShieldCheck, FileText, ArrowLeft, Lock } from 'lucide-react';

export const metadata = {
  title: 'Terms of Use — Options Journal',
  description: 'Terms of Service, Financial Disclaimers, and Service Agreement for Options Journal.',
};

export default function TermsOfUsePage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FileText className="w-3.5 h-3.5" /> Legal & Governance
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Terms of Use & Financial Disclaimer
          </h1>
          <p className="text-xs text-[#a3a3a3] font-mono">
            Last Updated: August 7, 2026 • Version 1.0 (Public Beta)
          </p>
        </div>

        <article className="space-y-8 text-sm text-[#d4d4d4] leading-relaxed font-normal">
          {/* Section 1 */}
          <section className="space-y-3 p-6 bg-[#12121a] border border-[#1f1f2e] rounded-2xl shadow-sm">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              1. Non-Financial Advice & Educational Tool Disclaimer
            </h2>
            <p className="text-xs text-[#a3a3a3] leading-relaxed">
              Options Journal is an independent software application designed strictly for record-keeping, analytical journaling, performance visualization, and educational self-reflection. 
              <strong> Options Journal is not a registered broker-dealer, investment advisor, or financial institution.</strong> 
              No content, performance metric, pattern recognition output, AI mentor feedback, or statistical calculation within this platform constitutes investment, legal, tax, or financial advice.
            </p>
            <p className="text-xs text-[#a3a3a3] leading-relaxed">
              Trading stocks, options, futures, and cryptocurrencies carries inherent financial risk, including the risk of substantial or total capital loss. You accept sole responsibility for all live trading executions, strategy selections, and capital decisions made in your trading accounts.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base font-black text-white">2. User Account Security & Authentication</h2>
            <p className="text-xs text-[#a3a3a3] leading-relaxed">
              To access Options Journal, users authenticate via Supabase Auth (Email/Password or Google OAuth). You are responsible for maintaining the confidentiality of your login credentials and for restricting access to your devices. 
              Options Journal implements Row Level Security (RLS) policies to isolate user records under <code className="text-indigo-400 font-mono">auth.uid() = user_id</code>.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base font-black text-white">3. Public Beta & Service SLA</h2>
            <p className="text-xs text-[#a3a3a3] leading-relaxed">
              Options Journal is currently offered in **Public Beta**. Features, user interface designs, and quantitative algorithms are subject to ongoing improvements. While we endeavor to maintain 99.9% application uptime, Options Journal is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base font-black text-white">4. Artificial Intelligence & Analytics Disclaimer</h2>
            <p className="text-xs text-[#a3a3a3] leading-relaxed">
              The AI Coach and DeepSeek intelligence features utilize statistical quantitative models to synthesize trading logs into behavioral feedback. 
              AI outputs are generated for educational pattern recognition only and should never be construed as real-time buy/sell signals or market forecasts.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 border-t border-[#1f1f2e] pt-6">
            <h2 className="text-base font-black text-white">5. Termination & Data Portability</h2>
            <p className="text-xs text-[#a3a3a3] leading-relaxed">
              Users reserve the right to export their complete trading data (CSV format) or initiate full account and record purging via the Settings Danger Zone at any time.
            </p>
          </section>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1f1f2e] bg-[#12121a] py-6 text-center text-xs text-[#737373]">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Options Journal. All rights reserved.</p>
          <div className="flex items-center gap-4 font-semibold">
            <Link href="/terms" className="text-white hover:underline">Terms of Use</Link>
            <span>•</span>
            <Link href="/privacy" className="text-[#a3a3a3] hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
