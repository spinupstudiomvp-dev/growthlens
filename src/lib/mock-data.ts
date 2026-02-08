export interface ProfileAudit {
  profile: {
    name: string;
    headline: string;
    url: string;
    followers: number;
    connections: number;
    profileImageUrl: string;
    completenessScore: number;
    headlineAnalysis: { formula: string; effectiveness: number; suggestion: string };
    aboutAnalysis: { hasHook: boolean; hasCTA: boolean; structure: string; score: number };
    bannerAssessment: { hasBanner: boolean; quality: string; score: number };
    featuredSection: { hasItems: boolean; count: number; types: string[] };
    experienceFraming: { actionOriented: boolean; metricsUsed: boolean; score: number };
  };
  contentStrategy: {
    postsPerWeek: number;
    weeklyFrequency: number[];
    contentTypes: { type: string; percentage: number; color: string }[];
    contentPillars: { topic: string; percentage: number }[];
    topPosts: { text: string; likes: number; comments: number; shares: number; type: string }[];
    hookPatterns: { pattern: string; percentage: number }[];
    hashtagStrategy: { avg: number; topHashtags: string[] };
    postingSchedule: number[][];
  };
  engagement: {
    avgLikes: number;
    avgComments: number;
    avgShares: number;
    engagementRate: number;
    replyRate?: number;
    avgReplyTime?: string;
    growthEstimate?: string;
  };
  overallGrade: string;
  overallScore: number;
  breakdown: { category: string; score: number; max: number }[];
}

export const mockProfileA: ProfileAudit = {
  profile: {
    name: "Sarah Chen",
    headline: "CEO @ TechFlow | Helping B2B SaaS founders scale to $10M ARR | Ex-Stripe",
    url: "https://linkedin.com/in/sarachen",
    followers: 47200,
    connections: 12400,
    profileImageUrl: "",
    completenessScore: 92,
    headlineAnalysis: { formula: "Role + Mission + Social Proof", effectiveness: 88, suggestion: "Consider adding a specific metric or result" },
    aboutAnalysis: { hasHook: true, hasCTA: true, structure: "Hook → Story → Credibility → CTA", score: 85 },
    bannerAssessment: { hasBanner: true, quality: "Professional with value proposition", score: 90 },
    featuredSection: { hasItems: true, count: 4, types: ["Newsletter", "Case Study", "Talk", "Article"] },
    experienceFraming: { actionOriented: true, metricsUsed: true, score: 88 },
  },
  contentStrategy: {
    postsPerWeek: 4.8,
    weeklyFrequency: [3, 5, 4, 6, 5, 4, 5, 6, 4, 5, 5, 4],
    contentTypes: [
      { type: "Text", percentage: 45, color: "#10b981" },
      { type: "Carousel", percentage: 30, color: "#3b82f6" },
      { type: "Video", percentage: 15, color: "#8b5cf6" },
      { type: "Poll", percentage: 10, color: "#f59e0b" },
    ],
    contentPillars: [
      { topic: "SaaS Growth", percentage: 35 },
      { topic: "Leadership", percentage: 25 },
      { topic: "Fundraising", percentage: 20 },
      { topic: "Personal Stories", percentage: 15 },
      { topic: "Industry News", percentage: 5 },
    ],
    topPosts: [
      { text: "I got rejected by 47 investors before raising our $12M Series A. Here's what I learned about persistence...", likes: 4200, comments: 380, shares: 120, type: "Text" },
      { text: "The SaaS pricing mistake that cost us $2M in ARR (and how we fixed it in 30 days)", likes: 3100, comments: 290, shares: 95, type: "Carousel" },
      { text: "Stop building features. Start solving problems. A thread on product-market fit →", likes: 2800, comments: 210, shares: 88, type: "Text" },
    ],
    hookPatterns: [
      { pattern: "Personal story", percentage: 35 },
      { pattern: "Contrarian take", percentage: 25 },
      { pattern: "Number/stat", percentage: 20 },
      { pattern: "Question", percentage: 15 },
      { pattern: "Bold statement", percentage: 5 },
    ],
    hashtagStrategy: { avg: 3, topHashtags: ["#saas", "#startups", "#leadership", "#growth", "#fundraising"] },
    postingSchedule: [
      [0,0,0,0,0,0,0,2,8,5,3,1,2,1,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,3,9,6,4,2,1,2,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,2,7,5,3,1,1,1,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,3,8,6,4,2,2,1,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,2,6,4,2,1,1,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ],
  },
  engagement: {
    avgLikes: 1240,
    avgComments: 156,
    avgShares: 42,
    engagementRate: 4.8,
  },
  overallGrade: "A",
  overallScore: 88,
  breakdown: [
    { category: "Profile", score: 92, max: 100 },
    { category: "Content", score: 88, max: 100 },
    { category: "Engagement", score: 85, max: 100 },
    { category: "Consistency", score: 90, max: 100 },
    { category: "Strategy", score: 86, max: 100 },
  ],
};

export const mockProfileB: ProfileAudit = {
  profile: {
    name: "Jake Morrison",
    headline: "Founder at DevStack",
    url: "https://linkedin.com/in/jakemorrison",
    followers: 3800,
    connections: 2100,
    profileImageUrl: "",
    completenessScore: 54,
    headlineAnalysis: { formula: "Role only", effectiveness: 35, suggestion: "Add your mission and a proof point. Example: 'Founder @ DevStack | Building dev tools for 50K+ engineers'" },
    aboutAnalysis: { hasHook: false, hasCTA: false, structure: "Generic description", score: 30 },
    bannerAssessment: { hasBanner: false, quality: "Missing", score: 0 },
    featuredSection: { hasItems: false, count: 0, types: [] },
    experienceFraming: { actionOriented: false, metricsUsed: false, score: 25 },
  },
  contentStrategy: {
    postsPerWeek: 1.2,
    weeklyFrequency: [1, 2, 1, 0, 1, 2, 1, 1, 0, 2, 1, 1],
    contentTypes: [
      { type: "Text", percentage: 80, color: "#10b981" },
      { type: "Carousel", percentage: 0, color: "#3b82f6" },
      { type: "Video", percentage: 5, color: "#8b5cf6" },
      { type: "Poll", percentage: 15, color: "#f59e0b" },
    ],
    contentPillars: [
      { topic: "Dev Tools", percentage: 40 },
      { topic: "Startup Life", percentage: 30 },
      { topic: "Random/Mixed", percentage: 30 },
    ],
    topPosts: [
      { text: "Excited to announce our new feature launch! Check it out →", likes: 45, comments: 12, shares: 3, type: "Text" },
      { text: "What's your favorite IDE? Poll below 👇", likes: 82, comments: 34, shares: 5, type: "Poll" },
      { text: "Great event today at TechCrunch Disrupt. Lots of interesting people!", likes: 28, comments: 8, shares: 1, type: "Text" },
    ],
    hookPatterns: [
      { pattern: "Announcement", percentage: 45 },
      { pattern: "Generic statement", percentage: 30 },
      { pattern: "Question", percentage: 20 },
      { pattern: "Personal story", percentage: 5 },
    ],
    hashtagStrategy: { avg: 8, topHashtags: ["#startup", "#tech", "#coding", "#developer", "#software", "#innovation", "#AI", "#devtools"] },
    postingSchedule: [
      [0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ],
  },
  engagement: {
    avgLikes: 38,
    avgComments: 9,
    avgShares: 2,
    engagementRate: 1.2,
  },
  overallGrade: "D+",
  overallScore: 34,
  breakdown: [
    { category: "Profile", score: 35, max: 100 },
    { category: "Content", score: 28, max: 100 },
    { category: "Engagement", score: 32, max: 100 },
    { category: "Consistency", score: 22, max: 100 },
    { category: "Strategy", score: 40, max: 100 },
  ],
};

export const mockGapAnalysis = {
  recommendations: [
    { priority: "Critical", action: "Increase posting frequency from 1.2x to at least 4x per week. Consistency is the #1 growth lever.", impact: 95 },
    { priority: "Critical", action: "Rewrite headline: Add your mission and a credibility marker. Current headline tells people nothing about your value.", impact: 90 },
    { priority: "High", action: "Start using carousels. They post 30% carousels, you post 0%. Start with 1 per week — carousels get 3x more reach.", impact: 85 },
    { priority: "High", action: "Add a banner image with your value proposition. It's free real estate you're leaving blank.", impact: 80 },
    { priority: "High", action: "Switch from announcement-style hooks to personal stories and contrarian takes. Your hooks don't stop the scroll.", impact: 78 },
    { priority: "Medium", action: "Write a proper About section with a hook, story, credibility, and CTA. Yours reads like a job description.", impact: 65 },
    { priority: "Medium", action: "Reduce hashtags from 8 to 3-4. Over-hashtagging signals spam to the algorithm.", impact: 55 },
    { priority: "Medium", action: "Reply to comments within 2 hours, not 18. Early engagement signals boost reach 4x.", impact: 70 },
    { priority: "Low", action: "Add 3-4 featured items: your best content, newsletter, or a lead magnet.", impact: 40 },
    { priority: "Low", action: "Post at 7-9 AM on weekdays when your audience is most active, not random evenings.", impact: 45 },
  ],
  summary: {
    yourScore: 34,
    theirScore: 88,
    biggestGaps: ["Posting frequency", "Content format diversity", "Profile completeness", "Hook quality"],
  },
};
