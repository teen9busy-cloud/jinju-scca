import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/client';
import { hashPassword } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  try {
    const { name, school, password, role, phone } = await req.json();

    if (!name?.trim() || !school?.trim()) {
      return NextResponse.json(
        { error: '성명과 소속 학교명을 모두 입력해 주세요.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 4) {
      return NextResponse.json(
        { error: '본인 확인용 비밀번호(4자 이상)를 입력해 주세요.' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check duplicate
    const { data: existing } = await supabase
      .from('members')
      .select('id')
      .eq('name', name.trim())
      .eq('school_name', school.trim())
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: '이미 동일한 학교와 성명으로 등록된 위원 정보가 존재합니다.' },
        { status: 409 }
      );
    }

    const hashedPassword = hashPassword(password);
    const { error: insertErr } = await supabase.from('members').insert([
      {
        name: name.trim(),
        school_name: school.trim(),
        password_hash: hashedPassword,
        status: 'approved',
        is_active: true,
      },
    ]);

    if (insertErr) {
      return NextResponse.json(
        { error: '등록 처리 실패: ' + insertErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        name: name.trim(),
        school: school.trim(),
        role: role || '학교운영위원장',
        phone: phone?.trim() || null,
        registered_at: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다: ' + err.message },
      { status: 500 }
    );
  }
}
