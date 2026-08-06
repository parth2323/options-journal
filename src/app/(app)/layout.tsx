import { Sidebar } from '@/components/layout/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-[#0f0f0f] overflow-x-hidden max-w-full">
      <Sidebar />
      <main className="flex-1 min-w-0 md:overflow-auto overflow-x-hidden max-w-full">
        <div className="pt-12 md:pt-0 min-h-screen max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
