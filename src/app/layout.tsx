import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import NavAuth from "@/components/NavAuth";

export const metadata: Metadata = {
  title: "GrowthLens — LinkedIn Growth Audit for Founders",
  description: "Analyze any LinkedIn profile strategy. Get a complete audit with actionable insights to grow your presence.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen" suppressHydrationWarning>
        <AuthProvider>
          <nav className="fixed top-0 w-full z-50 bg-navy/80 backdrop-blur-xl border-b border-slate-600/10">
            <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
              <a href="/" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0f1e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                </div>
                <span className="text-lg font-bold text-white tracking-tight">GrowthLens</span>
              </a>
              <div className="flex items-center gap-8">
                <a href="/audit" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Audit</a>
                <a href="/compare" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Compare</a>
                <a href="/dashboard" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Dashboard</a>
                <a href="/blog" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Blog</a>
                <a href="/audit" className="bg-accent hover:bg-accent-dim text-navy font-semibold text-sm px-5 py-2.5 rounded-lg transition-all hover:scale-[1.02]">Get Started</a>
                <NavAuth />
              </div>
            </div>
          </nav>
          <main className="pt-20">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
