/**
 * Transform Twitter/X API data into GrowthLens ProfileAudit format
 */
import type { ProfileAudit } from './mock-data';

// Types for Twitter API v2 responses
interface TwitterUser {
  id: string;
  name: string;
  username: string;
  description?: string;
  profile_image_url?: string;
  profile_banner_url?: string;
  location?: string;
  url?: string;
  verified?: boolean;
  verified_type?: string;
  created_at?: string;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
    like_count?: number;
  };
}

interface TwitterTweet {
  id: string;
  text: string;
  created_at?: string;
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
    impression_count?: number;
    bookmark_count?: number;
  };
  entities?: {
    hashtags?: { tag: string }[];
    urls?: { expanded_url: string }[];
    mentions?: { username: string }[];
  };
  attachments?: {
    media_keys?: string[];
  };
  referenced_tweets?: { type: string; id: string }[];
  source?: string;
}

interface TwitterMedia {
  media_key: string;
  type: string; // 'photo' | 'video' | 'animated_gif'
  url?: string;
  preview_image_url?: string;
}

// Content pillar categories
const PILLAR_KEYWORDS: Record<string, string[]> = {
  'Thought Leadership': ['opinion', 'unpopular', 'hot take', 'controversial', 'believe', 'think', 'truth', 'myth', 'stop', 'wrong'],
  'How-To / Educational': ['how to', 'step', 'guide', 'framework', 'learn', 'tips', 'lesson', 'thread', '🧵', 'here\'s how'],
  'Personal Stories': ['i ', 'my ', 'story', 'journey', 'failed', 'learned', 'mistake', 'personal', 'honest', 'confession'],
  'Industry News': ['new', 'report', 'study', 'research', 'data', 'trend', 'breaking', 'announced', 'launch'],
  'Case Studies': ['case study', 'result', 'growth', 'revenue', 'increased', 'decreased', 'metrics', '$', 'roi', '%'],
  'Company Updates': ['excited', 'announce', 'launch', 'ship', 'release', 'update', 'milestone', 'hit'],
  'Networking / Shoutouts': ['shoutout', 'congrats', 'amazing', 'incredible', '@', 'check out', 'follow'],
  'Career & Hiring': ['hiring', 'job', 'role', 'team', 'looking for', 'apply', 'career', 'opportunity'],
};

function classifyPillar(text: string): string {
  const lower = text.toLowerCase();
  let bestPillar = 'General';
  let bestScore = 0;
  for (const [pillar, keywords] of Object.entries(PILLAR_KEYWORDS)) {
    const score = keywords.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestPillar = pillar;
    }
  }
  return bestPillar;
}

function detectHookPattern(text: string): string {
  const lower = text.toLowerCase().slice(0, 100);
  if (/^\d|^here('s| are| is)/.test(lower)) return 'Listicle';
  if (/^(i |my |we )/.test(lower)) return 'Personal';
  if (/\?/.test(lower.split('\n')[0])) return 'Question';
  if (/^(stop|don't|never|wrong|myth|unpopular)/.test(lower)) return 'Contrarian';
  if (/^(how|step|guide|framework)/.test(lower)) return 'How-To';
  if (/^(just|excited|announcing|big)/.test(lower)) return 'Announcement';
  if (/^(thread|🧵)/.test(lower)) return 'Thread';
  return 'Statement';
}

function detectContentType(tweet: TwitterTweet, mediaMap: Map<string, TwitterMedia>): string {
  if (tweet.text.includes('🧵') || tweet.text.toLowerCase().includes('thread')) return 'Thread';
  if (tweet.attachments?.media_keys?.length) {
    const firstMedia = mediaMap.get(tweet.attachments.media_keys[0]);
    if (firstMedia?.type === 'video') return 'Video';
    if (firstMedia?.type === 'animated_gif') return 'GIF';
    if (firstMedia?.type === 'photo') {
      if ((tweet.attachments.media_keys.length || 0) > 1) return 'Carousel';
      return 'Image';
    }
  }
  if (tweet.entities?.urls?.length) return 'Link';
  return 'Text';
}

function clamp(val: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, val));
}

function median(arr: number[]): number {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function transformTwitterData(
  profileData: { data?: TwitterUser[]; includes?: { tweets?: TwitterTweet[] } },
  postsData: { data?: TwitterTweet[]; includes?: { media?: TwitterMedia[]; users?: TwitterUser[] }; meta?: { result_count?: number } }
): ProfileAudit {
  // Extract user
  const user = profileData.data?.[0];
  if (!user) throw new Error('No user data returned');

  const tweets = postsData.data || [];
  const mediaItems = postsData.includes?.media || [];
  const mediaMap = new Map<string, TwitterMedia>();
  mediaItems.forEach(m => mediaMap.set(m.media_key, m));

  const followers = user.public_metrics?.followers_count || 0;
  const following = user.public_metrics?.following_count || 0;
  const totalTweets = user.public_metrics?.tweet_count || 0;

  // === PROFILE SCORING ===
  const bio = user.description || '';
  const bioLength = bio.length;
  const bioScore = clamp(
    (bioLength > 20 ? 20 : 0) +
    (bioLength > 80 ? 20 : 0) +
    (/\||\-|•/.test(bio) ? 10 : 0) + // structured
    (/@/.test(bio) ? 5 : 0) + // mentions
    (/http|\.com|\.io/.test(bio) ? 5 : 0) + // links
    (/\d/.test(bio) ? 10 : 0) + // numbers/metrics
    (bio.length > 120 ? 10 : 0) + // detailed
    (user.url ? 10 : 0) + // has website
    (user.location ? 5 : 0) + // has location
    (user.profile_banner_url ? 5 : 0) // has banner
  );

  const hasBanner = !!user.profile_banner_url;
  const hasUrl = !!user.url;
  const completeness = clamp(
    (bio ? 25 : 0) + (hasBanner ? 15 : 0) + (hasUrl ? 15 : 0) +
    (user.location ? 10 : 0) + (user.profile_image_url ? 15 : 0) +
    (user.public_metrics?.tweet_count ? 20 : 0)
  );

  // === CONTENT ANALYSIS ===
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;

  // Weekly frequency (from tweets, limited to 7 days for recent search)
  const tweetDates = tweets.map(t => t.created_at ? new Date(t.created_at).getTime() : now);
  const oldestTweet = Math.min(...tweetDates);
  const weeksSpan = Math.max(1, Math.ceil((now - oldestTweet) / weekMs));
  const postsPerWeek = tweets.length / weeksSpan;

  // Weekly frequency array (last 12 weeks estimated)
  const weeklyFreq: number[] = new Array(12).fill(0);
  tweets.forEach(t => {
    const ts = t.created_at ? new Date(t.created_at).getTime() : now;
    const weeksAgo = Math.floor((now - ts) / weekMs);
    if (weeksAgo < 12) weeklyFreq[11 - weeksAgo]++;
  });

  // Content types
  const typeCount: Record<string, number> = {};
  tweets.forEach(t => {
    const type = detectContentType(t, mediaMap);
    typeCount[type] = (typeCount[type] || 0) + 1;
  });
  const typeColors: Record<string, string> = {
    Text: '#10b981', Image: '#3b82f6', Video: '#8b5cf6',
    Thread: '#f59e0b', Carousel: '#ec4899', Link: '#6366f1',
    GIF: '#14b8a6',
  };
  const contentTypes = Object.entries(typeCount)
    .map(([type, count]) => ({
      type,
      percentage: Math.round((count / Math.max(tweets.length, 1)) * 100),
      color: typeColors[type] || '#94a3b8',
    }))
    .sort((a, b) => b.percentage - a.percentage);

  // Content pillars
  const pillarCount: Record<string, number> = {};
  const tweetPillars: Map<string, string> = new Map();
  tweets.forEach(t => {
    const pillar = classifyPillar(t.text);
    pillarCount[pillar] = (pillarCount[pillar] || 0) + 1;
    tweetPillars.set(t.id, pillar);
  });
  const contentPillars = Object.entries(pillarCount)
    .map(([topic, count]) => ({
      topic,
      percentage: Math.round((count / Math.max(tweets.length, 1)) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  // Hook patterns
  const hookCount: Record<string, number> = {};
  tweets.forEach(t => {
    const hook = detectHookPattern(t.text);
    hookCount[hook] = (hookCount[hook] || 0) + 1;
  });
  const hookPatterns = Object.entries(hookCount)
    .map(([pattern, count]) => ({
      pattern,
      percentage: Math.round((count / Math.max(tweets.length, 1)) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  // Hashtags
  const hashtagCount: Record<string, number> = {};
  let totalHashtags = 0;
  tweets.forEach(t => {
    const tags = t.entities?.hashtags || [];
    totalHashtags += tags.length;
    tags.forEach(h => {
      hashtagCount[`#${h.tag}`] = (hashtagCount[`#${h.tag}`] || 0) + 1;
    });
  });
  const topHashtags = Object.entries(hashtagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag]) => tag);

  // Posting schedule (7 days x 24 hours heatmap)
  const schedule: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));
  tweets.forEach(t => {
    if (t.created_at) {
      const d = new Date(t.created_at);
      schedule[d.getUTCDay()][d.getUTCHours()]++;
    }
  });

  // Top posts
  const topPosts = [...tweets]
    .sort((a, b) => (b.public_metrics?.like_count || 0) - (a.public_metrics?.like_count || 0))
    .slice(0, 50)
    .map(t => ({
      text: t.text,
      likes: t.public_metrics?.like_count || 0,
      comments: t.public_metrics?.reply_count || 0,
      shares: t.public_metrics?.retweet_count || 0,
      type: detectContentType(t, mediaMap),
      url: `https://x.com/${user.username}/status/${t.id}`,
      pillar: tweetPillars.get(t.id) || 'General',
      postedAt: t.created_at ? new Date(t.created_at).getTime() : now,
    }));

  // === ENGAGEMENT ===
  const likes = tweets.map(t => t.public_metrics?.like_count || 0);
  const comments = tweets.map(t => t.public_metrics?.reply_count || 0);
  const shares = tweets.map(t => t.public_metrics?.retweet_count || 0);

  const avgLikes = Math.round(likes.reduce((a, b) => a + b, 0) / Math.max(likes.length, 1));
  const avgComments = Math.round(comments.reduce((a, b) => a + b, 0) / Math.max(comments.length, 1));
  const avgShares = Math.round(shares.reduce((a, b) => a + b, 0) / Math.max(shares.length, 1));

  const medianEngPerPost = median(tweets.map(t => {
    const m = t.public_metrics;
    return (m?.like_count || 0) + (m?.reply_count || 0) + (m?.retweet_count || 0) + (m?.quote_count || 0);
  }));
  const engagementRate = followers > 0
    ? Math.min(50, Number(((medianEngPerPost / followers) * 100).toFixed(2)))
    : 0;

  // === SCORING ===
  // Profile (20%)
  const profileScore = clamp(Math.round(
    (completeness * 0.3) + (bioScore * 0.4) + (hasBanner ? 15 : 0) + (hasUrl ? 15 : 0)
  ));

  // Content (25%)
  const typeVariety = Math.min(Object.keys(typeCount).length / 4, 1) * 30;
  const pillarVariety = Math.min(Object.keys(pillarCount).length / 5, 1) * 30;
  const hookVariety = Math.min(Object.keys(hookCount).length / 4, 1) * 20;
  const frequencyScore = clamp(postsPerWeek >= 5 ? 20 : postsPerWeek >= 3 ? 15 : postsPerWeek >= 1 ? 10 : 5);
  const contentScore = clamp(Math.round(typeVariety + pillarVariety + hookVariety + frequencyScore));

  // Engagement (25%)
  const engScore = clamp(Math.round(
    (engagementRate >= 2 ? 40 : engagementRate >= 1 ? 30 : engagementRate >= 0.5 ? 20 : 10) +
    (avgLikes >= 50 ? 20 : avgLikes >= 20 ? 15 : avgLikes >= 5 ? 10 : 5) +
    (avgComments >= 10 ? 20 : avgComments >= 5 ? 15 : avgComments >= 2 ? 10 : 5) +
    (avgShares >= 10 ? 20 : avgShares >= 5 ? 15 : avgShares >= 2 ? 10 : 5)
  ));

  // Consistency (15%)
  const activeWeeks = weeklyFreq.filter(w => w > 0).length;
  const consistencyScore = clamp(Math.round((activeWeeks / 12) * 100));

  // Strategy (15%)
  const hashtagDiscipline = clamp(
    totalHashtags / Math.max(tweets.length, 1) <= 3 ? 30 :
    totalHashtags / Math.max(tweets.length, 1) <= 5 ? 20 : 10
  );
  const strategyScore = clamp(Math.round(
    pillarVariety + hookVariety + hashtagDiscipline
  ));

  // Overall
  const overallScore = Math.round(
    profileScore * 0.2 + contentScore * 0.25 + engScore * 0.25 +
    consistencyScore * 0.15 + strategyScore * 0.15
  );
  const overallGrade =
    overallScore >= 85 ? 'A' :
    overallScore >= 70 ? 'B' :
    overallScore >= 55 ? 'C' :
    overallScore >= 40 ? 'D' : 'F';

  return {
    profile: {
      name: user.name,
      headline: bio || `@${user.username}`,
      url: `https://x.com/${user.username}`,
      followers,
      connections: following,
      profileImageUrl: user.profile_image_url || '',
      completenessScore: completeness,
      headlineAnalysis: {
        formula: bio.includes('|') || bio.includes('•') ? 'Structured with separators' :
          bio.length > 100 ? 'Detailed narrative' : 'Brief statement',
        effectiveness: bioScore,
        suggestion: bioScore < 60
          ? 'Add specifics: who you help, what you do, and proof (numbers/credentials)'
          : bioScore < 80
          ? 'Consider adding a clear value proposition or CTA'
          : 'Strong bio — keep it updated as your focus evolves',
      },
      aboutAnalysis: {
        hasHook: /^(i |stop|how|why|\d|the |here)/i.test(bio),
        hasCTA: /dm|follow|link|check|subscribe|join/i.test(bio),
        structure: bio.includes('\n') ? 'Multi-line with breaks' : 'Single paragraph',
        score: bioScore,
      },
      bannerAssessment: {
        hasBanner,
        quality: hasBanner ? 'Has custom banner' : 'No banner image — missed branding opportunity',
        score: hasBanner ? 70 : 20,
      },
      featuredSection: {
        hasItems: !!user.url,
        count: user.url ? 1 : 0,
        types: user.url ? ['Website link'] : [],
      },
      experienceFraming: {
        actionOriented: /built|shipped|grew|scaled|founded|created/i.test(bio),
        metricsUsed: /\d/.test(bio),
        score: clamp(
          (/built|shipped|grew|scaled|founded|created/i.test(bio) ? 40 : 10) +
          (/\d/.test(bio) ? 30 : 0) +
          (bio.length > 80 ? 20 : 0) +
          (user.verified ? 10 : 0)
        ),
      },
    },
    contentStrategy: {
      postsPerWeek: Number(postsPerWeek.toFixed(1)),
      weeklyFrequency: weeklyFreq,
      contentTypes,
      contentPillars,
      topPosts,
      hookPatterns,
      hashtagStrategy: {
        avg: tweets.length > 0 ? Number((totalHashtags / tweets.length).toFixed(1)) : 0,
        topHashtags,
      },
      postingSchedule: schedule,
    },
    engagement: {
      avgLikes,
      avgComments,
      avgShares,
      engagementRate,
    },
    overallGrade,
    overallScore,
    breakdown: [
      { category: 'Profile', score: profileScore, max: 100 },
      { category: 'Content', score: contentScore, max: 100 },
      { category: 'Engagement', score: engScore, max: 100 },
      { category: 'Consistency', score: consistencyScore, max: 100 },
      { category: 'Strategy', score: strategyScore, max: 100 },
    ],
  };
}
