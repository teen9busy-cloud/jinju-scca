import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const kakaoClientId = process.env.KAKAO_CLIENT_ID || 'de08c5d8818e993f1d5b8542793f5d3a';

  // Determine current host
  const host = req.headers.get('host') || 'jinju-scca.vercel.app';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/auth/callback/kakao`;

  const searchParams = req.nextUrl.searchParams;
  const returnTo = searchParams.get('returnTo') || '/register';

  // State parameter to pass return destination
  const state = encodeURIComponent(returnTo);

  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoClientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&state=${state}`;

  return NextResponse.redirect(kakaoAuthUrl);
}
