import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyAdminPassword, 
  setAdminSessionCookie, 
  clearAdminSessionCookie, 
  isAuthenticatedAdmin 
} from '@/lib/server-auth';

// 관리자 세션 유효성 확인
export async function GET() {
  const authenticated = await isAuthenticatedAdmin();
  return NextResponse.json({ authenticated });
}

// 관리자 로그인
export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json(
        { error: '비밀번호를 입력해 주세요.' },
        { status: 400 }
      );
    }

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: '관리자 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    await setAdminSessionCookie();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다: ' + err.message },
      { status: 500 }
    );
  }
}

// 관리자 로그아웃
export async function DELETE() {
  await clearAdminSessionCookie();
  return NextResponse.json({ success: true });
}
