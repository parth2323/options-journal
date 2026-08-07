import { Sidebar } from '@/components/layout/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-[#0f0f0f]">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
        <div className="pt-12 md:pt-0 min-h-full max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
