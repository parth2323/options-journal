import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/layout/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TradeVault — Master Your Edge. Vault Your Trades.",
  description: "Institutional options journal, AI mentorship, trade analytics, and automated risk tracking.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#202020',
              border: '1px solid #2a2a2a',
              color: '#e8e8e8',
            },
          }}
        />
      </body>
    </html>
  );
}
