/* eslint-disable @typescript-eslint/no-explicit-any */

import { median, trimmedMean, clamp } from "./utils";

export interface EngagementResult {
  avgLikes: number;
  avgComments: number;
  avgShares: number;
  engagementRate: number;
}

/**
 * Score engagement using outlier-resistant statistics.
 *
 * engagementRate: median per-post engagement rate (likes+comments / followers * 100).
 * Capped at 50% to prevent impossible values from viral reshares.
 * avgLikes/Comments/Shares: trimmed mean (remove top/bottom 10%) for robustness.
 */
export function scoreEngagement(posts: any[], followers: number): { result: EngagementResult; score: number } {
  if (posts.length === 0 || followers === 0) {
    return {
      result: { avgLikes: 0, avgComments: 0, avgShares: 0, engagementRate: 0 },
      score: 0,
    };
  }

  const likes = posts.map((p: any) => p.engagement?.likes || 0);
  const comments = posts.map((p: any) => p.engagement?.comments || 0);
  const shares = posts.map((p: any) => p.engagement?.shares || 0);

  // Trimmed mean for averages (robust to outliers)
  const avgLikes = Math.round(trimmedMean(likes));
  const avgComments = Math.round(trimmedMean(comments));
  const avgShares = Math.round(trimmedMean(shares));

  // Engagement rate: median of per-post rates, capped at 50%
  const perPostRates = posts.map((p: any) => {
    const eng = (p.engagement?.likes || 0) + (p.engagement?.comments || 0);
    return (eng / followers) * 100;
  });
  const engagementRate = clamp(
    Math.round(median(perPostRates) * 100) / 100,
    0,
    50
  );

  // Scoring: engagement rate benchmarks for LinkedIn
  // <0.5% = poor, 0.5-1% = below avg, 1-2% = average, 2-4% = good, 4%+ = excellent
  let score: number;
  if (engagementRate >= 4) score = 85;
  else if (engagementRate >= 2) score = 70 + (engagementRate - 2) * 7.5;
  else if (engagementRate >= 1) score = 50 + (engagementRate - 1) * 20;
  else if (engagementRate >= 0.5) score = 30 + (engagementRate - 0.5) * 40;
  else score = engagementRate * 60;

  // Bonus for comment depth (comments are harder to get than likes)
  const commentRatio = avgComments / (avgLikes + 1);
  if (commentRatio > 0.1) score += 5;
  if (commentRatio > 0.2) score += 5;

  score = clamp(Math.round(score), 0, 100);

  return {
    result: { avgLikes, avgComments, avgShares, engagementRate },
    score,
  };
}
