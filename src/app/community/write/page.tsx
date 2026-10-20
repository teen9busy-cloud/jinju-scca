'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { validateContent } from '@/utils/badwords';
import { ShieldCheck, ArrowLeft, Send, AlertTriangle, User, School, Lock } from 'lucide-react';

export default function CommunityWritePage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. 유효성 검사
    if (!title.trim() || !content.trim()) {
      setErrorMsg('제목과 내용을 모두 입력해 주세요.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMsg('글 삭제 시 필요한 비밀번호(4자리 이상)를 입력해 주세요.');
      return;
    }

    // 2. 비속어/욕설/광고 필터링
    const titleCheck = validateContent(title);
    if (!titleCheck.isValid) {
      setErrorMsg(titleCheck.message || '제목에 부적절한 단어가 포함되어 있습니다.');
      return;
    }

    const contentCheck = validateContent(content);
    if (!contentCheck.isValid) {
      setErrorMsg(contentCheck.message || '내용에 부적절한 단어가 포함되어 있습니다.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/community/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          authorName: authorName.trim() || '학부모',
          schoolName: schoolName.trim() || null,
          password: password,
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (!res.ok) {
        setErrorMsg(data.error || '글 등록 중 오류가 발생했습니다.');
      } else {
        alert('소중한 의견이 등록되었습니다.');
        router.push('/community');
      }
    } catch (err: any) {
      setSubmitting(false);
      setErrorMsg('네트워크 통신 오류가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* 뒤로가기 */}
      <div>
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-base font-bold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> 소통방 목록으로 돌아가기
        </Link>
      </div>

      {/* 헤더 */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-blue-600" /> 학부모 익명 의견 작성
        </h1>
        <p className="text-slate-600 text-base mt-2">
          진주 교육의 발전을 위한 솔직하고 건설적인 의견을 남겨주세요.
        </p>
      </div>

      {/* 주의사항 */}
      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 text-sm text-amber-950 leading-relaxed space-y-1">
        <p className="font-bold flex items-center gap-1.5 text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600" /> 이용 수칙 안내
        </p>
        <p>
          특정 개인에 대한 비방이나 허위사실, 영리성 광고글은 관리자에 의해 즉시 삭제될 수 있습니다.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
          {errorMsg}
        </div>
      )}

      {/* 글쓰기 폼 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600" /> 작성자 닉네임 (선택)
            </label>
            <input
              type="text"
              placeholder="미입력 시 '학부모'로 표시"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              maxLength={20}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <School className="w-4 h-4 text-emerald-600" /> 소속 학교 / 유치원 (선택)
            </label>
            <input
              type="text"
              placeholder="예: 으뜸유치원, 진주초 등"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              maxLength={30}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1.5">
            의견 제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="제목을 입력해 주세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1.5">
            의견 내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="진주 교육을 위한 소중한 의견을 자유롭게 적어주세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            required
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-purple-600" /> 글 삭제용 비밀번호 (4자리 이상) <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            placeholder="나중에 본인이 직접 글을 삭제할 때 사용됩니다"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            maxLength={10}
            required
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <Link
            href="/community"
            className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-base transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-lg shadow-blue-600/30 transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            {submitting ? '등록 중...' : '의견 등록하기'}
          </button>
        </div>
      </form>
    </div>
  );
}
