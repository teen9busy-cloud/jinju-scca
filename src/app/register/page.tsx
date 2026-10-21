'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
  UserPlus, 
  UserCheck, 
  ShieldCheck, 
  School, 
  User, 
  Lock, 
  Phone, 
  Vote, 
  CheckCircle2,
  Check, 
  AlertCircle, 
  ArrowRight,
  Search,
  Sparkles,
  Building2
} from 'lucide-react';

// 진주시 관내 대표 학교 목록 (총 92개교 및 유치원)
const JINJU_SCHOOLS = [
  // 초등학교 (47개교)
  '진주초등학교', '봉래초등학교', '배영초등학교', '망경초등학교', '봉원초등학교',
  '천전초등학교', '도동초등학교', '중안초등학교', '금곡초등학교', '문산초등학교',
  '대곡초등학교', '금성초등학교', '미천초등학교', '반성초등학교', '사봉초등학교',
  '일반성초등학교', '이반성초등학교', '지수초등학교', '진성초등학교', '갈촌초등학교',
  '집현초등학교', '수곡초등학교', '명석초등학교', '가좌초등학교', '주약초등학교',
  '정촌초등학교', '신안초등학교', '가람초등학교', '평거초등학교', '초전초등학교',
  '서진주초등학교', '금호초등학교', '동진초등학교', '무지개초등학교', '수정초등학교',
  '예하초등학교', '충무공초등학교', '갈전초등학교', '은하수초등학교',

  // 중학교 (22개교)
  '진주중학교', '진주여자중학교', '진주동중학교', '진주남중학교', '진주중앙중학교',
  '개양중학교', '경호중학교', '대곡중학교', '문산중학교', '반성중학교',
  '명석중학교', '지수중학교', '진명여자중학교', '삼현여자중학교', '대아중학교',
  '동명중학교', '경상국립대학교사범대학부설중학교',

  // 고등학교 (21개교)
  '진주고등학교', '진주여자고등학교', '진주동명고등학교', '대아고등학교', '명신고등학교',
  '경남체육고등학교', '경남과학고등학교', '경상국립대학교사범대학부설고등학교', '진주제일여자고등학교',
  '삼현여자고등학교', '경해여자고등학교', '진주중앙고등학교', '진양고등학교', '공군항공과학고등학교',
  '진주기계공업고등학교', '경남정보고등학교', '진주외국어고등학교',

  // 특수학교 (2개교)
  '진주혜광학교', '경남은광학교',

  // 유치원 (단설 및 대표 유치원)
  '으뜸유치원', '한얼유치원', '진주유치원', '초전유치원', '가람유치원'
];

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const initialTab = searchParams.get('tab') === 'check' ? 'check' : 'register';
  const [activeTab, setActiveTab] = useState<'register' | 'check'>(initialTab);

  // 등록 폼 상태 (직책 중복 선택 지원)
  const [roles, setRoles] = useState<string[]>(['학교운영위원장']);

  const toggleRole = (targetRole: string) => {
    setRoles((prev) => {
      if (prev.includes(targetRole)) {
        if (prev.length <= 1) return prev; // 최소 1개는 필수 선택 유지
        return prev.filter((r) => r !== targetRole);
      } else {
        return [...prev, targetRole];
      }
    });
  };
  const [school, setSchool] = useState('');
  const [customSchool, setCustomSchool] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 조회 폼 상태
  const [checkName, setCheckName] = useState('');
  const [checkSchool, setCheckSchool] = useState('');
  const [checkResult, setCheckResult] = useState<any>(null);
  const [checkError, setCheckError] = useState('');
  const [searching, setSearching] = useState(false);

  // 현재 로그인/인증된 세션
  const [currentUser, setCurrentUser] = useState<any>(null);

  const kakaoAuth = searchParams.get('kakao_auth') === 'success';
  const kakaoId = searchParams.get('kakao_id');
  const kakaoName = searchParams.get('name');
  const kakaoSchool = searchParams.get('school');
  const kakaoRole = searchParams.get('role');
  const kakaoEmail = searchParams.get('email');

  useEffect(() => {
    if (kakaoAuth && kakaoId) {
      if (kakaoName && kakaoName !== '카카오회원' && !name) setName(kakaoName);
      if (kakaoSchool && !school) setSchool(kakaoSchool);
      if (kakaoRole) {
        const parsed = kakaoRole.split(',').map((s: string) => s.trim()).filter(Boolean);
        if (parsed.length > 0) setRoles(parsed);
      }

      // 이미 등록된 정회원이 카카오로 로그인한 경우 자동 세션 동기화
      if (kakaoSchool && kakaoName) {
        const u = {
          name: kakaoName,
          school: kakaoSchool,
          role: kakaoRole || '학교운영위원장',
          kakao_id: kakaoId,
          registered_at: new Date().toISOString(),
        };
        localStorage.setItem('jinju_scca_voter', JSON.stringify(u));
        setCurrentUser(u);
        window.dispatchEvent(new Event('voter-session-updated'));
      }
    }
  }, [kakaoAuth, kakaoId, kakaoName, kakaoSchool, kakaoRole]);

  useEffect(() => {
    const err = searchParams.get('error');
    if (err) {
      if (err === 'kakao_canceled') {
        setErrorMsg('카카오 로그인이 취소되었습니다.');
      } else if (err === 'kakao_token_failed') {
        setErrorMsg('카카오 인증 토큰 교환에 실패했습니다. 다시 시도해 주세요.');
      } else {
        setErrorMsg('카카오 인증 처리 중 오류가 발생했습니다: ' + err);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('jinju_scca_voter');
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  const effectiveSchool = school === '직접입력' ? customSchool.trim() : school.trim();

  // 가입·등록 제출 핸들러
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!kakaoId) {
      setErrorMsg('1인 1표 공정 선거를 위해 상단의 [카카오톡으로 1초 본인인증하기]를 먼저 완료해 주세요.');
      return;
    }

    if (!effectiveSchool) {
      setErrorMsg('소속 학교(유치원)를 선택하거나 입력해 주세요.');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('성명을 입력해 주세요.');
      return;
    }
    if (!kakaoId && (!password || password.length < 4)) {
      setErrorMsg('본인 확인용 비밀번호(4자 이상)를 입력해 주세요.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/member/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          school: effectiveSchool,
          password: password || (kakaoId ? `k_${kakaoId.slice(-6)}` : '1234'),
          role: roles.join(', '),
          roles: roles,
          phone: phone.trim() || null,
          kakao_id: kakaoId || null,
          email: kakaoEmail || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || '등록 중 오류가 발생했습니다.');
        return;
      }

      const userProfile = data.user;
      localStorage.setItem('jinju_scca_voter', JSON.stringify(userProfile));
      setCurrentUser(userProfile);
      window.dispatchEvent(new Event('voter-session-updated'));
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg('등록 중 오류가 발생했습니다: ' + (err.message || '다시 시도해 주세요.'));
    } finally {
      setSubmitting(false);
    }
  };

  // 기존 등록 여부 조회 핸들러
  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckError('');
    setCheckResult(null);

    if (!checkName.trim() || !checkSchool.trim()) {
      setCheckError('성명과 학교명을 모두 입력해 주세요.');
      return;
    }

    setSearching(true);

    try {
      // 1. official_vote_ballots 또는 로컬스토리지에서 조회
      const { data: ballots } = await supabase
        .from('official_vote_ballots')
        .select('member_name, school_name, role_type, created_at')
        .eq('member_name', checkName.trim())
        .eq('school_name', checkSchool.trim())
        .order('created_at', { ascending: false })
        .limit(1);

      let found = false;

      if (ballots && ballots.length > 0) {
        const item = ballots[0];
        setCheckResult({
          name: item.member_name,
          school: item.school_name,
          role: item.role_type || '학교운영위원장',
          source: '전자투표 명부 인증 위원',
          date: item.created_at,
        });
        found = true;
      } else {
        // 로컬스토리지 확인
        const saved = localStorage.getItem('jinju_scca_voter');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.name === checkName.trim() && parsed.school === checkSchool.trim()) {
            setCheckResult({
              name: parsed.name,
              school: parsed.school,
              role: parsed.role,
              source: '웹 플랫폼 등록 위원',
              date: parsed.registered_at,
            });
            found = true;
          }
        }
      }

      if (!found) {
        setCheckError(`[${checkSchool.trim()}] [${checkName.trim()}] 위원님의 등록 내역을 찾을 수 없습니다. 신규 등록(가입 신청)을 진행해 주세요.`);
      } else {
        // 조회된 유저로 자동 로그인 처리
        const matchedProfile = {
          name: checkName.trim(),
          school: checkSchool.trim(),
          role: checkResult?.role || '학교운영위원장',
          registered_at: new Date().toISOString(),
        };
        localStorage.setItem('jinju_scca_voter', JSON.stringify(matchedProfile));
        setCurrentUser(matchedProfile);
        window.dispatchEvent(new Event('voter-session-updated'));
      }
    } catch (err: any) {
      setCheckError('조회 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jinju_scca_voter');
    setCurrentUser(null);
    window.dispatchEvent(new Event('voter-session-updated'));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* 헤더 */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold shadow-sm">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          공정 전자투표 1인 1표 보장 및 소통 창구
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          학교운영위원 및 유권자 등록·인증 센터
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto break-keep">
          진주시 관내 92개교 유·초·중·고·특수학교 학교운영위원장님 및 교육공동체의 원활한 전자투표 참여와 의견 수렴을 위한 사전 등록 창구입니다.
        </p>
      </div>

      {/* 현재 로그인/인증 상태 카드 */}
      {currentUser && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-emerald-700 font-bold">인증 완료된 운영위원 / 유권자</div>
              <div className="text-lg font-black text-emerald-950">
                {currentUser.school} {currentUser.name} {currentUser.role}님
              </div>
              <div className="text-xs text-emerald-600 mt-0.5">
                모든 전자투표 안건에 1인 1표로 참여하실 수 있습니다.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <Link
              href="/vote"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
            >
              <Vote className="w-4 h-4" /> 전자투표 참여
            </Link>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2.5 rounded-xl border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="flex rounded-2xl bg-slate-100 p-1.5 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => {
            setActiveTab('register');
            setSuccess(false);
          }}
          className={`flex-1 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${
            activeTab === 'register'
              ? 'bg-white text-slate-900 shadow-md'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserPlus className="w-4 h-4" /> 신규 운영위원 등록
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('check');
            setSuccess(false);
          }}
          className={`flex-1 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${
            activeTab === 'check'
              ? 'bg-white text-slate-900 shadow-md'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Search className="w-4 h-4" /> 등록 여부 확인(조회)
        </button>
      </div>

      {/* 탭 1: 신규 운영위원 등록 폼 */}
      {activeTab === 'register' && (
        <div className="bg-white rounded-3xl border-2 border-slate-200/80 p-6 sm:p-10 shadow-sm space-y-6">
          {success ? (
            <div className="text-center py-10 space-y-5">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  운영위원 등록이 완료되었습니다!
                </h2>
                <p className="text-slate-600 text-sm max-w-md mx-auto break-keep">
                  <span className="font-bold text-slate-900">{effectiveSchool} {name}</span> 위원장님의 정보가 정상 등록되었습니다. 이제 전자투표 및 설문조사에 1인 1표로 참여하실 수 있습니다.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                <Link
                  href="/vote"
                  className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Vote className="w-4 h-4" /> 전자투표 안건 심의 참여하기
                </Link>
                <Link
                  href="/community"
                  className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  학부모 소통방 바로가기
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
              {/* 카카오 간편 본인인증 필수 안내 */}
              {kakaoId ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#FEE500] text-[#191919] flex items-center justify-center font-black text-xl shadow-sm flex-shrink-0">
                      💬
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-900 flex items-center gap-2">
                        <span>카카오 본인인증 완료</span>
                        <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">1인 1표 보장</span>
                      </div>
                      <div className="text-base font-black text-slate-900 mt-0.5">
                        {kakaoName && kakaoName !== '카카오회원' ? kakaoName : (name || '인증')} 위원님 <span className="text-xs text-slate-500 font-medium">(고유식별: ****{kakaoId.slice(-4)})</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-amber-900 font-bold bg-amber-200/80 px-3 py-1.5 rounded-xl flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 stroke-[3]" /> 본인확인 완료
                  </span>
                </div>
              ) : (
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100/70 border-2 border-amber-300 text-center space-y-4 shadow-sm">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-200/90 text-amber-950 text-xs font-black shadow-xs">
                    🛡️ 1인 1표 공정선거 필수 절차
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                      카카오톡 본인인증 후 등록이 진행됩니다
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto break-keep">
                      대리 가입 및 명의 도용을 원천 차단하고 공정한 1인 1표 전자투표를 보장하기 위해, 카카오톡 1초 본인인증을 먼저 진행해 주세요.
                    </p>
                  </div>
                  <div className="pt-2">
                    <a
                      href="/api/auth/kakao?returnTo=/register"
                      className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-9 py-4 rounded-2xl bg-[#FEE500] hover:bg-[#FADA0A] text-[#191919] font-black text-base shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.557 1.707 4.8 4.27 6.054-.188.702-.682 2.545-.78 2.94-.122.49.18.483.378.352.155-.103 2.46-1.67 3.456-2.35.55.08 1.11.119 1.676.119 4.97 0 9-3.185 9-7.115S16.97 3 12 3z"/>
                      </svg>
                      카카오톡으로 1초 본인인증하기 (필수)
                    </a>
                  </div>
                </div>
              )}

              {!kakaoId ? (
                <div className="p-8 sm:p-10 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-300 text-center space-y-3 animate-in fade-in">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center font-bold text-xl">
                    🔒
                  </div>
                  <div className="space-y-1">
                    <div className="font-black text-slate-800 text-sm sm:text-base">
                      위 [카카오톡으로 1초 본인인증하기]를 먼저 완료해 주세요
                    </div>
                    <div className="text-xs text-slate-500 max-w-sm mx-auto break-keep leading-relaxed">
                      대리 가입 방지를 위해 카카오 본인확인을 먼저 거치셔야 합니다. 터치 1번으로 성명이 자동 인증되며, 소속 학교와 직책을 선택하실 수 있는 등록 양식이 바로 열립니다.
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-amber-500" />
                      소속 학교 및 상세 정보 입력
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      인증된 카카오 본인 정보를 바탕으로 소속 학교와 직책을 선택해 주세요.
                    </p>
                  </div>

              {errorMsg && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* 직책 구분 (중복 선택 지원) */}
                <div className="sm:col-span-2 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black text-slate-800 flex items-center gap-2">
                      <span>참여 직책 구분</span>
                      <span className="text-rose-500">*</span>
                      <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                        중복 선택 가능
                      </span>
                    </label>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {roles.length}개 직책 선택됨
                    </span>
                  </div>

                  {/* 모바일 친절 안내 박스 */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5 leading-relaxed shadow-xs">
                    <span className="text-base flex-shrink-0">💡</span>
                    <div>
                      <strong className="text-amber-900 font-black">운영위원장이면서 협의회 임원</strong>이신 경우, 아래에서 <strong className="text-amber-900 underline font-black">두 항목을 모두 터치(체크)</strong>해 주세요.
                      <div className="text-[11px] text-amber-800 mt-0.5">
                        한 번의 등록으로 [전체 운영위원장 투표]와 [협의회 임원단 투표]에 모두 1인 1표로 참여하실 수 있습니다.
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {[
                      {
                        key: '학교운영위원장',
                        label: '학교운영위원장',
                        desc: '진주시 관내 각급 학교 및 유치원 운영위원장',
                        badge: '전체 투표권',
                      },
                      {
                        key: '협의회 임원',
                        label: '협의회 임원단',
                        desc: '협의회 회장단, 감사, 사무국 임원진',
                        badge: '임원단 투표권',
                      },
                      {
                        key: '학교운영위원',
                        label: '학교운영위원',
                        desc: '학부모위원, 지역위원, 교원위원',
                        badge: '일반 참여',
                      },
                      {
                        key: '학부모',
                        label: '일반 학부모',
                        desc: '진주시 관내 유·초·중·고·특수학교 학부모',
                        badge: '설문 참여',
                      },
                    ].map((item) => {
                      const isSelected = roles.includes(item.key);
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => toggleRole(item.key)}
                          className={`relative p-3.5 sm:p-4 rounded-2xl border-2 transition-all text-left flex items-start justify-between gap-3 active:scale-[0.99] select-none ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/80 shadow-sm text-indigo-950'
                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded-md border-2 mt-0.5 flex items-center justify-center flex-shrink-0 transition-colors ${
                                isSelected
                                  ? 'bg-indigo-600 border-indigo-600 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <div>
                              <div className="text-sm font-black flex items-center gap-2">
                                <span>{item.label}</span>
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                    isSelected
                                      ? 'bg-indigo-200/80 text-indigo-900'
                                      : 'bg-slate-100 text-slate-500'
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                {item.desc}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <span className="text-[10px] font-black text-indigo-600 bg-white border border-indigo-200 px-2 py-0.5 rounded-full flex-shrink-0">
                              선택됨 ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 소속 학교명 */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-xs font-black text-slate-700">
                    소속 학교(유치원)명 <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="w-full p-3.5 rounded-2xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-500 bg-white"
                    required
                  >
                    <option value="">-- 학교(유치원)를 선택해 주세요 (목록에 없으면 직접입력) --</option>
                    <option value="직접입력">✏️ 직접 입력하기 (목록에 없는 학교/기관)</option>
                    <optgroup label="진주시 관내 초등학교">
                      {JINJU_SCHOOLS.filter((s) => s.includes('초등학교')).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </optgroup>
                    <optgroup label="진주시 관내 중학교">
                      {JINJU_SCHOOLS.filter((s) => s.includes('중학교')).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </optgroup>
                    <optgroup label="진주시 관내 고등학교">
                      {JINJU_SCHOOLS.filter((s) => s.includes('고등학교')).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </optgroup>
                    <optgroup label="특수학교 및 대표 유치원">
                      {JINJU_SCHOOLS.filter((s) => !s.includes('초등학교') && !s.includes('중학교') && !s.includes('고등학교')).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </optgroup>
                  </select>

                  {school === '직접입력' && (
                    <input
                      type="text"
                      placeholder="학교 또는 유치원명을 직접 정확히 입력해 주세요 (예: 행복초등학교)"
                      value={customSchool}
                      onChange={(e) => setCustomSchool(e.target.value)}
                      className="w-full p-3.5 rounded-2xl border-2 border-indigo-200 text-sm focus:outline-none focus:border-indigo-500 bg-indigo-50/20"
                      required
                    />
                  )}
                </div>

                {/* 성명 */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">
                    성명 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="예: 홍길동"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3.5 rounded-2xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                {/* 연락처 */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>휴대전화 번호 (선택)</span>
                    <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                      협의회 공지·투표 알림용
                    </span>
                  </label>
                  <input
                    type="tel"
                    placeholder="예: 010-1234-5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3.5 rounded-2xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* 보안 인증 완료 안내 (카카오 인증으로 비밀번호 불필요) */}
                <div className="sm:col-span-2 p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-xs text-emerald-950 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div className="leading-relaxed">
                    <strong className="text-emerald-900 font-black">카카오 간편 보안 인증 완료:</strong> 안전한 카카오 OAuth 2.0 고유 식별값으로 본인이 확인되어, 별도의 비밀번호를 외우거나 입력하실 필요가 없습니다.
                  </div>
                </div>
              </div>

              {/* 개인정보 수집 및 이용 동의 안내 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs text-slate-700 space-y-2.5 shadow-xs">
                <div className="font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>개인정보 수집 및 이용 동의 안내 (고지)</span>
                </div>
                <div className="text-[11px] sm:text-xs text-slate-600 space-y-1.5 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/60">
                  <div>
                    <strong className="text-slate-800">• 수집 및 이용 목적:</strong> 진주시 학교운영위원장협의회 주요 공지 및 교육 현안 안내, 긴급 비상연락망 운영, 전자투표 유권자 자격 확인(1인 1표 보장)
                  </div>
                  <div>
                    <strong className="text-slate-800">• 수집 항목:</strong> 성명, 소속 학교(기관)명, 직책, 휴대전화번호, (카카오 인증 시 고유식별값)
                  </div>
                  <div>
                    <strong className="text-slate-800">• 보유 및 이용 기간:</strong> 당해 연도 위원장/임원 임기 만료 시 또는 회원 탈퇴(삭제 요청) 시 지체 없이 파기
                  </div>
                  <div>
                    <strong className="text-slate-800">• 동의 권리:</strong> 귀하는 개인정보 수집에 동의를 거부할 권리가 있으며, 동의 거부 시 비상연락망 등록 및 전자투표 참여가 제한될 수 있습니다.
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  ※ 하단의 [운영위원 / 유권자 등록 완료] 버튼을 터치하여 등록을 진행하시면 위 개인정보 수집 및 이용 목적에 동의하신 것으로 처리됩니다.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:brightness-105 text-white font-black text-base shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>운영위원 등록 처리 중...</span>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>운영위원 / 유권자 등록 완료</span>
                  </>
                )}
              </button>
                </>
              )}
            </form>
          )}
        </div>
      )}

      {/* 탭 2: 기존 등록 여부 확인(조회) */}
      {activeTab === 'check' && (
        <div className="bg-white rounded-3xl border-2 border-slate-200/80 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-600" />
              유권자 및 운영위원 등록 여부 조회
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              이미 등록을 완료하셨거나 이전에 투표에 참여하셨는지 확인합니다.
            </p>
          </div>

          <form onSubmit={handleCheck} className="space-y-4">
            {checkError && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span>{checkError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  소속 학교명 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="예: 진주초등학교 또는 진주중학교"
                  value={checkSchool}
                  onChange={(e) => setCheckSchool(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  성명 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="예: 홍길동"
                  value={checkName}
                  onChange={(e) => setCheckName(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={searching}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {searching ? (
                <span>명부 조회 중...</span>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>등록 내역 조회하기</span>
                </>
              )}
            </button>
          </form>

          {/* 조회 결과 표시 */}
          {checkResult && (
            <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-300 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-700">정상 등록된 위원 확인</div>
                  <div className="text-lg font-black text-emerald-950">
                    {checkResult.school} {checkResult.name} {checkResult.role}
                  </div>
                </div>
              </div>

              <div className="text-xs text-emerald-800 space-y-1 bg-white/70 p-3.5 rounded-2xl border border-emerald-200">
                <div>• 구분: <span className="font-bold">{checkResult.source}</span></div>
                {checkResult.date && (
                  <div>• 등록/인증 일시: {new Date(checkResult.date).toLocaleString('ko-KR')}</div>
                )}
                <div>• 권한: 2026년도 학교운영위원회 협의회 전자투표 1인 1표 행사 가능</div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Link
                  href="/vote"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
                >
                  <Vote className="w-4 h-4" /> 전자투표 바로 참여하기
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto p-12 text-center text-slate-500">페이지를 불러오는 중입니다...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
