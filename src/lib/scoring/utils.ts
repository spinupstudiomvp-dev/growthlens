/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Compute median of a numeric array. Returns 0 for empty arrays.
 */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Trimmed mean: remove top/bottom `trimPct` fraction of values.
 */
export function trimmedMean(values: number[], trimPct = 0.1): number {
  if (values.length === 0) return 0;
  if (values.length < 5) return median(values); // too few to trim, use median
  const sorted = [...values].sort((a, b) => a - b);
  const trimCount = Math.floor(sorted.length * trimPct);
  const trimmed = sorted.slice(trimCount, sorted.length - trimCount);
  return trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
}

/**
 * Clamp a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Get posts within the last N weeks from now.
 */
export function getRecentPosts(posts: any[], weeks: number): any[] {
  const cutoff = Date.now() - weeks * 7 * 24 * 3600 * 1000;
  return posts.filter((p: any) => {
    const ts = p.postedAt?.timestamp || 0;
    return ts >= cutoff;
  });
}

/**
 * Extract bigrams (2-word phrases) from text, excluding stop words.
 */
export function extractBigrams(texts: string[], minCount = 2): { phrase: string; count: number }[] {
  const stopWords = new Set([
    "the", "and", "for", "that", "this", "with", "you", "are", "was", "have",
    "has", "not", "but", "what", "all", "can", "had", "her", "his", "from",
    "they", "been", "said", "each", "she", "which", "their", "will", "other",
    "about", "out", "many", "then", "them", "these", "some", "would", "make",
    "like", "into", "just", "over", "such", "your", "it's", "than", "its",
    "how", "who", "get", "got", "don't", "i'm", "more", "when", "also",
    "does", "did", "been", "being", "very", "most", "here", "there", "where",
    "every", "could", "should", "really", "still", "going", "doing", "thing",
    "never", "makes", "think", "people", "those",
  ]);

  const bigramCounts: Record<string, number> = {};

  for (const text of texts) {
    const words = text.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      bigramCounts[bigram] = (bigramCounts[bigram] || 0) + 1;
    }
  }

  return Object.entries(bigramCounts)
    .filter(([, count]) => count >= minCount)
    .sort((a, b) => b[1] - a[1])
    .map(([phrase, count]) => ({ phrase, count }));
}
