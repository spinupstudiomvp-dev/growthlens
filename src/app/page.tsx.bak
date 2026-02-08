"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader } from "@/components/ui";
import { mockProfileA } from "@/lib/mock-data";
import { ScoreRing, ProgressBar } from "@/components/charts";

function formatNum(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="min-h-screen" />;
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-36 px-6 md:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.06),transparent_50%)]" />
        <div className="absolute top-20 -right-40 w-[600px] h-[600px] bg-accent/[0.03] rounded-full blur-[120px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-sm font-medium mb-10">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Now in beta — free audits for early users
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-[1.05] mb-8">
              See why their LinkedIn<br />
              <span className="gradient-text">grows faster than yours</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Enter any LinkedIn profile. Get a complete strategy breakdown — content pillars, posting patterns, engagement tactics, and an action playbook to close the gap.
            </p>
          </div>
          <div className="animate-fade-in-delay flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/audit" className="bg-accent hover:bg-accent-dim text-navy font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-[1.02] animate-pulse-glow inline-block">
              Audit a Profile — Free
            </a>
            <a href="/compare" className="border border-white/[0.08] bg-white/[0.03] text-white font-semibold px-8 py-4 rounded-xl text-lg hover:bg-white/[0.06] transition-all inline-block">
              Compare Two Profiles
            </a>
          </div>
        </div>
      </section>

      {/* Sample Audit */}
      <section className="py-20 px-6 md:px-8 section-divider">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-accent font-mono text-sm font-semibold tracking-wider uppercase">See a Real Audit</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-4" style={{ fontFamily: 'Satoshi, sans-serif' }}>What you&apos;ll get</h2>
          </div>
          <Card className="relative overflow-hidden">
            <span className="absolute top-4 right-4 text-[10px] font-semibold uppercase tracking-widest text-accent/60 bg-accent/10 px-3 py-1 rounded-full border border-accent/10">Sample Audit</span>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Left: Score + Stats */}
              <div className="flex flex-col items-center gap-4 md:w-56 shrink-0">
                <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xl font-bold">{mockProfileA.profile.name.charAt(0)}</div>
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Satoshi, sans-serif' }}>{mockProfileA.profile.name}</h3>
                <ScoreRing score={mockProfileA.overallScore} grade={mockProfileA.overallGrade} size={110} />
                <div className="grid grid-cols-1 gap-2 text-sm w-full mt-2">
                  <div className="flex justify-between"><span className="text-slate-400">Followers</span><span className="text-white font-semibold">{formatNum(mockProfileA.profile.followers)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Eng. Rate</span><span className="text-white font-semibold">{mockProfileA.engagement.engagementRate}%</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Posts/wk</span><span className="text-white font-semibold">{mockProfileA.contentStrategy.postsPerWeek}</span></div>
                </div>
              </div>
              {/* Right: Breakdown + Top Posts */}
              <div className="flex-1 min-w-0 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-white mb-4">Score Breakdown</h4>
                  <div className="space-y-3">
                    {mockProfileA.breakdown.map((b, i) => (
                      <ProgressBar key={i} value={b.score} max={b.max} label={b.category} color={b.score >= 80 ? "#10b981" : b.score >= 60 ? "#3b82f6" : b.score >= 40 ? "#f59e0b" : "#ef4444"} />
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Top Posts</h4>
                  <div className="space-y-2">
                    {mockProfileA.contentStrategy.topPosts.slice(0, 3).map((post, i) => (
                      <div key={i} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <p className="text-slate-300 text-xs leading-relaxed flex-1 min-w-0 truncate">&ldquo;{post.text}&rdquo;</p>
                        <span className="text-[10px] text-slate-500 shrink-0">❤️ {formatNum(post.likes)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-2">
                  <a href="/audit" className="bg-accent hover:bg-accent-dim text-navy font-bold px-6 py-3 rounded-xl text-sm transition-all hover:scale-[1.02] inline-block">
                    Run your own audit — free
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Problem */}
      <section className="py-28 px-6 md:px-8 section-divider">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-accent font-mono text-sm font-semibold tracking-wider uppercase">The Problem</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-4 mb-5" style={{ fontFamily: 'Satoshi, sans-serif' }}>You&apos;re posting into the void</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">LinkedIn is the #1 growth channel for founders. But without data, you&apos;re guessing.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: "😤", title: "No idea what's working", desc: "You post 3x/week but can't tell which content drives followers vs. falls flat." },
              { icon: "📉", title: "Competitors grow faster", desc: "They seem to crack the algorithm. You're stuck at the same follower count for months." },
              { icon: "🎯", title: "Posting without strategy", desc: "Random topics, random times, random formats. That's not a strategy — it's noise." },
              { icon: "🔍", title: "No way to reverse-engineer", desc: "You can see their posts but can't extract the patterns that make their strategy work." },
            ].map((item, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-start gap-4">
                  <span className="text-2xl shrink-0 w-10 h-10 flex items-center justify-center">{item.icon}</span>
                  <div>
                    <h3 className="text-white font-semibold text-base mb-1.5">{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-28 px-6 md:px-8 section-divider">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-accent font-mono text-sm font-semibold tracking-wider uppercase">How It Works</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-4" style={{ fontFamily: 'Satoshi, sans-serif' }}>Three steps to LinkedIn clarity</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Paste a profile URL", desc: "Enter any LinkedIn profile — yours, a competitor's, or someone you admire.", icon: "🔗" },
              { step: "02", title: "AI analyzes everything", desc: "We scrape their profile & posts, then AI breaks down their entire strategy.", icon: "🧠" },
              { step: "03", title: "Get your playbook", desc: "Receive a scored audit with specific actions to replicate what works.", icon: "📋" },
            ].map((item, i) => (
              <Card key={i} className="p-6 text-center">
                <span className="text-accent font-mono text-xs font-bold tracking-widest">{item.step}</span>
                <div className="text-4xl mt-4 mb-4">{item.icon}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-28 px-6 md:px-8 section-divider">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-accent font-mono text-sm font-semibold tracking-wider uppercase">Features</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-4" style={{ fontFamily: 'Satoshi, sans-serif' }}>Everything you get in an audit</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: "Profile Score", desc: "0-100 completeness score with specific fixes for headline, about, banner, and featured sections.", color: "#10b981" },
              { title: "Content Strategy", desc: "Posting frequency, content pillars, format breakdown, hook patterns, and hashtag analysis.", color: "#3b82f6" },
              { title: "Engagement Intel", desc: "Average engagement rates, comment patterns, best posting times, and growth trajectory.", color: "#8b5cf6" },
              { title: "Top Posts Analysis", desc: "What made their viral posts work — hooks, formats, topics, and timing deconstructed.", color: "#f59e0b" },
              { title: "Posting Heatmap", desc: "Visual heatmap of when they post and when their audience is most active.", color: "#ef4444" },
              { title: "Action Playbook", desc: "Prioritized list of changes ranked by impact. Know exactly what to do first.", color: "#10b981" },
            ].map((item, i) => (
              <Card key={i} className="p-6">
                <div className="w-2 h-2 rounded-full mb-4" style={{ backgroundColor: item.color }} />
                <h3 className="text-white font-semibold text-base mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section className="py-28 px-6 md:px-8 section-divider">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Satoshi, sans-serif' }}>Get early access</h2>
          <p className="text-slate-400 mb-10 leading-relaxed">Join the waitlist for advanced features — automated weekly audits, trend alerts, and AI-written content suggestions.</p>
          {submitted ? (
            <Card className="p-6 text-accent font-semibold text-center">✓ You&apos;re on the list. We&apos;ll be in touch.</Card>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="flex gap-3">
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-5 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-accent/40 transition-colors"
              />
              <button type="submit" className="bg-accent hover:bg-accent-dim text-navy font-semibold px-6 py-3.5 rounded-xl transition-all hover:scale-[1.02] whitespace-nowrap">
                Join Waitlist
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-14 px-6 md:px-8 section-divider text-center">
        <p className="text-slate-500 text-sm">© 2026 GrowthLens. Built by <a href="https://orian.dev" className="text-slate-400 hover:text-white transition-colors">Orión</a> on behalf of <a href="https://happyoperators.com" className="text-slate-400 hover:text-white transition-colors">Happy Operators Inc</a></p>
      </footer>
    </div>
  );
}
