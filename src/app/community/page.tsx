'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { AnonymousPost } from '@/types/database';
import { 
  MessageSquare, 
  AlertTriangle, 
  Send, 
  Trash2, 
  Search, 
  User, 
  School 
} from 'lucide-react';

export default function CommunityPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<AnonymousPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 삭제 모달 상태
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetPostId, setTargetPostId] = useState<number | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // 게시글 불러오기
  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('anonymous_posts')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPosts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 삭제 핸들러 (본인 비밀번호 또는 관리자 마스터 비밀번호)
  const handleDelete = async () => {
    if (!targetPostId || !deletePassword) {
      setDeleteError('비밀번호를 입력해 주세요.');
      return;
    }

    const targetPost = posts.find((p) => p.id === targetPostId);
    if (!targetPost) return;

    const isMaster = deletePassword === 'Wlswntl1234!';
    const isOwner = targetPost.password_hash === deletePassword;

    if (!isMaster && !isOwner) {
      setDeleteError('비밀번호가 일치하지 않습니다.');
      return;
    }

    const { error } = await supabase
      .from('anonymous_posts')
      .update({ is_deleted: true })
      .eq('id', targetPostId);

    if (error) {
      setDeleteError('삭제 중 오류가 발생했습니다: ' + error.message);
    } else {
      setDeleteModalOpen(false);
      setDeletePassword('');
      setTargetPostId(null);
      fetchPosts();
    }
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.school_name && p.school_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* 타이틀 */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold">
          <MessageSquare className="w-4 h-4" /> 열린 교육 소통방
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          학부모 열린마당 (익명 건의함)
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
          진주시 관내 학부모님들의 자유롭고 솔직한 교육 의견을 경청하는 공간입니다.
        </p>
      </div>

      {/* 이용 수칙 배너 */}
      <div className="bg-amber-50 border border-amber-300 rounded-3xl p-6 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-amber-900 font-extrabold text-base sm:text-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          [필독] 건전한 소통을 위한 게시판 이용 수칙
        </div>
        <ul className="text-sm sm:text-base text-amber-950/80 space-y-1 list-disc list-inside leading-relaxed">
          <li><strong>익명 작성</strong>: 별도의 로그인 없이 누구나 자유롭게 의견을 남기실 수 있습니다.</li>
          <li><strong>부적절한 내용 즉시 삭제</strong>: 특정 학교 교직원 및 개인에 대한 비방이나 허위사실은 관리자에 의해 즉시 삭제됩니다.</li>
        </ul>
      </div>

      {/* 툴바 (검색 및 새 페이지 글쓰기 링크) */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="제목, 내용, 학교명 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-base bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <Link
          href="/community/write"
          className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
        >
          <Send className="w-5 h-5" />
          익명 의견 작성하기
        </Link>
      </div>

      {/* 게시글 목록 */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 text-slate-400 text-base">
            소통방 글을 불러오는 중입니다...
          </div>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              id={`post-${post.id}`}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm hover:border-blue-200 transition-all space-y-3"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                    <span className="font-bold text-blue-600 flex items-center gap-1 text-sm sm:text-base">
                      <User className="w-4 h-4" /> {post.author_name}
                    </span>
                    {post.school_name && (
                      <span className="bg-slate-100 text-slate-700 font-medium px-2.5 py-0.5 rounded-lg flex items-center gap-1 text-xs sm:text-sm">
                        <School className="w-3.5 h-3.5" /> {post.school_name}
                      </span>
                    )}
                    <span>•</span>
                    <span>{new Date(post.created_at).toLocaleString('ko-KR')}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 pt-1">{post.title}</h3>
                </div>

                <button
                  onClick={() => {
                    setTargetPostId(post.id);
                    setDeletePassword('');
                    setDeleteError('');
                    setDeleteModalOpen(true);
                  }}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-xs flex items-center gap-1"
                  title="글 삭제"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <p className="text-slate-700 text-base leading-relaxed whitespace-pre-line bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
                {post.content}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 text-slate-400 text-base space-y-2">
            <MessageSquare className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700">등록된 게시글이 없습니다.</p>
            <p className="text-sm text-slate-400">진주 교육을 위한 첫 번째 의견을 남겨주세요!</p>
          </div>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-red-600 font-bold text-lg">
              <Trash2 className="w-5 h-5" /> 게시글 삭제
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              글을 작성할 때 설정하신 <strong>비밀번호</strong>를 입력해 주세요. (협의회 관리자는 마스터 비밀번호로 즉시 삭제 가능)
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
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-500 shadow-sm"
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
