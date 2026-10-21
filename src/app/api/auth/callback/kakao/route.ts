import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/client';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const returnTo = state ? decodeURIComponent(state) : '/register';
  const host = req.headers.get('host') || 'jinju-scca.vercel.app';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/auth/callback/kakao`;

  if (error || !code) {
    return NextResponse.redirect(`${protocol}://${host}/register?error=kakao_canceled`);
  }

  const clientId = process.env.KAKAO_CLIENT_ID || 'de08c5d8818e993f1d5b8542793f5d3a';
  const clientSecret = process.env.KAKAO_CLIENT_SECRET || 'gRAQUUTm33rWtZynP2BWRKHANSK94HE1';

  try {
    // 1. Exchange authorization code for access token
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code: code,
    });

    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      body: tokenParams.toString(),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Kakao token exchange failed:', tokenData);
      return NextResponse.redirect(`${protocol}://${host}/register?error=kakao_token_failed`);
    }

    // 2. Fetch Kakao user profile
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    const userData = await userRes.json();
    if (!userRes.ok || !userData.id) {
      console.error('Kakao user info fetch failed:', userData);
      return NextResponse.redirect(`${protocol}://${host}/register?error=kakao_user_failed`);
    }

    const kakaoId = String(userData.id);
    const nickname =
      userData.properties?.nickname ||
      userData.kakao_account?.profile?.nickname ||
      '카카오회원';
    const email = userData.kakao_account?.email || '';

    // 3. Check if user is already a registered member
    const supabase = createClient();
    const { data: existingMember } = await supabase
      .from('members')
      .select('*')
      .or(`kakao_id.eq.${kakaoId},name.eq.${nickname}`)
      .limit(1)
      .maybeSingle();

    if (existingMember) {
      // User is already registered!
      const targetUrl = new URL(returnTo, `${protocol}://${host}`);
      targetUrl.searchParams.set('kakao_auth', 'success');
      targetUrl.searchParams.set('kakao_id', kakaoId);
      targetUrl.searchParams.set('name', existingMember.name || nickname);
      targetUrl.searchParams.set('school', existingMember.school_name || '');
      targetUrl.searchParams.set('role', existingMember.role || '학교운영위원');
      return NextResponse.redirect(targetUrl.toString());
    }

    // User is new! Redirect to registration page with pre-filled verified info
    const regUrl = new URL('/register', `${protocol}://${host}`);
    regUrl.searchParams.set('kakao_auth', 'success');
    regUrl.searchParams.set('kakao_id', kakaoId);
    regUrl.searchParams.set('name', nickname);
    if (email) regUrl.searchParams.set('email', email);

    return NextResponse.redirect(regUrl.toString());
  } catch (err: any) {
    console.error('Kakao OAuth Exception:', err);
    return NextResponse.redirect(`${protocol}://${host}/register?error=kakao_exception`);
  }
}
