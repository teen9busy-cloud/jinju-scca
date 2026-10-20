'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Shield, 
  Lock, 
  Vote, 
  UserPlus, 
  UserCheck, 
  CheckCircle2, 
  LogOut 
} from 'lucide-react';
import CouncilLogo from '@/components/CouncilLogo';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [voterSession, setVoterSession] = useState<any>(null);
  const pathname = usePathname();

  // 5대 핵심 메뉴 (홈은 좌측 '학교운영위원회 진주지역협의회' 브랜드 로고 링크로 통합)
  const navItems = [
    { name: '협의회 소개', href: '/about' },
    { name: '협의회 소식', href: '/news' },
    { name: '자료실', href: '/resources' },
    { name: '전자투표·설문', href: '/vote', voteBadge: true },
    { name: '학부모 소통방', href: '/community', highlight: true },
  ];

  // 로컬 세션 확인 및 실시간 이벤트 동기화
  const syncSession = () => {
    try {
      const saved = localStorage.getItem('jinju_scca_voter');
      if (saved) {
        setVoterSession(JSON.parse(saved));
      } else {
        setVoterSession(null);
      }
    } catch (e) {
      setVoterSession(null);
    }
  };

  useEffect(() => {
    syncSession();
    window.addEventListener('voter-session-updated', syncSession);
    window.addEventListener('storage', syncSession);
    return () => {
      window.removeEventListener('voter-session-updated', syncSession);
      window.removeEventListener('storage', syncSession);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jinju_scca_voter');
    setVoterSession(null);
    window.dispatchEvent(new Event('voter-session-updated'));
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-slate-200 shadow-sm">
      {/* 상단 띠 배너 */}
      <div className="bg-slate-900 text-slate-200 text-xs sm:text-sm py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center font-semibold gap-3">
          
          {/* 좌측 슬로건 (모바일에서는 간결화) */}
          <span className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
            <Shield className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span className="hidden sm:inline">진주시 유·초·중·고·특수학교 </span>학교운영위원장 협조기구
          </span>

          {/* 우측 유틸리티 버튼군: 운영위원 가입/등록 | 유권자 확인 | 관리자 */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {voterSession ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/register?tab=check"
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold transition-colors text-xs"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{voterSession.school} </span>
                  <span>{voterSession.name} 위원</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-white flex items-center gap-0.5 transition-colors text-[11px]"
                  title="로그아웃"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden sm:inline">로그아웃</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link 
                  href="/register" 
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-2.5 sm:px-3 py-1 rounded-full flex items-center gap-1 transition-all shadow-sm text-xs hover:scale-105"
                  title="2026 학교운영위원 및 유권자 가입·사전등록"
                >
                  <UserPlus className="w-3.5 h-3.5 text-slate-950" />
                  <span>운영위원 가입·등록</span>
                </Link>
                <Link 
                  href="/register?tab=check" 
                  className="text-slate-300 hover:text-white hidden sm:flex items-center gap-1 transition-colors text-xs font-semibold"
                  title="기등록 유권자 확인"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>유권자 확인</span>
                </Link>
              </div>
            )}

            <span className="text-slate-600">|</span>

            {/* 관리자 버튼 */}
            <Link 
              href="/admin" 
              className="text-slate-300 hover:text-white flex items-center gap-1 transition-colors whitespace-nowrap font-bold text-xs"
            >
              <Lock className="w-3.5 h-3.5" /> 관리자
            </Link>
          </div>
        </div>
      </div>

      {/* 메인 네비게이션 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* 로고 겸 홈 배너 영역 */}
          <Link 
            href="/" 
            title="학교운영위원회 진주지역협의회 홈으로 이동"
            className="flex items-center gap-3 flex-shrink-0 group py-1.5 px-2.5 -ml-2.5 rounded-2xl hover:bg-slate-50 transition-all"
          >
            <CouncilLogo size={44} variant="mark" className="group-hover:scale-105 transition-transform flex-shrink-0" />
            <div className="whitespace-nowrap">
              <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors whitespace-nowrap">
                학교운영위원회 진주지역협의회
              </div>
              <div className="hidden sm:block text-[11px] text-slate-500 font-bold tracking-wide whitespace-nowrap">
                Jinju School Council Chairpersons Association
              </div>
            </div>
          </Link>

          {/* 데스크탑 메뉴 */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2.5 flex-shrink-0">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2.5 xl:px-5 xl:py-2.5 rounded-xl text-base xl:text-lg font-black whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    item.highlight
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md ml-2 hover:scale-105'
                      : item.voteBadge
                      ? isActive
                        ? 'text-indigo-700 bg-indigo-50 border-2 border-indigo-300'
                        : 'text-indigo-700 hover:bg-indigo-50 hover:text-indigo-900'
                      : isActive
                      ? 'text-blue-600 bg-blue-50 border-2 border-blue-300'
                      : 'text-slate-800 hover:text-blue-600 hover:bg-slate-100'
                  }`}
                >
                  {item.voteBadge && <Vote className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* 모바일 & 태블릿 햄버거 버튼 */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200"
              aria-label="메뉴 열기"
            >
              {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 드롭다운 */}
      {isOpen && (
        <div className="lg:hidden border-t-2 border-slate-200 bg-white px-5 pt-4 pb-8 space-y-2 shadow-2xl">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-5 py-3.5 rounded-2xl text-lg font-black transition-colors ${
                  item.highlight
                    ? 'bg-blue-600 text-white shadow-md'
                    : item.voteBadge
                    ? 'bg-indigo-50 text-indigo-900 border border-indigo-200'
                    : isActive
                    ? 'text-blue-600 bg-blue-50 border border-blue-200'
                    : 'text-slate-800 hover:bg-slate-50'
                }`}
              >
                {item.name}
              </Link>
            );
          })}

          {/* 모바일 유권자 및 운영위원 등록 / 로그인 영역 */}
          <div className="pt-4 border-t border-slate-100 mt-2 space-y-2">
            {voterSession ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-700">{voterSession.school}</div>
                  <div className="text-base font-black text-emerald-950">{voterSession.name} 위원님 (인증완료)</div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="text-xs bg-white border border-emerald-300 text-emerald-800 px-3 py-1.5 rounded-xl font-bold hover:bg-emerald-100"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black shadow-md hover:brightness-105"
                >
                  <span className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" /> 운영위원 가입·등록 (유권자 등록)
                  </span>
                  <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">신청</span>
                </Link>
                <Link
                  href="/register?tab=check"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-100"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" /> 유권자 등록여부 확인
                  </span>
                </Link>
              </>
            )}

            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="block px-5 py-3 text-base text-slate-600 font-bold hover:text-slate-900"
            >
              🔒 임원 관리자 모드
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
