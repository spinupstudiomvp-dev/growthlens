/* eslint-disable @typescript-eslint/no-explicit-any */

import { getRecentPosts, clamp } from "./utils";

/**
 * Score posting consistency over the last 12 weeks.
 *
 * Factors:
 * - Active weeks out of 12 (regularity)
 * - Longest gap between posts
 * - Streak of consecutive active weeks
 */
export function scoreConsistency(posts: any[]): { score: number } {
  const recentPosts = getRecentPosts(posts, 12);

  if (recentPosts.length === 0) return { score: 0 };

  // Build weekly histogram
  const weeklyFrequency: number[] = new Array(12).fill(0);
  const now = Date.now();
  recentPosts.forEach((p: any) => {
    const ts = p.postedAt?.timestamp || 0;
    if (ts) {
      const weeksAgo = Math.floor((now - ts) / (7 * 24 * 3600 * 1000));
      if (weeksAgo >= 0 && weeksAgo < 12) weeklyFrequency[11 - weeksAgo]++;
    }
  });

  const activeWeeks = weeklyFrequency.filter(w => w > 0).length;

  // Active weeks ratio (0-40 points)
  const activeRatioScore = Math.round((activeWeeks / 12) * 40);

  // Longest gap penalty (0-30 points, higher = better = shorter gaps)
  let longestGap = 0;
  let currentGap = 0;
  for (const w of weeklyFrequency) {
    if (w === 0) { currentGap++; longestGap = Math.max(longestGap, currentGap); }
    else currentGap = 0;
  }
  const gapScore = longestGap === 0 ? 30 : longestGap <= 1 ? 25 : longestGap <= 2 ? 18 : longestGap <= 4 ? 10 : 0;

  // Current streak bonus (0-30 points): consecutive recent active weeks
  let streak = 0;
  for (let i = weeklyFrequency.length - 1; i >= 0; i--) {
    if (weeklyFrequency[i] > 0) streak++;
    else break;
  }
  const streakScore = clamp(streak * 5, 0, 30);

  const score = clamp(activeRatioScore + gapScore + streakScore, 0, 100);

  return { score };
}
