'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { AnonymousPost } from '@/types/database';
import { 
  MessageSquare, 
  AlertTriangle, 
  PenSquare, 
  Search, 
  User, 
  School,
  ChevronLeft,
  ChevronRight,
  Eye,
  MessageCircle,
  Home
} from 'lucide-react';

export default function CommunityPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<AnonymousPost[]>([]);
  const [commentsMap, setCommentsMap] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  
  // 검색 & 페이징 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState<'all' | 'title' | 'content' | 'school' | 'author'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 게시글 및 댓글 수 불러오기
  const fetchPostsAndComments = async () => {
    setLoading(true);
    
    // 1. 게시글 조회
    const { data: postData, error: postErr } = await supabase
      .from('anonymous_posts')
      .select('id, author_name, school_name, title, content, view_count, is_deleted, created_at')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (!postErr && postData) {
      setPosts(postData);
    }

    // 2. 각 게시글별 댓글 수 조회
    const { data: commentData } = await supabase
      .from('site_settings')
      .select('key')
      .like('key', 'comment:%');

    if (commentData) {
      const counts: Record<number, number> = {};
      commentData.forEach((item) => {
        const parts = item.key.split(':');
        if (parts.length >= 3) {
          const postId = parseInt(parts[1], 10);
          if (!isNaN(postId)) {
            counts[postId] = (counts[postId] || 0) + 1;
          }
        }
      });
      setCommentsMap(counts);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPostsAndComments();
  }, []);

  // 검색 필터링
  const filteredPosts = posts.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    if (searchCategory === 'title') return p.title.toLowerCase().includes(term);
    if (searchCategory === 'content') return p.content.toLowerCase().includes(term);
    if (searchCategory === 'school') return (p.school_name || '').toLowerCase().includes(term);
    if (searchCategory === 'author') return p.author_name.toLowerCase().includes(term);
    // all
    return (
      p.title.toLowerCase().includes(term) ||
      p.content.toLowerCase().includes(term) ||
      (p.school_name && p.school_name.toLowerCase().includes(term)) ||
      p.author_name.toLowerCase().includes(term)
    );
  });

  // 페이징 계산
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, startIndex + itemsPerPage);

  // 날짜 포맷 함수 (오늘 작성된 글은 시간, 이전 글은 날짜)
  const formatBoardDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      const now = new Date();
      const isToday =
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate();

      if (isToday) {
        return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
      }
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    } catch {
      return dateString.slice(0, 10);
    }
  };

  // 24시간 이내 새 글 판별
  const isNewPost = (dateString: string) => {
    try {
      const d = new Date(dateString).getTime();
      const now = new Date().getTime();
      return now - d < 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 브레드크럼 */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
        <Link href="/" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
          <Home className="w-3.5 h-3.5" /> 홈
        </Link>
        <span>&gt;</span>
        <span className="text-slate-900 font-bold">학부모 열린마당</span>
      </nav>

      {/* 게시판 헤더 타이틀 */}
      <div className="border-b-2 border-slate-900 pb-5 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
              <MessageSquare className="w-3.5 h-3.5" /> 학부모 익명 소통방
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight break-keep">
              학부모 열린마당 (익명 건의함)
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 break-keep">
              진주시 관내 유치원, 초·중·고·특수학교 학부모님들의 자유롭고 솔직한 교육 의견을 나누는 공간입니다.
            </p>
          </div>

          <Link
            href="/community/write"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all self-start sm:self-auto hover:scale-105"
          >
            <PenSquare className="w-4 h-4" /> 글쓰기
          </Link>
        </div>
      </div>

      {/* 이용 수칙 안내 배너 */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs sm:text-sm text-amber-950 flex items-start gap-3 shadow-sm">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5 break-keep">
          <span className="font-bold text-amber-900">게시판 이용 안내: </span>
          별도의 회원가입 없이 익명으로 자유롭게 글과 댓글을 작성하실 수 있습니다. 단, 특정 교직원 및 개인에 대한 비방이나 허위사실은 관리자에 의해 제재될 수 있습니다.
        </div>
      </div>

      {/* 상단 통계 및 검색 바 */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs sm:text-sm text-slate-600 pt-1">
        <div className="font-semibold self-start sm:self-auto">
          전체 <span className="text-blue-600 font-bold">{filteredPosts.length}</span>건
          <span className="text-slate-400 mx-2">|</span>
          <span className="text-slate-700 font-medium">{currentPage}</span> / {totalPages} 페이지
        </div>

        {/* 상단 빠른 검색 */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="제목, 내용, 학교명 검색..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. 데스크톱 클래식 게시판 테이블 (md 이상) */}
      {/* ========================================================= */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse" aria-label="학부모 소통방 게시글 목록">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider text-center h-12">
              <th scope="col" className="w-16 py-3 px-2">번호</th>
              <th scope="col" className="w-32 py-3 px-3">학교/소속</th>
              <th scope="col" className="py-3 px-4 text-left">제목</th>
              <th scope="col" className="w-28 py-3 px-3">작성자</th>
              <th scope="col" className="w-28 py-3 px-3">작성일</th>
              <th scope="col" className="w-20 py-3 px-2">조회</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-20 text-slate-400">
                  게시글을 불러오는 중입니다...
                </td>
              </tr>
            ) : currentPosts.length > 0 ? (
              currentPosts.map((post, idx) => {
                const postNum = filteredPosts.length - (startIndex + idx);
                const commentsCount = commentsMap[post.id] || 0;
                const isNew = isNewPost(post.created_at);

                return (
                  <tr
                    key={post.id}
                    className="hover:bg-blue-50/40 transition-colors group"
                  >
                    {/* 번호 */}
                    <td className="text-center py-3.5 px-2 text-slate-500 text-xs font-medium">
                      {postNum}
                    </td>

                    {/* 학교명 태그 */}
                    <td className="text-center py-3.5 px-3">
                      {post.school_name ? (
                        <span className="inline-block max-w-[110px] truncate px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200">
                          {post.school_name}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>

                    {/* 제목 (클릭 시 상세 이동!) */}
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/community/${post.id}`}
                        className="inline-flex items-center gap-2 text-slate-900 group-hover:text-blue-600 font-semibold transition-colors break-keep"
                      >
                        <span className="line-clamp-1">{post.title}</span>
                        {commentsCount > 0 && (
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-200">
                            [{commentsCount}]
                          </span>
                        )}
                        {isNew && (
                          <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">
                            N
                          </span>
                        )}
                      </Link>
                    </td>

                    {/* 작성자 */}
                    <td className="text-center py-3.5 px-3 text-slate-600 text-xs font-medium">
                      <span className="flex items-center justify-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {post.author_name}
                      </span>
                    </td>

                    {/* 작성일 */}
                    <td className="text-center py-3.5 px-3 text-slate-500 text-xs">
                      {formatBoardDate(post.created_at)}
                    </td>

                    {/* 조회수 */}
                    <td className="text-center py-3.5 px-2 text-slate-500 text-xs font-medium">
                      {post.view_count || 0}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-16 text-slate-400 space-y-2">
                  <MessageSquare className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="font-bold text-slate-700">등록된 게시글이 없습니다.</p>
                  <p className="text-xs text-slate-400">진주 교육을 위한 첫 번째 의견을 남겨주세요!</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================= */}
      {/* 2. 모바일 반응형 카드 리스트 (md 미만) */}
      {/* ========================================================= */}
      <div className="block md:hidden bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            게시글을 불러오는 중입니다...
          </div>
        ) : currentPosts.length > 0 ? (
          currentPosts.map((post) => {
            const commentsCount = commentsMap[post.id] || 0;
            const isNew = isNewPost(post.created_at);

            return (
              <Link
                key={post.id}
                href={`/community/${post.id}`}
                className="block p-4 hover:bg-slate-50 transition-colors space-y-2"
              >
                {/* 상단: 학교 태그 & 제목 & 뱃지 */}
                <div className="flex items-start gap-2">
                  {post.school_name && (
                    <span className="flex-shrink-0 px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-[11px] border border-blue-200">
                      {post.school_name}
                    </span>
                  )}
                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 break-keep flex-1">
                    {post.title}
                  </h3>
                  {commentsCount > 0 && (
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 flex-shrink-0">
                      [{commentsCount}]
                    </span>
                  )}
                  {isNew && (
                    <span className="w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center flex-shrink-0">
                      N
                    </span>
                  )}
                </div>

                {/* 하단 메타 정보 */}
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="font-semibold text-slate-600 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" /> {post.author_name}
                  </span>
                  <span>•</span>
                  <span>{formatBoardDate(post.created_at)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {post.view_count || 0}
                  </span>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-16 text-slate-400 text-xs">
            등록된 게시글이 없습니다.
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 3. 페이지네이션 (Pagination) */}
      {/* ========================================================= */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1 pt-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="이전 페이지"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                currentPage === page
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="다음 페이지"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 하단 툴바: 검색 옵션 & 글쓰기 버튼 */}
      <div className="bg-slate-100/70 p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* 검색 폼 */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value as any)}
            className="p-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">전체검색</option>
            <option value="title">제목</option>
            <option value="content">내용</option>
            <option value="school">학교명</option>
            <option value="author">작성자</option>
          </select>
          <div className="relative flex-1 sm:w-60">
            <input
              type="text"
              placeholder="검색어 입력..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* 글쓰기 버튼 */}
        <Link
          href="/community/write"
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:scale-105"
        >
          <PenSquare className="w-4 h-4" /> 학부모 의견 글쓰기
        </Link>
      </div>
    </div>
  );
}
