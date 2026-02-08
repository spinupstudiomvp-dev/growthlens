/**
 * Score overall strategy: combines signals from content pillars, hook variety,
 * hashtag usage, and content format diversity.
 *
 * This is a meta-scorer that takes results from content scoring.
 */

import { clamp } from "./utils";

export function scoreStrategy(
  contentPillarCount: number,
  hookPatternCount: number,
  avgHashtags: number,
  contentTypeCount: number,
): { score: number } {
  // Clear content pillars (0-30)
  const pillarScore = contentPillarCount >= 3 ? 30 : contentPillarCount >= 2 ? 20 : contentPillarCount >= 1 ? 10 : 0;

  // Hook variety (0-25)
  const hookScore = hookPatternCount >= 4 ? 25 : hookPatternCount >= 3 ? 20 : hookPatternCount >= 2 ? 12 : 5;

  // Hashtag discipline (0-20): 2-5 is ideal
  const hashScore = avgHashtags >= 2 && avgHashtags <= 5 ? 20 : avgHashtags >= 1 && avgHashtags <= 7 ? 12 : avgHashtags === 0 ? 5 : 3;

  // Format diversity (0-25)
  const formatScore = contentTypeCount >= 4 ? 25 : contentTypeCount >= 3 ? 20 : contentTypeCount >= 2 ? 12 : 5;

  const score = clamp(pillarScore + hookScore + hashScore + formatScore, 0, 100);

  return { score };
}
