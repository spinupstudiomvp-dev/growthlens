import { NextRequest, NextResponse } from 'next/server';
import { fetchTwitterProfile, searchTwitterPosts, getConnectedAccount } from '@/lib/composio';
import { transformTwitterData } from '@/lib/twitter-transform';
import { storeAudit } from '@/lib/convex';

// POST /api/twitter/audit — audit a Twitter/X profile
export async function POST(req: NextRequest) {
  try {
    const { username, userId } = await req.json();

    if (!username || !userId) {
      return NextResponse.json(
        { error: 'username and userId are required' },
        { status: 400 }
      );
    }

    // Get connected account
    const account = await getConnectedAccount(userId, 'twitter');
    if (!account || account.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Twitter not connected. Please connect your X account first.' },
        { status: 401 }
      );
    }

    const handle = username.replace(/^@/, '').replace(/https?:\/\/(x\.com|twitter\.com)\//, '').replace(/\/.*$/, '').trim();
    console.log(`[GL] Twitter audit for @${handle} via account ${account.id}`);

    // Fetch profile + posts in parallel
    const [profileData, postsData] = await Promise.all([
      fetchTwitterProfile(account.id, handle),
      searchTwitterPosts(account.id, handle, 100),
    ]);

    console.log('[GL] Twitter profile data:', JSON.stringify(profileData).slice(0, 500));
    console.log('[GL] Twitter posts count:', postsData?.data?.length || 0);

    // Transform into ProfileAudit format
    const audit = transformTwitterData(profileData, postsData);

    // Store in Convex
    let auditId: string | null = null;
    try {
      auditId = await storeAudit({
        profileUrl: `https://x.com/${handle}`,
        profileName: audit.profile.name,
        auditData: JSON.stringify(audit),
        source: 'twitter-live',
        overallScore: audit.overallScore,
        overallGrade: audit.overallGrade,
      });
    } catch (err) {
      console.error('[GL] Failed to store Twitter audit:', err);
    }

    return NextResponse.json({
      success: true,
      audit,
      auditId,
      source: 'twitter-live',
    });
  } catch (error) {
    console.error('[GL] Twitter audit error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Twitter audit failed' },
      { status: 500 }
    );
  }
}
