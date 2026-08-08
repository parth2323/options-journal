export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#08090e] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Subtle background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Auth Card Container */}
      <div className="w-full max-w-md relative z-10">
        {children}
      </div>

      {/* Minimal Footer */}
      <footer className="mt-8 text-center text-[11px] text-zinc-500 font-mono">
        TradeVault — Options Journal &copy; {new Date().getFullYear()} · Institutional Trading Journal
      </footer>
    </div>
  );
}
