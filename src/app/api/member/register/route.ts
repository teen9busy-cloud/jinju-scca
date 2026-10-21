import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/client';
import { hashPassword } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  try {
    const { name, school, password, role, phone, kakao_id, email } = await req.json();

    if (!name?.trim() || !school?.trim()) {
      return NextResponse.json(
        { error: '성명과 소속 학교명을 모두 입력해 주세요.' },
        { status: 400 }
      );
    }

    // If registered via Kakao, password can be a default if omitted
    const effectivePassword = password && password.length >= 4 ? password : (kakao_id ? `k_${kakao_id.slice(-6)}` : null);

    if (!effectivePassword || effectivePassword.length < 4) {
      return NextResponse.json(
        { error: '본인 확인용 비밀번호(4자 이상)를 입력해 주세요.' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check duplicate by name + school
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

    const hashedPassword = hashPassword(effectivePassword);

    const baseData: any = {
      name: name.trim(),
      school_name: school.trim(),
      password_hash: hashedPassword,
      status: 'approved',
      is_active: true,
    };

    if (kakao_id) {
      baseData.kakao_id = String(kakao_id);
    }

    let { error: insertErr } = await supabase.from('members').insert([baseData]);

    // If kakao_id column doesn't exist in Supabase table schema, retry without it
    if (insertErr && insertErr.message?.includes('kakao_id')) {
      delete baseData.kakao_id;
      const retry = await supabase.from('members').insert([baseData]);
      insertErr = retry.error;
    }

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
        email: email?.trim() || null,
        kakao_id: kakao_id ? String(kakao_id) : null,
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
