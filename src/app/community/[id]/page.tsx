'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { AnonymousPost } from '@/types/database';
import { validateContent } from '@/utils/badwords';
import { 
  ArrowLeft, 
  User, 
  Eye, 
  Calendar, 
  Trash2, 
  MessageCircle, 
  Send, 
  ChevronUp, 
  ChevronDown, 
  Home, 
  AlertTriangle,
  Lock
} from 'lucide-react';

interface CommentItem {
  id: string;
  postId: number;
  authorName: string;
  content: string;
  createdAt: string;
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const postId = parseInt(resolvedParams.id, 10);
  const router = useRouter();
  const supabase = createClient();

  const [post, setPost] = useState<AnonymousPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // 이전글 / 다음글
  const [prevPost, setPrevPost] = useState<{ id: number; title: string } | null>(null);
  const [nextPost, setNextPost] = useState<{ id: number; title: string } | null>(null);

  // 댓글 목록 및 작성 상태
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newCommentAuthor, setNewCommentAuthor] = useState('');
  const [newCommentPassword, setNewCommentPassword] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');

  // 글 삭제 모달
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // 댓글 삭제 모달
  const [deleteCommentTarget, setDeleteCommentTarget] = useState<CommentItem | null>(null);
  const [deleteCommentPassword, setDeleteCommentPassword] = useState('');
  const [deleteCommentError, setDeleteCommentError] = useState('');

  // 1. 게시글 불러오기 & 조회수 증가
  const loadPost = async () => {
    if (isNaN(postId)) {
      setErrorMsg('유효하지 않은 게시글 번호입니다.');
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('anonymous_posts')
      .select('id, title, content, author_name, school_name, view_count, is_deleted, created_at')
      .eq('id', postId)
      .eq('is_deleted', false)
      .maybeSingle();

    if (error || !data) {
      setErrorMsg('게시글을 찾을 수 없거나 삭제된 글입니다.');
      setLoading(false);
      return;
    }

    setPost(data);

    // 조회수 1회 증가 (세션스토리지 중복 방지)
    const sessionKey = `viewed_post_${postId}`;
    if (typeof window !== 'undefined' && !sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, '1');
      await supabase
        .from('anonymous_posts')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', postId);
    }

    // 2. 이전글 / 다음글 조회
    const { data: pData } = await supabase
      .from('anonymous_posts')
      .select('id, title')
      .eq('is_deleted', false)
      .lt('id', postId)
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (pData) setPrevPost(pData);

    const { data: nData } = await supabase
      .from('anonymous_posts')
      .select('id, title')
      .eq('is_deleted', false)
      .gt('id', postId)
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (nData) setNextPost(nData);

    // 3. 댓글 목록 조회
    loadComments();

    setLoading(false);
  };

  // 댓글 로드 함수 (서버 API를 통해 비밀번호 해시는 클라이언트로 전송되지 않음)
  const loadComments = async () => {
    try {
      const res = await fetch(`/api/community/comment?postId=${postId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  useEffect(() => {
    loadPost();
  }, [postId]);

  // 댓글 등록 핸들러 (서버에서 비밀번호 단방향 PBKDF2 해싱 저장)
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError('');

    if (!newCommentContent.trim()) {
      setCommentError('댓글 내용을 입력해 주세요.');
      return;
    }
    if (!newCommentPassword || newCommentPassword.length < 4) {
      setCommentError('댓글 삭제 시 필요한 비밀번호(4자 이상)를 입력해 주세요.');
      return;
    }

    // 비속어 필터링
    const contentCheck = validateContent(newCommentContent);
    if (!contentCheck.isValid) {
      setCommentError(contentCheck.message || '댓글에 부적절한 단어가 포함되어 있습니다.');
      return;
    }

    setCommentSubmitting(true);
    try {
      const res = await fetch('/api/community/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: postId,
          authorName: newCommentAuthor.trim() || '학부모',
          content: newCommentContent.trim(),
          password: newCommentPassword,
        }),
      });

      const data = await res.json();
      setCommentSubmitting(false);

      if (!res.ok) {
        setCommentError(data.error || '댓글 등록에 실패했습니다.');
      } else {
        setNewCommentContent('');
        setNewCommentPassword('');
        loadComments();
      }
    } catch (err) {
      setCommentSubmitting(false);
      setCommentError('네트워크 오류가 발생했습니다.');
    }
  };

  // 댓글 삭제 핸들러 (서버 사이드 검증 API 호출)
  const handleDeleteComment = async () => {
    if (!deleteCommentTarget || !deleteCommentPassword) {
      setDeleteCommentError('비밀번호를 입력해 주세요.');
      return;
    }

    try {
      const res = await fetch('/api/community/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'comment',
          postId: postId,
          commentId: deleteCommentTarget.id,
          password: deleteCommentPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setDeleteCommentError(data.error || '비밀번호가 일치하지 않습니다.');
        return;
      }

      setDeleteCommentTarget(null);
      setDeleteCommentPassword('');
      setDeleteCommentError('');
      loadComments();
    } catch (err) {
      setDeleteCommentError('댓글 삭제 중 통신 오류가 발생했습니다.');
    }
  };

  // 글 삭제 핸들러 (서버 사이드 검증 API 호출)
  const handleDeletePost = async () => {
    if (!post || !deletePassword) {
      setDeleteError('비밀번호를 입력해 주세요.');
      return;
    }

    try {
      const res = await fetch('/api/community/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'post',
          postId: postId,
          password: deletePassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || '비밀번호가 일치하지 않습니다.');
        return;
      }

      alert('게시글이 안전하게 삭제되었습니다.');
      router.push('/community');
    } catch (err) {
      setDeleteError('삭제 중 통신 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center text-slate-400">
        게시글을 불러오는 중입니다...
      </div>
    );
  }

  if (errorMsg || !post) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">{errorMsg || '게시글이 존재하지 않습니다.'}</h2>
        <p className="text-sm text-slate-500">삭제되었거나 잘못된 접근입니다.</p>
        <Link
          href="/community"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> 소통방 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. 상단 브레드크럼 */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
        <Link href="/" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
          <Home className="w-3.5 h-3.5" /> 홈
        </Link>
        <span>&gt;</span>
        <Link href="/community" className="hover:text-blue-600 transition-colors">
          학부모 열린마당
        </Link>
        <span>&gt;</span>
        <span className="text-slate-900 font-bold">글 읽기</span>
      </nav>

      {/* 2. 게시글 상세 카드 */}
      <article className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {/* 상단 메타 헤더 */}
        <div className="p-5 sm:p-6 space-y-3 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-2">
            {post.school_name && (
              <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 font-bold text-xs">
                {post.school_name}
              </span>
            )}
            <span className="text-xs text-slate-400">게시글 번호 #{post.id}</span>
          </div>

          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug break-keep">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs sm:text-sm text-slate-500 border-t border-slate-200/60">
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <User className="w-4 h-4 text-blue-600" /> {post.author_name}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                {new Date(post.created_at).toLocaleString('ko-KR')}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-slate-500">
                <Eye className="w-4 h-4 text-slate-400" /> 조회 {post.view_count || 0}
              </span>
              <span className="flex items-center gap-1 text-blue-600 font-semibold">
                <MessageCircle className="w-4 h-4" /> 댓글 {comments.length}
              </span>
            </div>
          </div>
        </div>

        {/* 본문 영역 (시원하고 편안한 줄바꿈) */}
        <div className="p-5 sm:p-6 min-h-[160px]">
          <div className="text-slate-800 text-sm sm:text-[15px] leading-relaxed whitespace-pre-line break-keep font-normal select-text">
            {post.content}
          </div>
        </div>

        {/* 액션 버튼 바 (목록 & 삭제) */}
        <div className="p-4 sm:p-6 bg-slate-50/70 flex justify-between items-center">
          <Link
            href="/community"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> 목록으로
          </Link>

          <button
            onClick={() => {
              setDeletePassword('');
              setDeleteError('');
              setDeleteModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs sm:text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" /> 글 삭제
          </button>
        </div>
      </article>

      {/* 3. 댓글 섹션 (학부모 소통방) */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" /> 학부모 소통 댓글 ({comments.length})
          </h2>
          <span className="text-xs text-slate-400">자유로운 익명 의견 교환</span>
        </div>

        {/* 댓글 목록 */}
        <div className="space-y-3">
          {comments.length > 0 ? (
            comments.map((c) => (
              <div
                key={c.id}
                className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-700 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-500" /> {c.authorName}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-400">
                      {new Date(c.createdAt).toLocaleString('ko-KR')}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setDeleteCommentTarget(c);
                      setDeleteCommentPassword('');
                      setDeleteCommentError('');
                    }}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                    title="댓글 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-line break-keep">
                  {c.content}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs sm:text-sm">
              아직 등록된 댓글이 없습니다. 첫 번째 의견을 남겨보세요!
            </div>
          )}
        </div>

        {/* 새 댓글 작성 폼 */}
        <form onSubmit={handleAddComment} className="pt-4 border-t border-slate-100 space-y-3">
          {commentError && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {commentError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="작성자 닉네임 (기본: 학부모)"
              value={newCommentAuthor}
              onChange={(e) => setNewCommentAuthor(e.target.value)}
              className="p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <input
              type="password"
              placeholder="삭제용 비밀번호 (4자 이상)"
              value={newCommentPassword}
              onChange={(e) => setNewCommentPassword(e.target.value)}
              className="p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="relative">
            <textarea
              rows={3}
              placeholder="진주 교육을 위한 따뜻하고 건설적인 댓글을 남겨주세요."
              value={newCommentContent}
              onChange={(e) => setNewCommentContent(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
            ></textarea>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={commentSubmitting}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" /> {commentSubmitting ? '등록 중...' : '댓글 등록'}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* 4. 클래식 이전글 / 다음글 네비게이션 */}
      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden text-xs sm:text-sm shadow-sm">
        {nextPost ? (
          <Link
            href={`/community/${nextPost.id}`}
            className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors group"
          >
            <span className="font-bold text-blue-600 flex items-center gap-1 w-20 flex-shrink-0">
              <ChevronUp className="w-4 h-4" /> 다음글
            </span>
            <span className="text-slate-800 group-hover:text-blue-600 font-medium truncate flex-1 break-keep">
              {nextPost.title}
            </span>
          </Link>
        ) : (
          <div className="flex items-center gap-3 p-4 text-slate-400">
            <span className="font-bold flex items-center gap-1 w-20 flex-shrink-0">
              <ChevronUp className="w-4 h-4" /> 다음글
            </span>
            <span>다음 글이 없습니다.</span>
          </div>
        )}

        {prevPost ? (
          <Link
            href={`/community/${prevPost.id}`}
            className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors group"
          >
            <span className="font-bold text-blue-600 flex items-center gap-1 w-20 flex-shrink-0">
              <ChevronDown className="w-4 h-4" /> 이전글
            </span>
            <span className="text-slate-800 group-hover:text-blue-600 font-medium truncate flex-1 break-keep">
              {prevPost.title}
            </span>
          </Link>
        ) : (
          <div className="flex items-center gap-3 p-4 text-slate-400">
            <span className="font-bold flex items-center gap-1 w-20 flex-shrink-0">
              <ChevronDown className="w-4 h-4" /> 이전글
            </span>
            <span>이전 글이 없습니다.</span>
          </div>
        )}
      </div>

      {/* 글 삭제 확인 모달 */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-red-600 font-bold text-lg">
              <Trash2 className="w-5 h-5" /> 게시글 삭제
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed break-keep">
              작성 시 설정하신 <strong>비밀번호</strong>를 입력해 주세요. (관리자 마스터 비밀번호로도 삭제 가능)
            </p>

            {deleteError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
                {deleteError}
              </div>
            )}

            <input
              type="password"
              placeholder="비밀번호 입력"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                취소
              </button>
              <button
                onClick={handleDeletePost}
                className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500 shadow-sm"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 댓글 삭제 확인 모달 */}
      {deleteCommentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-red-600 font-bold text-lg">
              <Trash2 className="w-5 h-5" /> 댓글 삭제
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed break-keep">
              댓글 작성 시 설정하신 <strong>비밀번호</strong>를 입력해 주세요.
            </p>

            {deleteCommentError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
                {deleteCommentError}
              </div>
            )}

            <input
              type="password"
              placeholder="비밀번호 입력"
              value={deleteCommentPassword}
              onChange={(e) => setDeleteCommentPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteCommentTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                취소
              </button>
              <button
                onClick={handleDeleteComment}
                className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500 shadow-sm"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
