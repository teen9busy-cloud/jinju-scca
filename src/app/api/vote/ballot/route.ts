import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const { voteId, optionId, memberName, schoolName, roleType, comment } = await req.json();

    if (!voteId || !optionId) {
      return NextResponse.json(
        { error: '투표 안건 및 항목을 선택해 주세요.' },
        { status: 400 }
      );
    }

    if (!memberName?.trim() || !schoolName?.trim()) {
      return NextResponse.json(
        { error: '소속 학교와 성명을 모두 입력해 주세요.' },
        { status: 400 }
      );
    }

    const trimmedName = memberName.trim();
    const trimmedSchool = schoolName.trim();
    const supabase = createClient();

    // 1. 서버 측 중복 투표 엄격 검증 (1인 1표 보장)
    const { data: existingBallot, error: checkErr } = await supabase
      .from('official_vote_ballots')
      .select('id')
      .eq('vote_id', voteId)
      .eq('member_name', trimmedName)
      .eq('school_name', trimmedSchool)
      .maybeSingle();

    if (existingBallot) {
      return NextResponse.json(
        { error: `[중복 투표 불가] ${trimmedSchool} ${trimmedName} 위원님은 본 안건에 이미 투표를 완료하셨습니다.` },
        { status: 409 }
      );
    }

    // 2. 투표 용지 안전 등록
    const { error: insertErr } = await supabase.from('official_vote_ballots').insert([
      {
        vote_id: voteId,
        option_id: optionId,
        member_name: trimmedName,
        school_name: trimmedSchool,
        role_type: roleType || '학교운영위원장',
        comment: comment?.trim() || null,
      },
    ]);

    if (insertErr) {
      return NextResponse.json(
        { error: '투표 기록 저장 실패: ' + insertErr.message },
        { status: 500 }
      );
    }

    // 3. 옵션 득표수 1 증가 (서버 처리)
    const { data: opt } = await supabase
      .from('official_vote_options')
      .select('vote_count')
      .eq('id', optionId)
      .single();

    if (opt) {
      await supabase
        .from('official_vote_options')
        .update({ vote_count: (opt.vote_count || 0) + 1 })
        .eq('id', optionId);
    }

    return NextResponse.json({
      success: true,
      message: '소중한 투표와 의견이 정상적으로 반영되었습니다.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: '서버 오류: ' + err.message },
      { status: 500 }
    );
  }
}
