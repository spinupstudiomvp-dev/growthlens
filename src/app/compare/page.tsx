"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { mockProfileA, mockProfileB, type ProfileAudit } from "@/lib/mock-data";
import { ScoreRing, ProgressBar, DonutChart } from "@/components/charts";
import { Card, CardHeader, Badge, StatCard } from "@/components/ui";
import { generateGapAnalysis, type GapAnalysis } from "@/lib/gap-analysis";
import { storeComparison, updateComparisonEmail } from "@/lib/convex";
import Captcha from "@/components/Captcha";

function CompareEmailGate({ nameA, nameB, scoreA, scoreB, gradeA, gradeB, comparisonId, onSkip }: { nameA: string; nameB: string; scoreA: number; scoreB: number; gradeA: string; gradeB: string; comparisonId: string; onSkip: () => void }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try { await updateComparisonEmail(comparisonId, email); } catch {}
    onSkip();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-6">
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111827]/95 to-[#0f1423]/90 backdrop-blur-xl p-8 max-w-md w-full text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold mx-auto mb-1">{nameA.charAt(0)}</div>
            <span className="text-white text-sm font-semibold">{scoreA}</span>
            <span className="text-accent text-xs ml-1">{gradeA}</span>
          </div>
          <span className="text-slate-600 font-bold text-lg">vs</span>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold mx-auto mb-1">{nameB.charAt(0)}</div>
            <span className="text-white text-sm font-semibold">{scoreB}</span>
            <span className="text-accent text-xs ml-1">{gradeB}</span>
          </div>
        </div>
        <p className="text-slate-400 text-sm mb-6">Enter your email to see the full comparison & gap analysis</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-5 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-accent/40 transition-colors" />
          <button type="submit" disabled={submitting} className="w-full bg-accent hover:bg-accent-dim disabled:opacity-60 text-navy font-bold px-6 py-3.5 rounded-xl transition-colors">
            {submitting ? "Saving..." : "See Full Comparison"}
          </button>
        </form>
        <button onClick={onSkip} className="text-slate-500 hover:text-slate-300 text-xs mt-4 transition-colors">Skip for now →</button>
      </div>
    </div>
  );
}

function ProfileSummary({ audit, label }: { audit: ProfileAudit; label: string }) {
  return (
    <Card>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-lg shrink-0">
          {audit.profile.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-white truncate">{audit.profile.name}</h3>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <ScoreRing score={audit.overallScore} grade={audit.overallGrade} size={110} />
      </div>

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

async function fetchAudit(profileUrl: string): Promise<ProfileAudit> {
  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileUrl }),
    });
    const data = await res.json();

    if (data.audit) return data.audit;

    if (data.status === "running") {
      const { profileRunId, postsRunId, profileDatasetId, postsDatasetId } = data;
      const params = new URLSearchParams({ profileRunId, postsRunId, profileDatasetId, postsDatasetId });

      for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 3000));
        const statusRes = await fetch(`/api/analyze/status?${params}`);
        const statusData = await statusRes.json();
        if (statusData.status === "complete") return statusData.audit;
      }
    }
  } catch {
    // fall through to mock
  }
  return mockProfileA; // fallback
}

export default function ComparePage() {
  const [urlA, setUrlA] = useState("");
  const [urlB, setUrlB] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [result, setResult] = useState<{ a: ProfileAudit; b: ProfileAudit; gap: GapAnalysis } | null>(null);
  const [captchaToken, setCaptchaToken] = useState("");
  const [emailGate, setEmailGate] = useState<{ nameA: string; nameB: string; scoreA: number; scoreB: number; gradeA: string; gradeB: string; comparisonId: string } | null>(null);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingStep("Scraping both profiles...");

    try {
      // Fetch both profiles in parallel
      const [auditA, auditB] = await Promise.all([
        fetchAudit(urlA),
        fetchAudit(urlB),
      ]);

      setLoadingStep("Generating gap analysis...");
      const gap = generateGapAnalysis(auditA, auditB);

      try {
        const id = await storeComparison({
          profileUrlA: urlA,
          profileUrlB: urlB,
          profileNameA: auditA.profile.name,
          profileNameB: auditB.profile.name,
          auditDataA: JSON.stringify(auditA),
          auditDataB: JSON.stringify(auditB),
          gapAnalysis: JSON.stringify(gap),
        });
        setLoading(false);
        router.push(`/compare/${id}`);
        return;
        return;
      } catch {
        setResult({ a: auditA, b: auditB, gap });
      }
    } catch {
      const gap = generateGapAnalysis(mockProfileB, mockProfileA);
      setResult({ a: mockProfileB, b: mockProfileA, gap });
    } finally {
      setLoading(false);
    }
  };

  // Email gate removed for growth phase — optimize for virality over friction

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full mx-auto mb-6" style={{ animation: "spin-slow 1s linear infinite" }} />
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Satoshi, sans-serif' }}>Comparing profiles...</h2>
          <p className="text-slate-400">{loadingStep}</p>
          <p className="text-slate-500 text-sm mt-4">This takes ~60 seconds while we scrape both profiles</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Satoshi, sans-serif' }}>Compare Profiles</h1>
          <p className="text-slate-400 mb-10 text-lg">See exactly where you stand vs. a top performer</p>
          <form onSubmit={handleCompare} className="space-y-5">
            <div>
              <label className="text-sm text-slate-400 block text-left mb-2">Your Profile</label>
              <input type="url" required placeholder="https://linkedin.com/in/you" value={urlA} onChange={(e) => setUrlA(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-accent/40 transition-colors" />
            </div>
            <div className="text-slate-600 text-2xl font-bold py-1">vs</div>
            <div>
              <label className="text-sm text-slate-400 block text-left mb-2">Their Profile</label>
              <input type="url" required placeholder="https://linkedin.com/in/competitor" value={urlB} onChange={(e) => setUrlB(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-accent/40 transition-colors" />
            </div>
            <Captcha onVerify={setCaptchaToken} />
            <button type="submit" disabled={!captchaToken} className="w-full bg-accent hover:bg-accent-dim disabled:opacity-40 disabled:cursor-not-allowed text-navy font-bold px-8 py-4 rounded-xl text-lg transition-colors mt-2">
              Compare Profiles
            </button>
          </form>
        </div>
      </div>
    );
  }

  const { a, b, gap } = result;

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Satoshi, sans-serif' }}>Profile Comparison</h1>
          <p className="text-slate-400 mt-2">Side-by-side analysis with gap report</p>
        </div>

        {/* Score comparison header */}
        <Card className="p-8">
          <div className="grid grid-cols-3 items-center">
            <div className="text-center">
              <div className="text-base font-bold text-white">{a.profile.name}</div>
              <div className="text-slate-500 text-sm mb-4">Your Profile</div>
              <div className="flex justify-center"><ScoreRing score={a.overallScore} grade={a.overallGrade} size={100} /></div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-slate-700" style={{ fontFamily: 'Satoshi, sans-serif' }}>VS</div>
              <div className="mt-2 text-accent text-sm font-medium">
                {b.overallScore > a.overallScore ? `+${b.overallScore - a.overallScore}` : b.overallScore < a.overallScore ? `-${a.overallScore - b.overallScore}` : "0"} point gap
              </div>
            </div>
            <div className="text-center">
              <div className="text-base font-bold text-white">{b.profile.name}</div>
              <div className="text-slate-500 text-sm mb-4">Competitor</div>
              <div className="flex justify-center"><ScoreRing score={b.overallScore} grade={b.overallGrade} size={100} /></div>
            </div>
          </div>
        </Card>

        {/* Side by side profiles */}
        <div className="grid md:grid-cols-2 gap-6">
          <ProfileSummary audit={a} label="Your Profile" />
          <ProfileSummary audit={b} label="Competitor" />
        </div>

        {/* Gap Analysis */}
        <Card>
          <CardHeader title="Gap Analysis" subtitle={gap.summary.biggestGaps.length > 0 ? `Biggest gaps: ${gap.summary.biggestGaps.join(" · ")}` : "Comparing key metrics"} />
          <div className="space-y-3">
            {gap.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="shrink-0 pt-0.5">
                  <Badge variant={rec.priority.toLowerCase() as "critical" | "high" | "medium" | "low"}>
                    {rec.priority}
                  </Badge>
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

        {/* Action Playbook */}
        <Card>
          <CardHeader title="🎯 Your Action Playbook" subtitle="Prioritized by impact. Start from the top." />
          <div className="space-y-3">
            {gap.recommendations
              .filter(r => r.priority === "Critical" || r.priority === "High")
              .map((rec, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-accent/[0.04] border border-accent/[0.08]">
                  <span className="text-accent font-bold text-lg leading-none mt-0.5 w-6 shrink-0">{i + 1}.</span>
                  <p className="text-sm text-slate-300 leading-relaxed">{rec.action}</p>
                </div>
              ))}
          </div>
        </Card>

        <div className="text-center pt-4">
          <button onClick={() => { setResult(null); setUrlA(""); setUrlB(""); }} className="text-slate-500 hover:text-white transition-colors text-sm">
            ← Compare different profiles
          </button>
        </div>
      </div>
    </div>
  );
}
