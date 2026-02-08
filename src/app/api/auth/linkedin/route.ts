import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || "78qujt24fap1g9";
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || "https://growthlens-blue.vercel.app/api/auth/callback/linkedin";

export async function GET() {
  // Generate random state for CSRF protection
  const state = Math.random().toString(36).substring(2, 15);
  
  const cookieStore = await cookies();
  cookieStore.set("linkedin_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    state,
    scope: "openid profile email",
  });

  return NextResponse.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params}`);
}
