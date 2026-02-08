import { NextRequest, NextResponse } from "next/server";
import { scrapeLinkedInProfile, scrapeLinkedInPosts } from "@/lib/apify";
import { transformProfileAndPosts } from "@/lib/transform";
import { mockProfileA } from "@/lib/mock-data";

export const maxDuration = 180; // allow up to 3 min for Apify runs

export async function POST(req: NextRequest) {
  try {
    const { profileUrl } = await req.json();

    if (!profileUrl) {
      return NextResponse.json({ error: "profileUrl is required" }, { status: 400 });
    }

    // Try real scraping
    const [profileData, postsData] = await Promise.all([
      scrapeLinkedInProfile(profileUrl).catch((e) => { console.error("Profile scrape error:", e); return null; }),
      scrapeLinkedInPosts(profileUrl).catch((e) => { console.error("Posts scrape error:", e); return null; }),
    ]);

    if (profileData && postsData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audit = transformProfileAndPosts(profileData, postsData as any[]);
      return NextResponse.json({ source: "live", audit });
    }

    // Fallback to mock
    return NextResponse.json({ source: "mock", audit: mockProfileA });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
