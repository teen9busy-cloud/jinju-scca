import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/client';
import { 
  isAuthenticatedAdmin, 
  verifyAdminPassword, 
  verifyPassword 
} from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  try {
    const { type, postId, commentId, password } = await req.json();

    if (!password) {
      return NextResponse.json(
        { error: '비밀번호를 입력해 주세요.' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const isAdmin = (await isAuthenticatedAdmin()) || verifyAdminPassword(password);

    // 1. 게시글 삭제 처리
    if (type === 'post') {
      if (!postId) {
        return NextResponse.json(
          { error: '게시글 번호가 누락되었습니다.' },
          { status: 400 }
        );
      }

      const { data: post, error: fetchErr } = await supabase
        .from('anonymous_posts')
        .select('id, password_hash')
        .eq('id', postId)
        .maybeSingle();

      if (fetchErr || !post) {
        return NextResponse.json(
          { error: '게시글을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      const isAuthor = verifyPassword(password, post.password_hash);

      if (!isAdmin && !isAuthor) {
        return NextResponse.json(
          { error: '비밀번호가 일치하지 않습니다.' },
          { status: 403 }
        );
      }

      // 소프트 삭제 처리
      const { error: updateErr } = await supabase
        .from('anonymous_posts')
        .update({ is_deleted: true })
        .eq('id', postId);

      if (updateErr) {
        return NextResponse.json(
          { error: '삭제 처리 실패: ' + updateErr.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, message: '게시글이 안전하게 삭제되었습니다.' });
    }

    // 2. 댓글 삭제 처리
    if (type === 'comment') {
      if (!postId || !commentId) {
        return NextResponse.json(
          { error: '댓글 식별 정보가 누락되었습니다.' },
          { status: 400 }
        );
      }

      const commentKey = `comment:${postId}:${commentId}`;
      const { data: row, error: fetchErr } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', commentKey)
        .maybeSingle();

      if (fetchErr || !row) {
        return NextResponse.json(
          { error: '댓글을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      let isAuthor = false;
      try {
        const commentData = JSON.parse(row.value);
        if (commentData.passwordHash) {
          isAuthor = verifyPassword(password, commentData.passwordHash);
        }
      } catch (e) {}

      if (!isAdmin && !isAuthor) {
        return NextResponse.json(
          { error: '비밀번호가 일치하지 않습니다.' },
          { status: 403 }
        );
      }

      const { error: deleteErr } = await supabase
        .from('site_settings')
        .delete()
        .eq('key', commentKey);

      if (deleteErr) {
        return NextResponse.json(
          { error: '댓글 삭제 실패: ' + deleteErr.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, message: '댓글이 안전하게 삭제되었습니다.' });
    }

    return NextResponse.json({ error: '유효하지 않은 요청 타입입니다.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: '서버 처리 오류: ' + err.message },
      { status: 500 }
    );
  }
}
