'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Shield, Lock, Vote } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // 5대 핵심 메뉴 (홈은 좌측 '학교운영위원회 진주지역협의회' 브랜드 로고 링크로 통합)
  const navItems = [
    { name: '협의회 소개', href: '/about' },
    { name: '협의회 소식', href: '/news' }, // 공지사항 + 활동갤러리 통합
    { name: '자료실', href: '/resources' },
    { name: '전자투표·설문', href: '/vote', voteBadge: true },
    { name: '학부모 소통방', href: '/community', highlight: true },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-slate-200 shadow-sm">
      {/* 상단 띠 배너 */}
      <div className="bg-slate-900 text-slate-200 text-xs sm:text-sm py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center font-semibold">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Shield className="w-4 h-4 text-blue-400 flex-shrink-0" />
            진주시 유·초·중·고·특수학교 학교운영위원장 협조기구
          </span>
          <Link 
            href="/admin" 
            className="text-slate-300 hover:text-white flex items-center gap-1 transition-colors whitespace-nowrap ml-4 font-bold"
          >
            <Lock className="w-3.5 h-3.5" /> 관리자
          </Link>
        </div>
      </div>

      {/* 메인 네비게이션 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* 로고 겸 홈 배너 영역 (적절한 크기 조정 및 클릭 시 홈 이동) */}
          <Link 
            href="/" 
            title="학교운영위원회 진주지역협의회 홈으로 이동"
            className="flex items-center gap-3 flex-shrink-0 group py-1.5 px-2.5 -ml-2.5 rounded-2xl hover:bg-slate-50 transition-all"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
              진
            </div>
            <div className="whitespace-nowrap">
              <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors whitespace-nowrap">
                학교운영위원회 진주지역협의회
              </div>
              <div className="hidden sm:block text-[11px] text-slate-500 font-bold tracking-wide whitespace-nowrap">
                Jinju School Council Chairpersons Association
              </div>
            </div>
          </Link>

          {/* 데스크탑 메뉴 (시원하고 여유로운 여백) */}
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
          <div className="pt-3 border-t border-slate-100 mt-2">
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="block px-5 py-3 text-base text-slate-600 font-bold hover:text-slate-900"
            >
              🔒 관리자 모드
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
