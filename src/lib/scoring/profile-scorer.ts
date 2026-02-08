/* eslint-disable @typescript-eslint/no-explicit-any */

import { clamp } from "./utils";

export interface ProfileResult {
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
}

/**
 * Score the static profile: completeness, headline quality, about section, banner, experience.
 *
 * Headline scoring: considers length, segment count, specificity (numbers/metrics),
 * value proposition keywords, and target audience signals.
 *
 * About scoring: hook quality, CTA presence, length, structure indicators.
 *
 * Experience: checks for action verbs and quantified metrics in about + headline.
 */
export function scoreProfile(profile: any): { result: ProfileResult; score: number } {
  const name = `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Unknown";
  const headline = profile.headline || "";
  const publicId = profile.publicIdentifier || "";
  const followers = profile.followerCount || 0;
  const connections = profile.connectionsCount || 500;

  // --- Completeness ---
  const hasAbout = !!profile.about;
  const hasBanner = !!profile.backgroundPicture;
  const hasPhoto = !!profile.profilePicture?.url;
  const hasExperience = (profile.currentPosition?.length || 0) > 0;
  const hasEducation = (profile.profileTopEducation?.length || 0) > 0;
  const hasSkills = !!profile.topSkills;
  const items = [hasAbout, hasBanner, hasPhoto, hasExperience, hasEducation, hasSkills, !!headline];
  const completenessScore = Math.round((items.filter(Boolean).length / items.length) * 100);

  // --- Headline ---
  const headlineParts = headline.split(/[|·•,]/).map((s: string) => s.trim()).filter(Boolean);
  const headlineFormula = headlineParts.length >= 3
    ? "Role + Niche + Value"
    : headlineParts.length === 2
      ? "Role + Niche"
      : "Basic";

  let headlineScore = 0;
  // Length: 40-120 chars is ideal
  if (headline.length >= 40 && headline.length <= 120) headlineScore += 20;
  else if (headline.length >= 20) headlineScore += 10;
  else if (headline.length > 0) headlineScore += 5;

  // Segments: multiple parts = more complete
  headlineScore += clamp(headlineParts.length * 12, 0, 30);

  // Specificity: contains numbers, metrics, or specific outcomes
  if (/\d+[%xX+]|\$\d|million|thousand|\d+ /.test(headline)) headlineScore += 15;

  // Value prop: helping/building/driving language
  if (/help|build|grow|scale|transform|empower|drive|ship|create|teach/i.test(headline)) headlineScore += 15;

  // Target audience signal
  if (/for |founder|CEO|engineer|developer|designer|marketer|leader|team/i.test(headline)) headlineScore += 10;

  const headlineEffectiveness = clamp(headlineScore, 0, 95);

  const headlineSuggestion = headlineEffectiveness >= 75
    ? "Strong headline — consider A/B testing variations"
    : headlineEffectiveness >= 50
      ? "Add a specific value proposition and target audience"
      : "Rewrite: include your role, who you help, and a proof point";

  // --- About ---
  const aboutText = profile.about || "";
  const hasHook = aboutText.length > 0 && /^[A-Z🔥🚀💡✨"I]/.test(aboutText.trim());
  const hasCTA = /contact|reach|email|book|schedule|connect|DM|link|visit|newsletter/i.test(aboutText);

  let aboutScore = 0;
  // Length tiers
  if (aboutText.length >= 300) aboutScore += 25;
  else if (aboutText.length >= 150) aboutScore += 15;
  else if (aboutText.length >= 50) aboutScore += 8;

  // Hook
  if (hasHook) aboutScore += 20;

  // CTA
  if (hasCTA) aboutScore += 20;

  // Line breaks / structure (indicates formatting)
  const lineBreaks = (aboutText.match(/\n/g) || []).length;
  if (lineBreaks >= 3) aboutScore += 15;
  else if (lineBreaks >= 1) aboutScore += 8;

  // Specificity in about
  if (/\d+[%xX+]|\$\d|million|thousand|\d+ /.test(aboutText)) aboutScore += 10;

  // Emojis / bullets (visual formatting)
  if (/[→•✅🔥🚀💡✨▶️📌]/.test(aboutText)) aboutScore += 5;

  aboutScore = clamp(aboutScore, 0, 95);

  const structure = hasHook && hasCTA ? "Hook → Story → CTA" : hasHook ? "Hook → Content" : hasCTA ? "Content → CTA" : "Flat";

  // --- Banner ---
  const bannerScore = hasBanner ? 70 : 15;

  // --- Experience framing ---
  const combinedText = aboutText + " " + headline;
  const actionOriented = /led|built|grew|launched|increased|managed|created|designed|developed|building|shipped|scaled|drove/i.test(combinedText);
  const metricsUsed = /\d+%|\$\d|[0-9]+x|million|thousand|\d+\+/i.test(combinedText);

  let expScore = hasExperience ? 40 : 10;
  if (actionOriented) expScore += 20;
  if (metricsUsed) expScore += 20;
  // Check if current positions have descriptions (rough proxy)
  if ((profile.currentPosition?.length || 0) >= 2) expScore += 10;
  expScore = clamp(expScore, 0, 95);

  // --- Featured section: Apify doesn't provide this, mark honestly ---
  const featuredSection = { hasItems: false, count: 0, types: [] as string[] };

  const profileScore = Math.round(
    (completenessScore * 0.25 + headlineEffectiveness * 0.25 + aboutScore * 0.25 + bannerScore * 0.15 + expScore * 0.10)
  );

  return {
    result: {
      name,
      headline,
      url: `https://linkedin.com/in/${publicId}`,
      followers,
      connections,
      profileImageUrl: profile.profilePicture?.url || "",
      completenessScore,
      headlineAnalysis: { formula: headlineFormula, effectiveness: headlineEffectiveness, suggestion: headlineSuggestion },
      aboutAnalysis: { hasHook, hasCTA, structure, score: aboutScore },
      bannerAssessment: { hasBanner, quality: hasBanner ? "Custom banner detected" : "Default/missing banner — add a branded banner with your value prop", score: bannerScore },
      featuredSection,
      experienceFraming: { actionOriented, metricsUsed, score: expScore },
    },
    score: clamp(profileScore, 0, 100),
  };
}
