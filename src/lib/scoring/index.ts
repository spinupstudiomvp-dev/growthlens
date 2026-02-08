/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ProfileAudit } from "../mock-data";
import { scoreProfile } from "./profile-scorer";
import { scoreContent } from "./content-scorer";
import { scoreEngagement } from "./engagement-scorer";
import { scoreConsistency } from "./consistency-scorer";
import { scoreStrategy } from "./strategy-scorer";

/**
 * Main scoring orchestrator.
 *
 * Takes raw Apify profile + posts data and returns a complete ProfileAudit.
 * Each sub-scorer is independent and documented.
 *
 * Grade curve: A (85+), B (70-84), C (55-69), D (40-54), F (<40)
 */
export function computeAudit(profile: any, posts: any[]): ProfileAudit {
  const { result: profileResult, score: profileScore } = scoreProfile(profile);
  const { result: contentResult, score: contentScore } = scoreContent(posts);
  const { result: engagementResult, score: engagementScore } = scoreEngagement(posts, profile.followerCount || 0);
  const { score: consistencyScore } = scoreConsistency(posts);
  const { score: strategyScore } = scoreStrategy(
    contentResult.contentPillars.length,
    contentResult.hookPatterns.length,
    contentResult.hashtagStrategy.avg,
    contentResult.contentTypes.length,
  );

  const overallScore = Math.round(
    profileScore * 0.20 +
    contentScore * 0.25 +
    engagementScore * 0.25 +
    consistencyScore * 0.15 +
    strategyScore * 0.15
  );

  const overallGrade = overallScore >= 85 ? "A"
    : overallScore >= 70 ? "B"
    : overallScore >= 55 ? "C"
    : overallScore >= 40 ? "D"
    : "F";

  return {
    profile: profileResult,
    contentStrategy: contentResult,
    engagement: engagementResult,
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
