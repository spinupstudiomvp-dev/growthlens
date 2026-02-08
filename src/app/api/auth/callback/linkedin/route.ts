import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || "78qujt24fap1g9";
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || "";
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || "https://growthlens-blue.vercel.app/api/auth/callback/linkedin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/?auth_error=" + error, request.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/?auth_error=missing_params", request.url));
  }

  // Verify state
  const cookieStore = await cookies();
  const storedState = cookieStore.get("linkedin_oauth_state")?.value;
  if (state !== storedState) {
    return NextResponse.redirect(new URL("/?auth_error=invalid_state", request.url));
  }
  cookieStore.delete("linkedin_oauth_state");

  try {
    // Exchange code for access token
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("[LinkedIn OAuth] Token exchange failed:", err);
      return NextResponse.redirect(new URL("/?auth_error=token_failed", request.url));
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Fetch user profile using OpenID Connect userinfo endpoint
    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileRes.ok) {
      console.error("[LinkedIn OAuth] Profile fetch failed:", profileRes.status);
      return NextResponse.redirect(new URL("/?auth_error=profile_failed", request.url));
    }

    const profile = await profileRes.json();

    // Store user in Convex
    const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://patient-toucan-352.eu-west-1.convex.site";
    const convexRes = await fetch(`${CONVEX_URL}/api/auth/linkedin-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: profile.email,
        name: profile.name || `${profile.given_name || ""} ${profile.family_name || ""}`.trim(),
        linkedinSub: profile.sub,
        picture: profile.picture,
      }),
    });

    let userId = "";
    if (convexRes.ok) {
      const convexData = await convexRes.json();
      userId = convexData.userId || "";
    }

    // Set session cookie with user data
    const sessionData = JSON.stringify({
      email: profile.email,
      name: profile.name || `${profile.given_name || ""} ${profile.family_name || ""}`.trim(),
      picture: profile.picture,
      userId,
    });

    cookieStore.set("gl_session", sessionData, {
      httpOnly: false, // Readable by client JS
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return NextResponse.redirect(new URL("/", request.url));
  } catch (err) {
    console.error("[LinkedIn OAuth] Error:", err);
    return NextResponse.redirect(new URL("/?auth_error=server_error", request.url));
  }
}
