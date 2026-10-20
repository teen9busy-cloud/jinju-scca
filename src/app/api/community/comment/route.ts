import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/client';
import { hashPassword } from '@/lib/server-auth';
import { validateContent } from '@/utils/badwords';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: 'postId가 필요합니다.' }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .like('key', `comment:${postId}:%`);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const comments = (data || [])
      .map((item) => {
        try {
          const val = JSON.parse(item.value);
          // Never expose passwordHash to client
          return {
            id: val.id,
            postId: val.postId,
            authorName: val.authorName,
            content: val.content,
            createdAt: val.createdAt,
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return NextResponse.json({ comments });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { postId, authorName, content, password } = await req.json();

    if (!postId || !content?.trim()) {
      return NextResponse.json({ error: '댓글 내용을 입력해 주세요.' }, { status: 400 });
    }

    if (!password || password.length < 4) {
      return NextResponse.json({ error: '비밀번호를 4자리 이상 입력해 주세요.' }, { status: 400 });
    }

    // 비속어 필터링
    const contentCheck = validateContent(content);
    if (!contentCheck.isValid) {
      return NextResponse.json({ error: contentCheck.message || '부적절한 단어가 포함되어 있습니다.' }, { status: 400 });
    }

    const commentId = `c_${Date.now()}`;
    const commentObj = {
      id: commentId,
      postId: Number(postId),
      authorName: authorName?.trim() || '학부모',
      content: content.trim(),
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    const supabase = createClient();
    const { error } = await supabase.from('site_settings').insert([
      {
        key: `comment:${postId}:${commentId}`,
        value: JSON.stringify(commentObj),
        updated_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      return NextResponse.json({ error: '댓글 저장 실패: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: commentId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
