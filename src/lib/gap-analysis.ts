import type { ProfileAudit } from "./mock-data";

export interface GapAnalysis {
  recommendations: { priority: string; action: string; impact: number }[];
  summary: { yourScore: number; theirScore: number; biggestGaps: string[] };
}

export function generateGapAnalysis(yours: ProfileAudit, theirs: ProfileAudit): GapAnalysis {
  const recs: { priority: string; action: string; impact: number }[] = [];
  const gaps: string[] = [];

  // Posting frequency
  const freqDiff = theirs.contentStrategy.postsPerWeek - yours.contentStrategy.postsPerWeek;
  if (freqDiff > 1) {
    gaps.push("Posting frequency");
    recs.push({
      priority: freqDiff > 3 ? "Critical" : "High",
      action: `Increase posting frequency from ${yours.contentStrategy.postsPerWeek}x to at least ${Math.round(theirs.contentStrategy.postsPerWeek)}x per week. Consistency is the #1 growth lever.`,
      impact: Math.min(98, Math.round(60 + freqDiff * 8)),
    });
  }

  // Headline
  const headlineDiff = theirs.profile.headlineAnalysis.effectiveness - yours.profile.headlineAnalysis.effectiveness;
  if (headlineDiff > 15) {
    gaps.push("Headline quality");
    recs.push({
      priority: headlineDiff > 30 ? "Critical" : "High",
      action: `Rewrite headline: They use a "${theirs.profile.headlineAnalysis.formula}" formula (${theirs.profile.headlineAnalysis.effectiveness}/100). Yours scores ${yours.profile.headlineAnalysis.effectiveness}/100. ${yours.profile.headlineAnalysis.suggestion}`,
      impact: Math.min(95, Math.round(50 + headlineDiff)),
    });
  }

  // Content format diversity
  const theirFormats = theirs.contentStrategy.contentTypes.length;
  const yourFormats = yours.contentStrategy.contentTypes.length;
  if (theirFormats > yourFormats) {
    const missingTypes = theirs.contentStrategy.contentTypes
      .filter(t => !yours.contentStrategy.contentTypes.find(y => y.type.toLowerCase() === t.type.toLowerCase()))
      .map(t => t.type);
    if (missingTypes.length > 0) {
      gaps.push("Content format diversity");
      recs.push({
        priority: missingTypes.length > 1 ? "High" : "Medium",
        action: `Start using ${missingTypes.join(", ").toLowerCase()}. They use ${theirFormats} content formats vs your ${yourFormats}. Diverse formats get more algorithmic reach.`,
        impact: Math.min(90, 60 + missingTypes.length * 10),
      });
    }
  }

  // Banner
  if (!yours.profile.bannerAssessment.hasBanner && theirs.profile.bannerAssessment.hasBanner) {
    recs.push({
      priority: "High",
      action: "Add a banner image with your value proposition. It's free real estate you're leaving blank.",
      impact: 80,
    });
  }

  // About section
  const aboutDiff = theirs.profile.aboutAnalysis.score - yours.profile.aboutAnalysis.score;
  if (aboutDiff > 20) {
    gaps.push("Profile completeness");
    const issues = [];
    if (!yours.profile.aboutAnalysis.hasHook) issues.push("hook");
    if (!yours.profile.aboutAnalysis.hasCTA) issues.push("CTA");
    recs.push({
      priority: aboutDiff > 40 ? "High" : "Medium",
      action: `Improve your About section (${yours.profile.aboutAnalysis.score} vs ${theirs.profile.aboutAnalysis.score}). ${issues.length > 0 ? `Missing: ${issues.join(", ")}. ` : ""}Use a "${theirs.profile.aboutAnalysis.structure}" structure.`,
      impact: Math.min(85, 45 + aboutDiff),
    });
  }

  // Engagement rate
  const engDiff = theirs.engagement.engagementRate - yours.engagement.engagementRate;
  if (engDiff > 0.5) {
    gaps.push("Engagement rate");
    recs.push({
      priority: engDiff > 2 ? "High" : "Medium",
      action: `Your engagement rate is ${yours.engagement.engagementRate}% vs their ${theirs.engagement.engagementRate}%. Focus on hooks that stop the scroll and ask questions to drive comments.`,
      impact: Math.min(90, Math.round(50 + engDiff * 10)),
    });
  }

  // Hook patterns
  const theirTopHook = theirs.contentStrategy.hookPatterns[0];
  const yourTopHook = yours.contentStrategy.hookPatterns[0];
  if (theirTopHook && yourTopHook && theirTopHook.pattern !== yourTopHook.pattern) {
    recs.push({
      priority: "Medium",
      action: `They lead with "${theirTopHook.pattern}" hooks (${theirTopHook.percentage}% of posts). You mostly use "${yourTopHook.pattern}" (${yourTopHook.percentage}%). Test their approach.`,
      impact: 65,
    });
  }

  // Hashtags
  const yourHashtags = yours.contentStrategy.hashtagStrategy.avg;
  const theirHashtags = theirs.contentStrategy.hashtagStrategy.avg;
  if (yourHashtags > 5 && theirHashtags < yourHashtags) {
    recs.push({
      priority: "Medium",
      action: `Reduce hashtags from ${yourHashtags} to ${Math.max(3, theirHashtags)}. Over-hashtagging signals spam to the algorithm.`,
      impact: 55,
    });
  } else if (yourHashtags === 0 && theirHashtags > 0) {
    recs.push({
      priority: "Low",
      action: `Start using ${theirHashtags} targeted hashtags per post. They use: ${theirs.contentStrategy.hashtagStrategy.topHashtags.slice(0, 4).join(", ")}.`,
      impact: 40,
    });
  }

  // Reply rate / timing
  if ((yours.engagement.replyRate ?? 0) < (theirs.engagement.replyRate ?? 0) - 20) {
    recs.push({
      priority: "Medium",
      action: `Reply to comments faster. Early engagement signals boost algorithmic reach significantly.`,
      impact: 70,
    });
  }

  // Featured section
  if (!yours.profile.featuredSection.hasItems && theirs.profile.featuredSection.hasItems) {
    recs.push({
      priority: "Low",
      action: `Add featured items to your profile. They have ${theirs.profile.featuredSection.count} featured items showcasing their best work.`,
      impact: 40,
    });
  }

  // Sort by impact
  recs.sort((a, b) => b.impact - a.impact);

  // If we have very few recs, add a generic one
  if (recs.length < 3) {
    recs.push({
      priority: "Medium",
      action: "Study their top-performing posts and identify patterns you can adapt for your own audience.",
      impact: 50,
    });
  }

  return {
    recommendations: recs.slice(0, 10),
    summary: {
      yourScore: yours.overallScore,
      theirScore: theirs.overallScore,
      biggestGaps: gaps.slice(0, 4),
    },
  };
}
