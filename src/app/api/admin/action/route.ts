import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/client';
import { isAuthenticatedAdmin } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  try {
    // 1. 관리자 세션 검증 (서버 쿠키 검사)
    const isAdmin = await isAuthenticatedAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: '관리자 권한이 없거나 세션이 만료되었습니다.' },
        { status: 401 }
      );
    }

    const { action, payload } = await req.json();
    const supabase = createClient();

    switch (action) {
      // 1. 임원진 관리
      case 'add-exec': {
        const { error } = await supabase.from('executives').insert([payload]);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }
      case 'delete-exec': {
        const { error } = await supabase.from('executives').delete().eq('id', payload.id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      // 2. 공지사항 관리
      case 'add-notice': {
        const { error } = await supabase.from('notices').insert([payload]);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }
      case 'delete-notice': {
        const { error } = await supabase.from('notices').delete().eq('id', payload.id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      // 3. 자료실 관리
      case 'add-resource': {
        const { error } = await supabase.from('resources').insert([payload]);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }
      case 'delete-resource': {
        const { error } = await supabase.from('resources').delete().eq('id', payload.id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      // 4. 활동 갤러리 관리
      case 'add-gallery': {
        const { error } = await supabase.from('gallery').insert([payload]);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }
      case 'delete-gallery': {
        const { error } = await supabase.from('gallery').delete().eq('id', payload.id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      // 5. 연혁 관리
      case 'add-history': {
        const { error } = await supabase.from('history').insert([payload]);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }
      case 'delete-history': {
        const { error } = await supabase.from('history').delete().eq('id', payload.id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      // 6. 전자투표 관리
      case 'add-vote': {
        const { voteData, options } = payload;
        const { data: insertedVote, error: vErr } = await supabase
          .from('official_votes')
          .insert([voteData])
          .select()
          .single();
        if (vErr || !insertedVote) throw vErr || new Error('투표 생성 실패');

        const optionsToInsert = options.map((optText: string) => ({
          vote_id: insertedVote.id,
          option_text: optText,
          vote_count: 0,
        }));
        const { error: oErr } = await supabase.from('official_vote_options').insert(optionsToInsert);
        if (oErr) throw oErr;
        return NextResponse.json({ success: true, vote: insertedVote });
      }
      case 'toggle-vote-status': {
        const { id, status } = payload;
        const { error } = await supabase
          .from('official_votes')
          .update({ status })
          .eq('id', id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }
      case 'delete-vote': {
        const { id } = payload;
        await supabase.from('official_vote_options').delete().eq('vote_id', id);
        await supabase.from('official_vote_ballots').delete().eq('vote_id', id);
        const { error } = await supabase.from('official_votes').delete().eq('id', id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      // 7. 학부모 게시판 블라인드 관리
      case 'blind-post': {
        const { id, is_deleted } = payload;
        const { error } = await supabase
          .from('anonymous_posts')
          .update({ is_deleted })
          .eq('id', id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      // 8. 설정 관리 (인사말, 회칙 등)
      case 'update-setting': {
        const { key, value } = payload;
        const { error } = await supabase
          .from('site_settings')
          .upsert({ key, value, updated_at: new Date().toISOString() });
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: '알 수 없는 관리자 동작입니다.' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: '관리자 작업 실패: ' + err.message },
      { status: 500 }
    );
  }
}
