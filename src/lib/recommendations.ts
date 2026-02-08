import type { ProfileAudit } from "./mock-data";

export interface Recommendation {
  priority: "Critical" | "High" | "Medium" | "Low";
  action: string;
  impact: number;
}

export interface AuditRecommendations {
  recommendations: Recommendation[];
  summary: { score: number; topAreas: string[] };
}

export function generateRecommendations(audit: ProfileAudit): AuditRecommendations {
  const recs: Recommendation[] = [];
  const { profile, contentStrategy, engagement } = audit;

  // Posting frequency (benchmark: 4x/week)
  if (contentStrategy.postsPerWeek < 4) {
    const gap = 4 - contentStrategy.postsPerWeek;
    const severity = gap >= 2.5 ? "Critical" : gap >= 1.5 ? "High" : "Medium";
    recs.push({
      priority: severity,
      action: `Increase posting frequency from ${contentStrategy.postsPerWeek}x to at least 4x per week. Consistency is the #1 growth lever on LinkedIn.`,
      impact: Math.min(95, Math.round(60 + gap * 10)),
    });
  }

  // Headline quality (benchmark: 80+)
  if (profile.headlineAnalysis.effectiveness < 80) {
    const gap = 80 - profile.headlineAnalysis.effectiveness;
    const severity = gap >= 40 ? "Critical" : gap >= 20 ? "High" : "Medium";
    recs.push({
      priority: severity,
      action: `Rewrite your headline (currently ${profile.headlineAnalysis.effectiveness}/100). ${profile.headlineAnalysis.suggestion}`,
      impact: Math.min(90, Math.round(50 + gap)),
    });
  }

  // About section (benchmark: hook + CTA + good score)
  if (!profile.aboutAnalysis.hasHook || !profile.aboutAnalysis.hasCTA || profile.aboutAnalysis.score < 70) {
    const issues: string[] = [];
    if (!profile.aboutAnalysis.hasHook) issues.push("a compelling hook");
    if (!profile.aboutAnalysis.hasCTA) issues.push("a clear CTA");
    if (profile.aboutAnalysis.score < 70) issues.push("more depth (aim for 200+ words)");
    const severity = issues.length >= 2 ? "High" : "Medium";
    recs.push({
      priority: severity,
      action: `Improve your About section (${profile.aboutAnalysis.score}/100). Add ${issues.join(", ")}. Structure: Hook → Story → Credibility → CTA.`,
      impact: Math.min(75, Math.round(40 + issues.length * 12)),
    });
  }

  // Content format diversity (benchmark: 3+ formats with meaningful %)
  const activeFormats = contentStrategy.contentTypes.filter(t => t.percentage >= 10).length;
  if (activeFormats < 3) {
    const missing = contentStrategy.contentTypes.filter(t => t.percentage < 10).map(t => t.type);
    recs.push({
      priority: activeFormats <= 1 ? "High" : "Medium",
      action: `Diversify content formats — you actively use only ${activeFormats} format${activeFormats === 1 ? "" : "s"}. Start adding ${missing.slice(0, 2).join(" and ")}. Carousels get 3x more reach than text-only posts.`,
      impact: Math.round(55 + (3 - activeFormats) * 15),
    });
  }

  // Engagement rate (benchmark by follower tier)
  const followers = profile.followers;
  const benchmark = followers < 5000 ? 3 : followers < 20000 ? 2 : 1.5;
  if (engagement.engagementRate < benchmark) {
    const gap = benchmark - engagement.engagementRate;
    recs.push({
      priority: gap >= 1.5 ? "High" : "Medium",
      action: `Your engagement rate (${engagement.engagementRate}%) is below the ${benchmark}% benchmark for your follower tier (${followers < 5000 ? "<5K" : followers < 20000 ? "5-20K" : "20K+"} followers). Focus on hooks, ask questions, and reply to every comment.`,
      impact: Math.min(80, Math.round(45 + gap * 15)),
    });
  }

  // Banner
  if (!profile.bannerAssessment.hasBanner) {
    recs.push({
      priority: "High",
      action: "Add a banner image with your value proposition. It's free real estate you're leaving blank — visitors see it first.",
      impact: 80,
    });
  }

  // Featured section
  if (!profile.featuredSection.hasItems) {
    recs.push({
      priority: "Low",
      action: "Add 3-4 featured items: your best content, newsletter, or a lead magnet. This section converts profile visitors into followers.",
      impact: 40,
    });
  }

  // Hashtag strategy (3-5 ideal)
  const avgHashtags = contentStrategy.hashtagStrategy.avg;
  if (avgHashtags < 3 || avgHashtags > 5) {
    const issue = avgHashtags < 3
      ? `Increase hashtags from ${avgHashtags} to 3-5 per post for better discoverability.`
      : `Reduce hashtags from ${avgHashtags} to 3-5 per post. Over-hashtagging signals spam to the algorithm.`;
    recs.push({
      priority: "Medium",
      action: issue,
      impact: avgHashtags > 7 ? 55 : 45,
    });
  }

  // Hook variety (benchmark: 3+ patterns with meaningful %)
  const activeHooks = contentStrategy.hookPatterns.filter(h => h.percentage >= 15).length;
  if (activeHooks < 3) {
    recs.push({
      priority: "Medium",
      action: `Diversify your hook patterns — you rely heavily on ${contentStrategy.hookPatterns[0]?.pattern || "one style"}. Try personal stories, contrarian takes, and stat-based hooks to stop the scroll.`,
      impact: 60,
    });
  }

  // Reply rate
  if (engagement.replyRate < 60) {
    const severity = engagement.replyRate < 30 ? "High" : "Medium";
    recs.push({
      priority: severity,
      action: `Your reply rate is ${engagement.replyRate}% — aim for 80%+. Replying to comments within 2 hours boosts reach 4x through the algorithm's engagement signals.`,
      impact: Math.min(75, Math.round(40 + (60 - engagement.replyRate))),
    });
  }

  // Sort by impact descending
  recs.sort((a, b) => b.impact - a.impact);

  const topAreas = recs.slice(0, 4).map(r => {
    if (r.action.includes("posting frequency")) return "Posting frequency";
    if (r.action.includes("headline")) return "Headline";
    if (r.action.includes("About section")) return "About section";
    if (r.action.includes("content formats")) return "Content diversity";
    if (r.action.includes("engagement rate")) return "Engagement rate";
    if (r.action.includes("banner")) return "Banner";
    if (r.action.includes("hashtag")) return "Hashtag strategy";
    if (r.action.includes("hook")) return "Hook variety";
    if (r.action.includes("reply rate")) return "Reply rate";
    if (r.action.includes("featured")) return "Featured section";
    return "Profile optimization";
  });

  return { recommendations: recs, summary: { score: audit.overallScore, topAreas } };
}
