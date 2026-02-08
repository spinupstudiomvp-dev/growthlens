/* eslint-disable @typescript-eslint/no-explicit-any */

import { getRecentPosts, extractBigrams, clamp } from "./utils";

export interface ContentResult {
  postsPerWeek: number;
  weeklyFrequency: number[];
  contentTypes: { type: string; percentage: number; color: string }[];
  contentPillars: { topic: string; percentage: number }[];
  topPosts: { text: string; likes: number; comments: number; shares: number; type: string; url?: string }[];
  hookPatterns: { pattern: string; percentage: number }[];
  hashtagStrategy: { avg: number; topHashtags: string[] };
  postingSchedule: number[][];
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];

/**
 * Score content strategy based on recent posts (last 12 weeks).
 *
 * postsPerWeek: recentPostsInLast12Weeks / 12 (not total posts / active weeks)
 * Content pillars: extracted as 2-word phrases via bigram analysis
 * Hook patterns: classified from first line of each post
 */
export function scoreContent(posts: any[]): { result: ContentResult; score: number } {
  const recentPosts = getRecentPosts(posts, 12);
  const recentCount = recentPosts.length;

  // --- Posts per week: strictly last 12 weeks ---
  const postsPerWeek = Math.round((recentCount / 12) * 10) / 10;

  // --- Weekly frequency histogram ---
  const weeklyFrequency: number[] = new Array(12).fill(0);
  const now = Date.now();
  recentPosts.forEach((p: any) => {
    const ts = p.postedAt?.timestamp || 0;
    if (ts) {
      const weeksAgo = Math.floor((now - ts) / (7 * 24 * 3600 * 1000));
      if (weeksAgo >= 0 && weeksAgo < 12) weeklyFrequency[11 - weeksAgo]++;
    }
  });

  // --- Content types ---
  const typeMap: Record<string, number> = {};
  const allPosts = posts.length > 0 ? posts : recentPosts;
  const analysisPosts = recentCount > 0 ? recentPosts : allPosts;
  analysisPosts.forEach((p: any) => {
    let type = "text";
    if (p.postImages?.length > 0) type = "image";
    else if (p.type === "article" || p.header?.text) type = "article";
    else if (p.content?.includes("carousel") || p.type === "carousel") type = "carousel";
    else if (p.content?.includes("video") || p.type === "video") type = "video";
    else if (p.content?.includes("poll") || p.type === "poll") type = "poll";
    typeMap[type] = (typeMap[type] || 0) + 1;
  });
  const totalTyped = Object.values(typeMap).reduce((a, b) => a + b, 0) || 1;
  const contentTypes = Object.entries(typeMap).map(([type, count], i) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    percentage: Math.round((count / totalTyped) * 100),
    color: COLORS[i % COLORS.length],
  }));
  if (contentTypes.length === 0) contentTypes.push({ type: "Text", percentage: 100, color: COLORS[0] });

  // --- Content pillars (bigrams from post content) ---
  const postTexts = analysisPosts.map((p: any) => p.content || "").filter(Boolean);
  const bigrams = extractBigrams(postTexts, 2);
  const topBigrams = bigrams.slice(0, 5);
  const totalBigramCount = topBigrams.reduce((s, b) => s + b.count, 0) || 1;
  const contentPillars = topBigrams.map(({ phrase, count }) => ({
    topic: phrase.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    percentage: Math.round((count / totalBigramCount) * 100),
  }));

  // --- Top posts by engagement ---
  const sortedPosts = [...posts].sort((a: any, b: any) =>
    ((b.engagement?.likes || 0) + (b.engagement?.comments || 0)) -
    ((a.engagement?.likes || 0) + (a.engagement?.comments || 0))
  );
  const topPosts = sortedPosts.slice(0, 5).map((p: any) => ({
    text: (p.content || "").slice(0, 150) + ((p.content || "").length > 150 ? "..." : ""),
    likes: p.engagement?.likes || 0,
    comments: p.engagement?.comments || 0,
    shares: p.engagement?.shares || 0,
    type: p.postImages?.length ? "image" : p.type || "text",
    url: p.linkedinUrl || undefined,
  }));

  // --- Hook patterns ---
  const hookTypes: Record<string, number> = { Question: 0, Statement: 0, Story: 0, Statistic: 0, Contrarian: 0 };
  analysisPosts.forEach((p: any) => {
    const firstLine = (p.content || "").split("\n")[0] || "";
    if (firstLine.includes("?")) hookTypes.Question++;
    else if (/\d+%|\d+ out of|\$/.test(firstLine)) hookTypes.Statistic++;
    else if (/^(I |My |When I|Here's my)/i.test(firstLine)) hookTypes.Story++;
    else if (/stop|don't|never|wrong|myth|unpopular|hot take/i.test(firstLine)) hookTypes.Contrarian++;
    else hookTypes.Statement++;
  });
  const hookTotal = Object.values(hookTypes).reduce((a, b) => a + b, 0) || 1;
  const hookPatterns = Object.entries(hookTypes)
    .filter(([, v]) => v > 0)
    .map(([pattern, count]) => ({ pattern, percentage: Math.round((count / hookTotal) * 100) }))
    .sort((a, b) => b.percentage - a.percentage);

  // --- Hashtags ---
  const allText = analysisPosts.map((p: any) => p.content || "").join(" ");
  const hashtagMatches = allText.match(/#\w+/g) || [];
  const hashtagCounts: Record<string, number> = {};
  hashtagMatches.forEach((tag: string) => { hashtagCounts[tag.toLowerCase()] = (hashtagCounts[tag.toLowerCase()] || 0) + 1; });
  const topHashtags = Object.entries(hashtagCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([tag]) => tag);
  const avgHashtags = analysisPosts.length > 0 ? Math.round(hashtagMatches.length / analysisPosts.length) : 0;

  // --- Posting schedule heatmap ---
  const schedule: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));
  posts.forEach((p: any) => {
    const ts = p.postedAt?.timestamp || 0;
    if (ts) {
      const d = new Date(ts);
      schedule[d.getDay()][d.getHours()]++;
    }
  });

  // --- Content score ---
  // Frequency component (0-30): 3+ posts/week = 30, 1 = 15, 0.5 = 8
  const freqScore = postsPerWeek >= 4 ? 30 : postsPerWeek >= 3 ? 25 : postsPerWeek >= 2 ? 20 : postsPerWeek >= 1 ? 15 : postsPerWeek > 0 ? 8 : 0;

  // Format diversity (0-25): more types = better
  const diversityScore = clamp(contentTypes.length * 8, 0, 25);

  // Pillar clarity (0-20): having 3+ clear pillars
  const pillarScore = contentPillars.length >= 3 ? 20 : contentPillars.length >= 2 ? 12 : contentPillars.length >= 1 ? 6 : 0;

  // Hook variety (0-15)
  const hookVarietyScore = hookPatterns.length >= 3 ? 15 : hookPatterns.length >= 2 ? 10 : 5;

  // Hashtag hygiene (0-10): 2-5 per post is ideal
  const hashScore = avgHashtags >= 2 && avgHashtags <= 5 ? 10 : avgHashtags >= 1 && avgHashtags <= 7 ? 6 : avgHashtags === 0 ? 3 : 2;

  const contentScore = clamp(freqScore + diversityScore + pillarScore + hookVarietyScore + hashScore, 0, 100);

  return {
    result: {
      postsPerWeek,
      weeklyFrequency,
      contentTypes,
      contentPillars,
      topPosts,
      hookPatterns,
      hashtagStrategy: { avg: avgHashtags, topHashtags },
      postingSchedule: schedule,
    },
    score: contentScore,
  };
}
