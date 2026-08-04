import { Sidebar } from '@/components/layout/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0f0f0f]">
      <Sidebar />
      <main className="flex-1 min-w-0 md:overflow-auto">
        <div className="pt-12 md:pt-0 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
