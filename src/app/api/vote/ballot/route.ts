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

    // 1. 투표 안건 존재 여부 및 마감 여부 검증
    const { data: vote, error: voteErr } = await supabase
      .from('official_votes')
      .select('id, status')
      .eq('id', voteId)
      .maybeSingle();

    if (voteErr || !vote) {
      return NextResponse.json(
        { error: '존재하지 않는 투표 안건입니다.' },
        { status: 404 }
      );
    }

    if (vote.status !== 'active') {
      return NextResponse.json(
        { error: '이미 마감된 투표 안건입니다.' },
        { status: 400 }
      );
    }

    // 2. 선택지가 해당 투표 안건의 것인지 정합성 검증
    const { data: opt, error: optErr } = await supabase
      .from('official_vote_options')
      .select('id, vote_count')
      .eq('id', optionId)
      .eq('vote_id', voteId)
      .maybeSingle();

    if (optErr || !opt) {
      return NextResponse.json(
        { error: '해당 투표 안건에 속하지 않는 유효하지 않은 선택지입니다.' },
        { status: 400 }
      );
    }

    // 3. 서버 측 중복 투표 엄격 검증 (1인 1표 보장)
    const { data: existingBallot } = await supabase
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

    // 4. 투표 용지 안전 등록
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

    // 5. 옵션 득표수 1 증가 (서버 처리)
    await supabase
      .from('official_vote_options')
      .update({ vote_count: (opt.vote_count || 0) + 1 })
      .eq('id', optionId);

    return NextResponse.json({
      success: true,
      message: '소중한 투표와 의견이 정상적으로 반영되었습니다.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
