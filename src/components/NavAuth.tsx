"use client";
import { useAuth } from "@/lib/auth-context";

export default function NavAuth() {
  const { user, loginWithLinkedIn, logout, isLoading } = useAuth();

  if (isLoading) return null;

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <a href="/dashboard/trends" className="text-sm text-slate-400 hover:text-white transition-colors">
          My Dashboard
        </a>
        <div className="flex items-center gap-2">
          {user.picture && (
            <img src={user.picture} alt="" className="w-6 h-6 rounded-full" />
          )}
          <span className="text-xs text-slate-500">{user.name || user.email}</span>
        </div>
        <button onClick={logout} className="text-xs text-slate-500 hover:text-white transition-colors">
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={loginWithLinkedIn}
      className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl border border-white/[0.08] text-slate-300 hover:text-white hover:border-white/20 transition-colors"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      Sign in with LinkedIn
    </button>
  );
}
