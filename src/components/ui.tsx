import { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111827]/90 to-[#0f1423]/70 backdrop-blur-xl p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Satoshi, sans-serif' }}>{title}</h2>
      {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}

export function Badge({ children, variant = "default" }: { children: ReactNode; variant?: "critical" | "high" | "medium" | "low" | "default" }) {
  const colors = {
    critical: "bg-red-500/15 text-red-400 border-red-500/20",
    high: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    medium: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    low: "bg-slate-500/15 text-slate-400 border-slate-500/20",
    default: "bg-accent/15 text-accent border-accent/20",
  };
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-md border ${colors[variant]}`}>
      {children}
    </span>
  );
}

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-4 text-center">
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}

export function MetricRow({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`text-sm font-medium ${accent ? "text-accent" : "text-white"}`}>{value}</span>
    </div>
  );
}
