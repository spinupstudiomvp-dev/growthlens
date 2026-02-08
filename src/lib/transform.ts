import type { ProfileAudit } from "./mock-data";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function transformProfileAndPosts(profile: any, posts: any[]): ProfileAudit {
  const name = `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Unknown";
  const headline = profile.headline || "";
  const publicId = profile.public_id || "";
  const followers = profile.followersCount || profile.followerCount || 0;
  const connections = profile.connectionsCount || 500;

  // Profile completeness
  const hasAbout = !!profile.summary;
  const hasBanner = !!profile.backgroundImage;
  const hasPhoto = !!profile.displayPictureUrl;
  const hasExperience = (profile.experience?.length || 0) > 0;
  const hasEducation = (profile.education?.length || 0) > 0;
  const hasSkills = (profile.skills?.length || 0) > 0;
  const hasCertifications = (profile.certifications?.length || 0) > 0;
  const completenessItems = [hasAbout, hasBanner, hasPhoto, hasExperience, hasEducation, hasSkills, !!headline];
  const completenessScore = Math.round((completenessItems.filter(Boolean).length / completenessItems.length) * 100);

  // Headline analysis
  const headlineParts = headline.split(/[|·•,]/).map((s: string) => s.trim()).filter(Boolean);
  const headlineFormula = headlineParts.length >= 3 ? "Role + Niche + Value" : headlineParts.length === 2 ? "Role + Niche" : "Basic";
  const headlineEffectiveness = Math.min(95, headlineParts.length * 25 + (headline.length > 40 ? 15 : 0));

  // About analysis
  const aboutText = profile.summary || "";
  const hasHook = aboutText.length > 0 && /^[A-Z🔥🚀💡✨]/.test(aboutText.trim());
  const hasCTA = /contact|reach|email|book|schedule|connect|DM/i.test(aboutText);
  const aboutScore = Math.min(100, (aboutText.length > 50 ? 30 : 10) + (hasHook ? 25 : 0) + (hasCTA ? 25 : 0) + (aboutText.length > 200 ? 20 : aboutText.length > 100 ? 10 : 0));

  // Experience framing
  const expDescriptions = (profile.experience || []).map((e: any) => e.description || "").join(" ");
  const actionOriented = /led|built|grew|launched|increased|managed|created|designed|developed/i.test(expDescriptions);
  const metricsUsed = /\d+%|\$\d|[0-9]+x|million|thousand/i.test(expDescriptions);
  const expScore = (actionOriented ? 40 : 15) + (metricsUsed ? 40 : 10) + (profile.experience?.length > 2 ? 20 : 10);

  // Posts analysis
  const postCount = posts.length || 1;
  const totalLikes = posts.reduce((sum: number, p: any) => sum + (p.numLikes || p.likesCount || 0), 0);
  const totalComments = posts.reduce((sum: number, p: any) => sum + (p.numComments || p.commentsCount || 0), 0);
  const totalShares = posts.reduce((sum: number, p: any) => sum + (p.numShares || p.sharesCount || p.repostsCount || 0), 0);
  const avgLikes = Math.round(totalLikes / postCount);
  const avgComments = Math.round(totalComments / postCount);
  const avgShares = Math.round(totalShares / postCount);
  const engagementRate = followers > 0 ? Math.round(((totalLikes + totalComments) / postCount / followers) * 10000) / 100 : 0;

  // Content types
  const typeMap: Record<string, number> = {};
  posts.forEach((p: any) => {
    const type = p.type || (p.images?.length ? "image" : p.video ? "video" : p.document ? "document" : "text");
    typeMap[type] = (typeMap[type] || 0) + 1;
  });
  const colors = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];
  const contentTypes = Object.entries(typeMap).map(([type, count], i) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    percentage: Math.round((count / postCount) * 100),
    color: colors[i % colors.length],
  }));
  if (contentTypes.length === 0) contentTypes.push({ type: "Text", percentage: 100, color: colors[0] });

  // Weekly frequency (estimate from post dates)
  const weeklyFrequency: number[] = new Array(12).fill(0);
  const now = Date.now();
  posts.forEach((p: any) => {
    const ts = p.postedAtTimestamp || (p.postedAtISO ? new Date(p.postedAtISO).getTime() : 0);
    if (ts) {
      const weeksAgo = Math.floor((now - ts) / (7 * 24 * 3600 * 1000));
      if (weeksAgo >= 0 && weeksAgo < 12) weeklyFrequency[11 - weeksAgo]++;
    }
  });
  const postsPerWeek = Math.round((postCount / Math.max(12, 1)) * 10) / 10;

  // Content pillars (extract from hashtags/text)
  const allText = posts.map((p: any) => p.text || "").join(" ");
  const hashtagMatches = allText.match(/#\w+/g) || [];
  const hashtagCounts: Record<string, number> = {};
  hashtagMatches.forEach((tag: string) => { hashtagCounts[tag.toLowerCase()] = (hashtagCounts[tag.toLowerCase()] || 0) + 1; });
  const topHashtags = Object.entries(hashtagCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([tag]) => tag);
  const avgHashtags = postCount > 0 ? Math.round(hashtagMatches.length / postCount) : 0;

  // Top posts
  const sortedPosts = [...posts].sort((a: any, b: any) => ((b.numLikes || b.likesCount || 0) + (b.numComments || b.commentsCount || 0)) - ((a.numLikes || a.likesCount || 0) + (a.numComments || a.commentsCount || 0)));
  const topPosts = sortedPosts.slice(0, 5).map((p: any) => ({
    text: (p.text || "").slice(0, 150) + ((p.text || "").length > 150 ? "..." : ""),
    likes: p.numLikes || p.likesCount || 0,
    comments: p.numComments || p.commentsCount || 0,
    shares: p.numShares || p.sharesCount || p.repostsCount || 0,
    type: p.type || "text",
  }));

  // Hook patterns
  const hookTypes: Record<string, number> = { Question: 0, Statement: 0, Story: 0, Statistic: 0, Contrarian: 0 };
  posts.forEach((p: any) => {
    const firstLine = (p.text || "").split("\n")[0] || "";
    if (firstLine.includes("?")) hookTypes.Question++;
    else if (/\d+%|\d+ out of|\$/.test(firstLine)) hookTypes.Statistic++;
    else if (/I |My |When I/.test(firstLine)) hookTypes.Story++;
    else if (/stop|don't|never|wrong|myth|unpopular/i.test(firstLine)) hookTypes.Contrarian++;
    else hookTypes.Statement++;
  });
  const hookPatterns = Object.entries(hookTypes).filter(([, v]) => v > 0).map(([pattern, count]) => ({
    pattern, percentage: Math.round((count / postCount) * 100),
  }));

  // Posting schedule heatmap (7 days x 24 hours, simplified)
  const schedule: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));
  posts.forEach((p: any) => {
    const ts = p.postedAtTimestamp || (p.postedAtISO ? new Date(p.postedAtISO).getTime() : 0);
    if (ts) {
      const d = new Date(ts);
      schedule[d.getDay()][d.getHours()]++;
    }
  });

  // Content pillars from common words
  const words = allText.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter((w: string) => w.length > 5);
  const wordCounts: Record<string, number> = {};
  words.forEach((w: string) => { wordCounts[w] = (wordCounts[w] || 0) + 1; });
  const contentPillars = Object.entries(wordCounts)
    .filter(([w]) => !["people", "about", "their", "would", "which", "there", "think", "these", "being", "should"].includes(w))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic, count]) => ({ topic: topic.charAt(0).toUpperCase() + topic.slice(1), percentage: Math.round((count / words.length) * 100) }));

  // Breakdown scores
  const profileScore = Math.round((completenessScore + headlineEffectiveness + aboutScore + expScore) / 4);
  const contentScore = Math.min(100, Math.round(postsPerWeek * 15 + contentTypes.length * 10 + (contentPillars.length > 2 ? 20 : 10)));
  const engagementScore = Math.min(100, Math.round(engagementRate * 10 + (avgComments > 5 ? 20 : 10)));
  const consistencyScore = Math.min(100, Math.round(postsPerWeek >= 3 ? 80 : postsPerWeek >= 1 ? 50 : 20) + (weeklyFrequency.filter(w => w > 0).length > 8 ? 20 : 0));
  const strategyScore = Math.min(100, Math.round((contentPillars.length > 2 ? 30 : 15) + (hookPatterns.length > 2 ? 30 : 15) + (avgHashtags > 0 && avgHashtags < 6 ? 20 : 10)));

  const overallScore = Math.round((profileScore + contentScore + engagementScore + consistencyScore + strategyScore) / 5);
  const overallGrade = overallScore >= 85 ? "A" : overallScore >= 70 ? "B" : overallScore >= 55 ? "C" : overallScore >= 40 ? "D" : "F";

  // Growth estimate
  const growthEstimate = postsPerWeek >= 4 && engagementRate > 2 ? "+15-25% / month" :
    postsPerWeek >= 2 && engagementRate > 1 ? "+8-15% / month" :
    postsPerWeek >= 1 ? "+3-8% / month" : "Stagnant";

  return {
    profile: {
      name,
      headline,
      url: `https://linkedin.com/in/${publicId}`,
      followers,
      connections,
      profileImageUrl: profile.displayPictureUrl || "",
      completenessScore,
      headlineAnalysis: { formula: headlineFormula, effectiveness: headlineEffectiveness, suggestion: headlineEffectiveness < 70 ? "Add your unique value proposition and target audience" : "Strong headline — consider A/B testing variations" },
      aboutAnalysis: { hasHook, hasCTA, structure: hasHook && hasCTA ? "Hook → Story → CTA" : hasHook ? "Hook → Content" : "Flat", score: aboutScore },
      bannerAssessment: { hasBanner, quality: hasBanner ? "Custom banner detected" : "Default/missing banner — add a branded banner with your value prop", score: hasBanner ? 70 : 15 },
      featuredSection: { hasItems: (profile.featuredItems?.length || 0) > 0, count: profile.featuredItems?.length || 0, types: [] },
      experienceFraming: { actionOriented, metricsUsed, score: Math.min(100, expScore) },
    },
    contentStrategy: {
      postsPerWeek,
      weeklyFrequency,
      contentTypes,
      contentPillars,
      topPosts,
      hookPatterns,
      hashtagStrategy: { avg: avgHashtags, topHashtags },
      postingSchedule: schedule,
    },
    engagement: {
      avgLikes,
      avgComments,
      avgShares,
      engagementRate,
      replyRate: Math.min(100, Math.round(avgComments > 0 ? (avgComments / (avgLikes + 1)) * 100 : 0)),
      avgReplyTime: "~2-4 hours",
      growthEstimate,
    },
    overallScore,
    overallGrade,
    breakdown: [
      { category: "Profile", score: profileScore, max: 100 },
      { category: "Content", score: contentScore, max: 100 },
      { category: "Engagement", score: engagementScore, max: 100 },
      { category: "Consistency", score: consistencyScore, max: 100 },
      { category: "Strategy", score: strategyScore, max: 100 },
    ],
  };
}
