"use client";
import { useState } from "react";
import { mockProfileA, type ProfileAudit } from "@/lib/mock-data";
import { DonutChart, BarChart, HeatmapGrid, ScoreRing, ProgressBar, RadarChart } from "@/components/charts";
import { Card, CardHeader, StatCard, MetricRow } from "@/components/ui";

export default function AuditPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<ProfileAudit | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setAudit(mockProfileA);
      setLoading(false);
    }, 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full mx-auto mb-6" style={{ animation: "spin-slow 1s linear infinite" }} />
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Satoshi, sans-serif' }}>Analyzing profile...</h2>
          <p className="text-slate-400">Scraping posts, analyzing patterns, generating insights</p>
          <div className="mt-8 space-y-3 max-w-xs mx-auto text-left">
            {["Fetching profile data", "Scraping recent posts", "Analyzing content patterns", "Generating audit report"].map((step, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-400 animate-fade-in" style={{ animationDelay: `${i * 0.6}s` }}>
                <span className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center"><span className="w-2 h-2 rounded-full bg-accent" /></span>
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-xl w-full text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Satoshi, sans-serif' }}>Audit a LinkedIn Profile</h1>
          <p className="text-slate-400 mb-10 text-lg">Paste any LinkedIn profile URL to get a full strategy breakdown</p>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input type="url" required placeholder="https://linkedin.com/in/username" value={url} onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-accent/40 transition-colors text-lg" />
            <button type="submit" className="bg-accent hover:bg-accent-dim text-navy font-bold px-8 py-4 rounded-xl text-lg transition-colors whitespace-nowrap">Analyze</button>
          </form>
          <p className="text-slate-500 text-sm mt-4">Try it with any LinkedIn URL — we&apos;ll show a demo audit</p>
        </div>
      </div>
    );
  }

  const { profile, contentStrategy, engagement } = audit;

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
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
          <ScoreRing score={audit.overallScore} grade={audit.overallGrade} />
        </div>

        {/* Overall Breakdown */}
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
          {/* Profile Audit */}
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
                  <span className={`text-xs ${profile.aboutAnalysis.hasHook ? "text-accent" : "text-red"}`}>{profile.aboutAnalysis.hasHook ? "✓" : "✗"} Hook</span>
                  <span className={`text-xs ${profile.aboutAnalysis.hasCTA ? "text-accent" : "text-red"}`}>{profile.aboutAnalysis.hasCTA ? "✓" : "✗"} CTA</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-300">Banner</span><span className="text-accent">{profile.bannerAssessment.score}/100</span></div>
                <p className="text-xs text-slate-500">{profile.bannerAssessment.quality}</p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">Featured Section</span>
                  <span className={profile.featuredSection.hasItems ? "text-accent text-xs" : "text-red text-xs"}>{profile.featuredSection.hasItems ? `${profile.featuredSection.count} items` : "Empty"}</span>
                </div>
                {profile.featuredSection.types.length > 0 && (
                  <div className="flex gap-2 mt-1 flex-wrap">{profile.featuredSection.types.map((t, i) => <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">{t}</span>)}</div>
                )}
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-300">Experience Framing</span><span className="text-accent">{profile.experienceFraming.score}/100</span></div>
                <div className="flex gap-4 mt-1">
                  <span className={`text-xs ${profile.experienceFraming.actionOriented ? "text-accent" : "text-red"}`}>{profile.experienceFraming.actionOriented ? "✓" : "✗"} Action-oriented</span>
                  <span className={`text-xs ${profile.experienceFraming.metricsUsed ? "text-accent" : "text-red"}`}>{profile.experienceFraming.metricsUsed ? "✓" : "✗"} Uses metrics</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Engagement */}
          <Card>
            <CardHeader title="Engagement Analysis" />
            <div className="grid grid-cols-3 gap-3 mb-6">
              <StatCard label="Avg Likes" value={engagement.avgLikes.toLocaleString()} />
              <StatCard label="Avg Comments" value={engagement.avgComments.toLocaleString()} />
              <StatCard label="Avg Shares" value={engagement.avgShares.toLocaleString()} />
            </div>
            <div>
              <MetricRow label="Engagement Rate" value={`${engagement.engagementRate}%`} accent />
              <MetricRow label="Reply Rate" value={`${engagement.replyRate}%`} />
              <MetricRow label="Avg Reply Time" value={engagement.avgReplyTime} />
              <MetricRow label="Growth Estimate" value={engagement.growthEstimate} accent />
            </div>
          </Card>

          {/* Content Types */}
          <Card>
            <CardHeader title="Content Type Breakdown" />
            <DonutChart data={contentStrategy.contentTypes} />
          </Card>

          {/* Posting Frequency */}
          <Card>
            <CardHeader title="Posting Frequency" />
            <div className="text-3xl font-bold text-white mb-1">{contentStrategy.postsPerWeek}<span className="text-slate-500 text-lg font-normal"> posts/week</span></div>
            <div className="mt-4">
              <BarChart data={contentStrategy.weeklyFrequency} max={8} />
              <p className="text-xs text-slate-500 mt-3">Posts per week — last 12 weeks</p>
            </div>
          </Card>

          {/* Content Pillars */}
          <Card>
            <CardHeader title="Content Pillars" />
            <div className="space-y-4">
              {contentStrategy.contentPillars.map((pillar, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5"><span className="text-slate-300">{pillar.topic}</span><span className="text-slate-400">{pillar.percentage}%</span></div>
                  <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${pillar.percentage}%`, opacity: 1 - i * 0.15 }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Hook Patterns */}
          <Card>
            <CardHeader title="Hook Patterns" />
            <div className="space-y-3">
              {contentStrategy.hookPatterns.map((hook, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-slate-300 shrink-0">{hook.pattern}</div>
                  <div className="flex-1 h-7 bg-white/[0.04] rounded overflow-hidden">
                    <div className="h-full bg-accent/50 rounded flex items-center pl-3 text-xs text-white font-medium" style={{ width: `${hook.percentage}%` }}>
                      {hook.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Top Posts */}
        <Card>
          <CardHeader title="Top Performing Posts" />
          <div className="space-y-3">
            {contentStrategy.topPosts.map((post, i) => (
              <div key={i} className="flex items-start justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex-1 min-w-0">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent mb-2 inline-block">{post.type}</span>
                  <p className="text-slate-300 text-sm leading-relaxed">&ldquo;{post.text}&rdquo;</p>
                </div>
                <div className="flex gap-4 text-xs text-slate-400 shrink-0 pt-1">
                  <span>❤️ {post.likes.toLocaleString()}</span>
                  <span>💬 {post.comments}</span>
                  <span>🔄 {post.shares}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Hashtags + Schedule */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Hashtag Strategy" subtitle={`Average ${contentStrategy.hashtagStrategy.avg} hashtags per post`} />
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

        {/* Back */}
        <div className="text-center pt-4">
          <button onClick={() => { setAudit(null); setUrl(""); }} className="text-slate-500 hover:text-white transition-colors text-sm">
            ← Audit another profile
          </button>
        </div>
      </div>
    </div>
  );
}
