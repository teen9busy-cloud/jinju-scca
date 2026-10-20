'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { OfficialVote, OfficialVoteOption, OfficialVoteBallot } from '@/types/database';
import { 
  Vote, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  Users, 
  Clock, 
  BarChart3, 
  School, 
  User, 
  Send, 
  X,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  KeyRound
} from 'lucide-react';

export default function VotePage() {
  const supabase = createClient();
  const [votes, setVotes] = useState<OfficialVote[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 유권자(운영위원) 사전등록(가입) 모달 상태
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regSchool, setRegSchool] = useState('');
  const [regRole, setRegRole] = useState<'학교운영위원장' | '협의회 임원' | '학교운영위원' | '학부모'>('학교운영위원장');
  const [regPassword, setRegPassword] = useState('');
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regMsg, setRegMsg] = useState('');
  const [regError, setRegError] = useState('');

  // 투표 참여 모달 상태
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [activeVote, setActiveVote] = useState<OfficialVote | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [voterName, setVoterName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [roleType, setRoleType] = useState<'협의회 임원' | '학교운영위원장' | '학교운영위원' | '학부모'>('학교운영위원장');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 투표 목록 및 선택지 불러오기
  const fetchVotes = async () => {
    setLoading(true);
    // 1. 투표 목록
    const { data: voteData, error } = await supabase
      .from('official_votes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && voteData) {
      // 2. 각 투표의 옵션 가져오기
      const votesWithOptions = await Promise.all(
        voteData.map(async (v) => {
          const { data: options } = await supabase
            .from('official_vote_options')
            .select('*')
            .eq('vote_id', v.id)
            .order('id', { ascending: true });

          const total = options ? options.reduce((sum, opt) => sum + (opt.vote_count || 0), 0) : 0;
          return { ...v, options: options || [], total_votes: total };
        })
      );
      setVotes(votesWithOptions);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVotes();
    try {
      const saved = localStorage.getItem('jinju_scca_voter');
      if (saved) {
        const u = JSON.parse(saved);
        setCurrentUser(u);
        setVoterName(u.name || '');
        setSchoolName(u.school || '');
        if (u.role) setRoleType(u.role);
      }
    } catch (e) {}
  }, []);

  // 유권자(운영위원) 사전등록(가입) 핸들러
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegMsg('');

    if (!regName.trim() || !regSchool.trim()) {
      setRegError('성명과 소속 학교명을 모두 입력해 주세요.');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setRegError('본인 확인용 비밀번호(4자 이상)를 입력해 주세요.');
      return;
    }

    setRegSubmitting(true);
    try {
      const { data: existing } = await supabase
        .from('members')
        .select('id')
        .eq('name', regName.trim())
        .eq('school_name', regSchool.trim())
        .maybeSingle();

      if (existing) {
        setRegError('이미 동일한 학교와 성명으로 등록된 위원 정보가 존재합니다.');
        setRegSubmitting(false);
        return;
      }

      const { error } = await supabase.from('members').insert([
        {
          name: regName.trim(),
          school_name: regSchool.trim(),
          password_hash: regPassword,
          status: 'approved',
          is_active: true,
        },
      ]);

      if (error) {
        setRegError('등록 처리 중 오류: ' + error.message);
      } else {
        setRegMsg('운영위원 / 유권자 등록(가입)이 완료되었습니다! 이제 각 안건 투표에 1인 1표로 참여하실 수 있습니다.');
        setTimeout(() => {
          setRegisterModalOpen(false);
          setRegMsg('');
          setRegName('');
          setRegSchool('');
          setRegPassword('');
        }, 1800);
      }
    } catch (err: any) {
      setRegError('등록 오류: ' + err.message);
    } finally {
      setRegSubmitting(false);
    }
  };

  // 투표 제출 핸들러
  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!activeVote || !selectedOptionId) {
      setErrorMsg('투표 항목을 선택해 주세요.');
      return;
    }
    if (!voterName.trim() || !schoolName.trim()) {
      setErrorMsg('소속 학교와 성명을 모두 입력해 주세요.');
      return;
    }

    setSubmitting(true);

    // 중복 투표 방지 검사 (1인 1표 보장)
    const { data: existingBallot } = await supabase
      .from('official_vote_ballots')
      .select('id')
      .eq('vote_id', activeVote.id)
      .eq('member_name', voterName.trim())
      .eq('school_name', schoolName.trim())
      .maybeSingle();

    if (existingBallot) {
      setErrorMsg(`[중복 투표 불가] ${schoolName.trim()} ${voterName.trim()} 위원님은 본 안건에 이미 투표를 완료하셨습니다.`);
      setSubmitting(false);
      return;
    }

    try {
      // 1. 투표수 1 증가 (옵션 테이블)
      const currentOpt = activeVote.options?.find((o) => o.id === selectedOptionId);
      if (currentOpt) {
        await supabase
          .from('official_vote_options')
          .update({ vote_count: (currentOpt.vote_count || 0) + 1 })
          .eq('id', selectedOptionId);
      }

      // 2. 투표 용지 등록
      await supabase.from('official_vote_ballots').insert([
        {
          vote_id: activeVote.id,
          option_id: selectedOptionId,
          member_name: voterName.trim(),
          school_name: schoolName.trim(),
          role_type: roleType,
          comment: comment.trim() || null,
        },
      ]);

      setSuccessMsg('소중한 투표와 의견이 정상적으로 반영되었습니다!');
      setTimeout(() => {
        setVoteModalOpen(false);
        setSuccessMsg('');
        fetchVotes();
      }, 1200);
    } catch (err: any) {
      setErrorMsg('투표 처리 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['전체', '협의회 임원단', '전체 운영위원장', '운영위원 조사', '진주 학부모 설문'];

  const filteredVotes = votes.filter((v) => {
    if (selectedCategory === '전체') return true;
    return v.category === selectedCategory || (v.category as any) === undefined;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* 타이틀 */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
          <Vote className="w-3.5 h-3.5" /> 전자투표 & 의견 수렴
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          진주 교육 전자투표 & 설문조사
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
          학교운영위원회 협의회 임원 안건 의결부터 각 학교 운영위원장 및 학부모 현안 여론조사까지, 투명하게 참여하고 결과를 확인합니다.
        </p>
      </div>

      {/* 유권자 사전등록(가입) 안내 배너 */}
      {currentUser ? (
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-5">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-emerald-200 text-xs font-bold backdrop-blur-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> 운영위원 본인 인증 완료
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {currentUser.school} {currentUser.name} {currentUser.role}님
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200 break-keep max-w-xl">
              정상 인증되어 각 안건 투표 시 위원님의 정보가 자동 적용되며 1인 1표로 공정하게 참여하실 수 있습니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/register?tab=check"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 flex-shrink-0"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-700" /> 인증 정보 확인
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-indigo-900 to-blue-900 text-white rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-5">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-indigo-200 text-xs font-bold backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" /> 공정 전자투표 1인 1표 보장제
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              운영위원 / 유권자 사전등록 (가입 신청)
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 break-keep max-w-xl">
              진주시 관내 유치원, 초·중·고·특수학교 학교운영위원장님 및 교육공동체의 정당한 투표권 행사를 위해 사전 등록 창구를 운영합니다.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:scale-105"
            >
              <UserCheck className="w-4 h-4 text-slate-950" /> 운영위원 가입·등록
            </Link>
          </div>
        </div>
      )}

      {/* 말머리 필터 탭 */}
      <div className="flex flex-wrap gap-2 justify-center border-b border-slate-200 pb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat === '전체' ? '전체 보기' : `[${cat}]`}
          </button>
        ))}
      </div>

      {/* 안내 박스 */}
      <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-5 text-xs sm:text-sm text-indigo-950 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed space-y-1">
          <p className="font-bold">
            💡 [말머리별 참여 안내]:
          </p>
          <p>
            각 안건의 말머리(<code>[협의회 임원단]</code>, <code>[전체 운영위원장]</code>, <code>[운영위원]</code>, <code>[학부모]</code>)에 해당하는 분들이 자유롭게 소속 학교와 이름을 입력하고 투표에 참여하실 수 있으며, 투표 결과는 실시간 그래프로 투명하게 공개됩니다.
          </p>
        </div>
      </div>

      {/* 투표 목록 */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-20 text-slate-400 text-sm">
            투표 및 설문 안건을 불러오는 중입니다...
          </div>
        ) : filteredVotes.length > 0 ? (
          filteredVotes.map((vote) => (
            <div
              key={vote.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6"
            >
              {/* 상단 뱃지 및 타이틀 */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-extrabold">
                    {vote.category || '전체 운영위원장'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    vote.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {vote.status === 'active' ? '● 진행중' : '마감됨'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-full">
                    {vote.is_secret ? <Lock className="w-3 h-3 text-amber-600" /> : <Unlock className="w-3 h-3 text-blue-600" />}
                    {vote.is_secret ? '무기명 비밀투표' : '공개 투표'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(vote.created_at).toLocaleDateString('ko-KR')} 등록
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {vote.title}
                </h3>
                {vote.description && (
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {vote.description}
                  </p>
                )}
              </div>

              {/* 실시간 결과 그래프 */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-indigo-600" /> 실시간 집계 현황
                  </span>
                  <span className="text-indigo-600">총 {vote.total_votes || 0}표 참여</span>
                </div>

                <div className="space-y-2.5">
                  {vote.options?.map((opt) => {
                    const percent = vote.total_votes && vote.total_votes > 0 
                      ? Math.round(((opt.vote_count || 0) / vote.total_votes) * 100) 
                      : 0;

                    return (
                      <div key={opt.id} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-800">
                          <span>{opt.option_text}</span>
                          <span className="text-slate-500">{opt.vote_count || 0}표 ({percent}%)</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 transition-all duration-500 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 투표 참여 버튼 */}
              {vote.status === 'active' && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setActiveVote(vote);
                      setSelectedOptionId(null);
                      setErrorMsg('');
                      setSuccessMsg('');
                      setVoteModalOpen(true);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition-all hover:scale-105 flex items-center gap-1.5"
                  >
                    <Vote className="w-4 h-4" /> 투표 / 의견 참여하기
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 text-slate-400 text-sm space-y-2">
            <Vote className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
            <p className="font-semibold text-slate-600">등록된 투표나 설문조사가 없습니다.</p>
            <p className="text-xs text-slate-400">관리자 모드에서 새로운 교육 안건 투표를 등록해 보세요.</p>
          </div>
        )}
      </div>

      {/* 투표 참여 모달 */}
      {voteModalOpen && activeVote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600">[{activeVote.category || '투표'}]</span>
                <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{activeVote.title}</h3>
              </div>
              <button
                onClick={() => setVoteModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> {successMsg}
              </div>
            )}

            <form onSubmit={handleVoteSubmit} className="space-y-4 text-sm">
              {/* 참여자 정보 */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" /> 참여자 본인 확인
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">소속 학교 / 유치원 *</label>
                    <input
                      type="text"
                      placeholder="예: 으뜸유치원"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">성명 *</label>
                    <input
                      type="text"
                      placeholder="예: 홍길동"
                      value={voterName}
                      onChange={(e) => setVoterName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-600 mb-1">참여 직책 *</label>
                  <select
                    value={roleType}
                    onChange={(e) => setRoleType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="학교운영위원장">학교(유치원)운영위원장</option>
                    <option value="협의회 임원">협의회 임원 (회장단, 감사, 사무국)</option>
                    <option value="학교운영위원">학교운영위원 (학부모위원, 교원위원 등)</option>
                    <option value="학부모">일반 학부모</option>
                  </select>
                </div>
              </div>

              {/* 투표 선택지 */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  의견 선택 (1개 항목 선택) *
                </label>
                <div className="space-y-2">
                  {activeVote.options?.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedOptionId === opt.id
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold shadow-sm'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="voteOption"
                        checked={selectedOptionId === opt.id}
                        onChange={() => setSelectedOptionId(opt.id)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs sm:text-sm">{opt.option_text}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 주관식 건의사항 */}
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  추가 건의 및 한 줄 의견 (선택 사항)
                </label>
                <input
                  type="text"
                  placeholder="의견이 있으시면 자유롭게 남겨주세요"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setVoteModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-xs hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {submitting ? '제출 중...' : '투표 제출하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 유권자 사전등록(가입) 모달 */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" /> 유권자 사전등록 (가입)
              </h3>
              <button
                onClick={() => setRegisterModalOpen(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {regError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {regError}
              </div>
            )}

            {regMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {regMsg}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    소속 학교 / 유치원명 *
                  </label>
                  <input
                    type="text"
                    placeholder="예: 으뜸유치원 또는 진주초등학교"
                    value={regSchool}
                    onChange={(e) => setRegSchool(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    성명 *
                  </label>
                  <input
                    type="text"
                    placeholder="예: 홍길동"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    참여 직책 구분 *
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as any)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="학교운영위원장">학교(유치원)운영위원장</option>
                    <option value="협의회 임원">협의회 임원 (회장단, 감사, 사무국)</option>
                    <option value="학교운영위원">학교운영위원 (학부모위원, 교원위원 등)</option>
                    <option value="학부모">일반 학부모</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    본인 확인용 비밀번호 (4자 이상) *
                  </label>
                  <input
                    type="password"
                    placeholder="투표 및 본인 확인 시 사용할 비밀번호"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    * 추후 본인 투표 확인 및 의견 검증 시 사용됩니다.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRegisterModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={regSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {regSubmitting ? '등록 처리 중...' : '사전등록(가입) 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
