"use client";
import { useEffect, useState, use, useCallback } from "react";
import { getAudit } from "@/lib/convex";
import type { ProfileAudit } from "@/lib/mock-data";
import { DonutChart, BarChart, HeatmapGrid, ScoreRing, ProgressBar, RadarChart } from "@/components/charts";
import { Card, CardHeader, StatCard, MetricRow, Badge } from "@/components/ui";
import { generateRecommendations } from "@/lib/recommendations";
import PostLibrary from "@/components/PostLibrary";
import CompareCTA from "@/components/CompareCTA";
import TrackButton from "@/components/TrackButton";
import FeedbackPrompt from "@/components/FeedbackPrompt";

function ShareSection({ audit, auditId }: { audit: ProfileAudit; auditId: string }) {
  const [copied, setCopied] = useState(false);
  const auditUrl = typeof window !== "undefined"
    ? `${window.location.origin}/audit/${auditId}`
    : `https://growthlens-blue.vercel.app/audit/${auditId}`;

  const tweetText = `My LinkedIn profile scored ${audit.overallScore}/100 on GrowthLens. Check yours →`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(auditUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(auditUrl)}`;

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(auditUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [auditUrl]);

  return (
    <Card>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-1">
        <div>
          <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Satoshi, sans-serif' }}>Share Your Score</h3>
          <p className="text-slate-400 text-sm mt-0.5">Show off your LinkedIn game 🚀</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{ background: "rgba(0,119,181,0.15)", color: "#0077B5", border: "1px solid rgba(0,119,181,0.2)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            LinkedIn
          </a>
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{ background: "rgba(255,255,255,0.05)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Twitter/X
          </a>
          <button
            onClick={copyLink}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{ background: "rgba(255,255,255,0.05)", color: copied ? "#10b981" : "#e2e8f0", border: `1px solid ${copied ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.1)"}` }}
          >
            {copied ? "✓ Copied!" : "🔗 Copy Link"}
          </button>
        </div>
      </div>
    </Card>
  );
}

export default function SavedAuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [audit, setAudit] = useState<ProfileAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    getAudit(id).then((data) => {
      if (data?.auditData) {
        setAudit(JSON.parse(data.auditData));
      } else {
        setError("Audit not found");
      }
      setLoading(false);
    }).catch(() => { setError("Failed to load audit"); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full" style={{ animation: "spin-slow 1s linear infinite" }} />
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Audit not found</h2>
          <p className="text-slate-400 mb-6">This audit may have been removed or the link is invalid.</p>
          <a href="/audit" className="text-accent hover:underline">Run a new audit →</a>
        </div>
      </div>
    );
  }

  const { profile, contentStrategy, engagement } = audit;
  const { recommendations, summary } = generateRecommendations(audit);

  const handlePDF = async () => {
    setPdfLoading(true);
    try {
      const { exportAuditPDF } = await import("@/lib/pdf-export");
      await exportAuditPDF("audit-content", profile.name);
    } catch (e) { console.error("PDF export failed", e); }
    setPdfLoading(false);
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div id="audit-content" className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xl font-bold shrink-0">{profile.name.charAt(0)}</div>
              <div>
                <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Satoshi, sans-serif' }}>{profile.name}</h1>
                <p className="text-slate-400 text-sm mt-0.5">{profile.headline}</p>
              </div>
            </div>
            <div className="flex gap-6 text-sm ml-[4.5rem]">
              <span className="text-slate-400"><span className="text-white font-semibold">{profile.followers.toLocaleString()}</span> followers</span>
              <span className="text-slate-400"><span className="text-white font-semibold">{profile.connections.toLocaleString()}</span> connections</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <TrackButton profileUrl={audit.profile.url} />
            <button onClick={handlePDF} disabled={pdfLoading} className="px-4 py-2 rounded-xl border border-white/[0.08] text-slate-300 hover:text-white hover:border-white/20 transition-colors text-sm disabled:opacity-50">
              {pdfLoading ? "Generating PDF..." : "📄 Download PDF"}
            </button>
            <ScoreRing score={audit.overallScore} grade={audit.overallGrade} />
          </div>
        </div>

        {/* Share Your Score */}
        <ShareSection audit={audit} auditId={id} />

        <Card>
          <CardHeader title="Overall Breakdown" />
          <div className="flex flex-col md:flex-row items-center gap-8">
            <RadarChart data={audit.breakdown} />
            <div className="flex-1 space-y-4 w-full">
              {audit.breakdown.map((b, i) => (
                <ProgressBar key={i} value={b.score} max={b.max} label={b.category} color={b.score >= 80 ? "#10b981" : b.score >= 60 ? "#3b82f6" : b.score >= 40 ? "#f59e0b" : "#ef4444"} />
              ))}
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Profile Audit" />
            <div className="space-y-5">
              <ProgressBar value={profile.completenessScore} label="Profile Completeness" />
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-300">Headline</span><span className="text-accent">{profile.headlineAnalysis.effectiveness}/100</span></div>
                <p className="text-xs text-slate-500">Formula: {profile.headlineAnalysis.formula}</p>
                <p className="text-xs text-slate-400 mt-1">💡 {profile.headlineAnalysis.suggestion}</p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-300">About Section</span><span className="text-accent">{profile.aboutAnalysis.score}/100</span></div>
                <p className="text-xs text-slate-500">Structure: {profile.aboutAnalysis.structure}</p>
                <div className="flex gap-4 mt-1">
                  <span className={`text-xs ${profile.aboutAnalysis.hasHook ? "text-accent" : "text-red-400"}`}>{profile.aboutAnalysis.hasHook ? "✓" : "✗"} Hook</span>
                  <span className={`text-xs ${profile.aboutAnalysis.hasCTA ? "text-accent" : "text-red-400"}`}>{profile.aboutAnalysis.hasCTA ? "✓" : "✗"} CTA</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-300">Banner</span><span className="text-accent">{profile.bannerAssessment.score}/100</span></div>
                <p className="text-xs text-slate-500">{profile.bannerAssessment.quality}</p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Engagement Analysis" />
            <div className="grid grid-cols-3 gap-3 mb-6">
              <StatCard label="Avg Likes" value={engagement.avgLikes.toLocaleString()} />
              <StatCard label="Avg Comments" value={engagement.avgComments.toLocaleString()} />
              <StatCard label="Avg Shares" value={engagement.avgShares.toLocaleString()} />
            </div>
            <div>
              <MetricRow label="Engagement Rate" value={`${engagement.engagementRate}%`} accent />
              {engagement.replyRate != null && <MetricRow label="Reply Rate" value={`${engagement.replyRate}%`} />}
              {engagement.growthEstimate && <MetricRow label="Growth Estimate" value={engagement.growthEstimate} accent />}
            </div>
          </Card>

          <Card>
            <CardHeader title="Content Type Breakdown" />
            <DonutChart data={contentStrategy.contentTypes} />
          </Card>

          <Card>
            <CardHeader title="Posting Frequency" />
            <div className="text-3xl font-bold text-white mb-1">{contentStrategy.postsPerWeek}<span className="text-slate-500 text-lg font-normal"> posts/week</span></div>
            <div className="mt-4">
              <BarChart data={contentStrategy.weeklyFrequency} max={8} />
              <p className="text-xs text-slate-500 mt-3">Posts per week — last 12 weeks</p>
            </div>
          </Card>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Card>
            <CardHeader title="Recommendations" subtitle={summary.topAreas.length > 0 ? `Focus areas: ${summary.topAreas.join(" · ")}` : "Your profile is in great shape!"} />
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
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
        )}

        {/* Action Playbook */}
        {recommendations.filter(r => r.priority === "Critical" || r.priority === "High").length > 0 && (
          <Card>
            <CardHeader title="🎯 Your Action Playbook" subtitle="Prioritized by impact. Start from the top." />
            <div className="space-y-3">
              {recommendations
                .filter(r => r.priority === "Critical" || r.priority === "High")
                .map((rec, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-accent/[0.04] border border-accent/[0.08]">
                    <span className="text-accent font-bold text-lg leading-none mt-0.5 w-6 shrink-0">{i + 1}.</span>
                    <p className="text-sm text-slate-300 leading-relaxed">{rec.action}</p>
                  </div>
                ))}
            </div>
          </Card>
        )}

        {/* Post Library with Pillar Distribution */}
        <PostLibrary posts={contentStrategy.topPosts} followers={profile.followers} />

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Hashtag Strategy" subtitle={`Average ${contentStrategy.hashtagStrategy.avg} per post`} />
            <div className="flex flex-wrap gap-2">
              {contentStrategy.hashtagStrategy.topHashtags.map((tag, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-sm border border-accent/10">{tag}</span>
              ))}
            </div>
          </Card>
          <Card>
            <CardHeader title="Posting Schedule" />
            <HeatmapGrid data={contentStrategy.postingSchedule} />
          </Card>
        </div>

        {/* Feedback */}
        <FeedbackPrompt auditId={id} profileUrl={profile.url} />

        {/* Compare CTA */}
        <CompareCTA profileName={profile.name} profileUrl={profile.url} />

        <div className="text-center pt-4">
          <a href="/audit" className="text-slate-500 hover:text-white transition-colors text-sm">← Run a new audit</a>
        </div>
      </div>
    </div>
  );
}
