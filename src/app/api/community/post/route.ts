import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/client';
import { hashPassword } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  try {
    const { title, content, authorName, schoolName, password } = await req.json();

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: '제목과 내용을 모두 입력해 주세요.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 4) {
      return NextResponse.json(
        { error: '비밀번호를 4자리 이상 입력해 주세요.' },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);
    const supabase = createClient();

    const { data, error } = await supabase
      .from('anonymous_posts')
      .insert([
        {
          title: title.trim(),
          content: content.trim(),
          author_name: authorName?.trim() || '학부모',
          school_name: schoolName?.trim() || null,
          password_hash: hashedPassword,
        },
      ])
      .select('id')
      .single();

    if (error) {
      return NextResponse.json(
        { error: '게시글 등록 실패: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err: any) {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다: ' + err.message },
      { status: 500 }
    );
  }
}
