"use client";
import { useEffect, useState, use } from "react";
import { getComparison } from "@/lib/convex";
import type { ProfileAudit } from "@/lib/mock-data";
import type { GapAnalysis } from "@/lib/gap-analysis";
import { ScoreRing, ProgressBar, DonutChart } from "@/components/charts";
import { Card, CardHeader, Badge, StatCard } from "@/components/ui";

function ProfileSummary({ audit, label }: { audit: ProfileAudit; label: string }) {
  return (
    <Card>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-lg shrink-0">{audit.profile.name.charAt(0)}</div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-white truncate">{audit.profile.name}</h3>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </div>
      <div className="flex justify-center mb-6"><ScoreRing score={audit.overallScore} grade={audit.overallGrade} size={110} /></div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Followers" value={audit.profile.followers.toLocaleString()} />
        <StatCard label="Posts/wk" value={`${audit.contentStrategy.postsPerWeek}`} />
        <StatCard label="Eng. Rate" value={`${audit.engagement.engagementRate}%`} />
        <StatCard label="Avg Likes" value={audit.engagement.avgLikes.toLocaleString()} />
      </div>
      <div className="space-y-3 mb-6">
        {audit.breakdown.map((b, i) => (
          <ProgressBar key={i} value={b.score} max={b.max} label={b.category} color={b.score >= 80 ? "#10b981" : b.score >= 60 ? "#3b82f6" : b.score >= 40 ? "#f59e0b" : "#ef4444"} />
        ))}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-white mb-4">Content Types</h4>
        <DonutChart data={audit.contentStrategy.contentTypes} />
      </div>
    </Card>
  );
}

export default function SavedComparisonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<{ a: ProfileAudit; b: ProfileAudit; gap: GapAnalysis } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getComparison(id).then((comp) => {
      if (comp?.auditDataA) {
        setData({
          a: JSON.parse(comp.auditDataA),
          b: JSON.parse(comp.auditDataB),
          gap: JSON.parse(comp.gapAnalysis),
        });
      } else {
        setError("Comparison not found");
      }
      setLoading(false);
    }).catch(() => { setError("Failed to load"); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full" style={{ animation: "spin-slow 1s linear infinite" }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Comparison not found</h2>
          <a href="/compare" className="text-accent hover:underline">Run a new comparison →</a>
        </div>
      </div>
    );
  }

  const { a, b, gap } = data;

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Satoshi, sans-serif' }}>Profile Comparison</h1>
          <p className="text-slate-400 mt-2">Side-by-side analysis with gap report</p>
        </div>

        <Card className="p-8">
          <div className="grid grid-cols-3 items-center">
            <div className="text-center">
              <div className="text-base font-bold text-white">{a.profile.name}</div>
              <div className="text-slate-500 text-sm mb-4">Profile A</div>
              <div className="flex justify-center"><ScoreRing score={a.overallScore} grade={a.overallGrade} size={100} /></div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-slate-700" style={{ fontFamily: 'Satoshi, sans-serif' }}>VS</div>
              <div className="mt-2 text-accent text-sm font-medium">
                {Math.abs(b.overallScore - a.overallScore)} point gap
              </div>
            </div>
            <div className="text-center">
              <div className="text-base font-bold text-white">{b.profile.name}</div>
              <div className="text-slate-500 text-sm mb-4">Profile B</div>
              <div className="flex justify-center"><ScoreRing score={b.overallScore} grade={b.overallGrade} size={100} /></div>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <ProfileSummary audit={a} label="Profile A" />
          <ProfileSummary audit={b} label="Profile B" />
        </div>

        <Card>
          <CardHeader title="Gap Analysis" subtitle={gap.summary.biggestGaps.length > 0 ? `Biggest gaps: ${gap.summary.biggestGaps.join(" · ")}` : undefined} />
          <div className="space-y-3">
            {gap.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="shrink-0 pt-0.5">
                  <Badge variant={rec.priority.toLowerCase() as "critical" | "high" | "medium" | "low"}>{rec.priority}</Badge>
                </div>
                <p className="flex-1 text-sm text-slate-300 leading-relaxed">{rec.action}</p>
                <div className="shrink-0 text-right pl-4">
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider">Impact</div>
                  <div className="text-accent font-bold">{rec.impact}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="🎯 Action Playbook" subtitle="Prioritized by impact." />
          <div className="space-y-3">
            {gap.recommendations.filter(r => r.priority === "Critical" || r.priority === "High").map((rec, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-accent/[0.04] border border-accent/[0.08]">
                <span className="text-accent font-bold text-lg leading-none mt-0.5 w-6 shrink-0">{i + 1}.</span>
                <p className="text-sm text-slate-300 leading-relaxed">{rec.action}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="text-center pt-4">
          <a href="/compare" className="text-slate-500 hover:text-white transition-colors text-sm">← Run a new comparison</a>
        </div>
      </div>
    </div>
  );
}
