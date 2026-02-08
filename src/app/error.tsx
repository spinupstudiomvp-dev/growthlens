"use client";
import { useEffect } from "react";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log to console for browser devtools
    console.error("[GrowthLens Error]", error);
  }, [error]);

  const errorCode = error.digest || error.name || "UNKNOWN";
  const errorMsg = error.message || "No message";
  const stack = error.stack?.split("\n").slice(0, 5).join("\n") || "No stack";

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red/10 border border-red/20 flex items-center justify-center text-red text-2xl">⚠️</div>
        <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
        <div className="text-left bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 space-y-2">
          <p className="text-sm text-slate-400"><span className="text-slate-500">Code:</span> <span className="text-white font-mono">{errorCode}</span></p>
          <p className="text-sm text-slate-400"><span className="text-slate-500">Error:</span> <span className="text-white font-mono text-xs">{errorMsg}</span></p>
          <details className="text-xs">
            <summary className="text-slate-500 cursor-pointer hover:text-slate-400">Stack trace</summary>
            <pre className="mt-2 text-slate-500 font-mono text-[10px] whitespace-pre-wrap overflow-x-auto">{stack}</pre>
          </details>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="bg-accent hover:bg-accent-dim text-navy font-semibold px-6 py-3 rounded-xl transition-all">
            Try Again
          </button>
          <a href="/" className="border border-white/[0.08] text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/[0.03] transition-all">
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
