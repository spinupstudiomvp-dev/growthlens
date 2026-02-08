"use client";
import { useEffect, useState } from "react";
import { listAudits, listComparisons } from "@/lib/convex";
import { Card } from "@/components/ui";

interface AuditItem {
  _id: string;
  profileName: string;
  profileUrl: string;
  overallScore: number;
  overallGrade: string;
  source: string;
  createdAt: number;
}

interface ComparisonItem {
  _id: string;
  profileNameA: string;
  profileNameB: string;
  createdAt: number;
}

export default function DashboardPage() {
  const [audits, setAudits] = useState<AuditItem[]>([]);
  const [comparisons, setComparisons] = useState<ComparisonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"audits" | "comparisons">("audits");

  useEffect(() => {
    Promise.all([listAudits(50), listComparisons(50)]).then(([a, c]) => {
      setAudits(a);
      setComparisons(c);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full" style={{ animation: "spin-slow 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Satoshi, sans-serif' }}>Dashboard</h1>
        <p className="text-slate-400 mb-8">All your past audits and comparisons</p>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/[0.03] rounded-lg p-1 w-fit">
          <button
            onClick={() => setTab("audits")}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${tab === "audits" ? "bg-accent text-navy" : "text-slate-400 hover:text-white"}`}
          >
            Audits ({audits.length})
          </button>
          <button
            onClick={() => setTab("comparisons")}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${tab === "comparisons" ? "bg-accent text-navy" : "text-slate-400 hover:text-white"}`}
          >
            Comparisons ({comparisons.length})
          </button>
        </div>

        {tab === "audits" && (
          <div className="space-y-3">
            {audits.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-slate-400 mb-4">No audits yet</p>
                <a href="/audit" className="text-accent hover:underline">Run your first audit →</a>
              </Card>
            ) : (
              audits.map((audit) => (
                <a key={audit._id} href={`/audit/${audit._id}`} className="block">
                  <Card className="p-5 hover:border-accent/20 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold shrink-0">
                          {audit.profileName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{audit.profileName}</h3>
                          <p className="text-slate-500 text-xs">{new Date(audit.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-xs px-2 py-1 rounded ${audit.source === "live" ? "bg-accent/10 text-accent" : "bg-slate-700/50 text-slate-400"}`}>
                          {audit.source}
                        </span>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">{audit.overallScore}</div>
                          <div className="text-xs text-slate-500">Grade {audit.overallGrade}</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </a>
              ))
            )}
          </div>
        )}

        {tab === "comparisons" && (
          <div className="space-y-3">
            {comparisons.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-slate-400 mb-4">No comparisons yet</p>
                <a href="/compare" className="text-accent hover:underline">Run your first comparison →</a>
              </Card>
            ) : (
              comparisons.map((comp) => (
                <a key={comp._id} href={`/compare/${comp._id}`} className="block">
                  <Card className="p-5 hover:border-accent/20 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                          <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm border-2 border-[#0a0f1e]">
                            {comp.profileNameA.charAt(0)}
                          </div>
                          <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm border-2 border-[#0a0f1e]">
                            {comp.profileNameB.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{comp.profileNameA} vs {comp.profileNameB}</h3>
                          <p className="text-slate-500 text-xs">{new Date(comp.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                      </div>
                      <span className="text-slate-500 text-sm">→</span>
                    </div>
                  </Card>
                </a>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
