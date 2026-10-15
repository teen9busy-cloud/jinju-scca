import Link from 'next/link';
import { Shield, BookOpen, Users, MessageSquare } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* 컬럼 1: 단체 정보 */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                진
              </div>
              <span className="text-white text-lg font-bold tracking-tight">
                학교운영위원회 진주지역협의회
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              진주시 관내 유치원, 초등학교, 중학교, 고등학교, 특수학교 학교운영위원회가 상호 유기적인 협조체제를 구축하여 단위학교의 교육자치와 진주 교육 발전을 실현합니다.
            </p>
            <div className="text-xs text-slate-500">
              ※ 본 사이트는 협의회 임원 및 진주시 학부모 간 소통을 위한 자율 운영 플랫폼입니다.
            </div>
          </div>

          {/* 컬럼 2: 바로가기 */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">
              주요 메뉴
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-slate-500" /> 협의회 회칙 및 연혁
                </Link>
              </li>
              <li>
                <Link href="/about#organization" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-500" /> 2026년 임원진 명단
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-blue-400 transition-colors flex items-center gap-1.5 text-blue-300 font-medium">
                  <MessageSquare className="w-4 h-4 text-blue-400" /> 학부모 익명 소통방
                </Link>
              </li>
            </ul>
          </div>

          {/* 컬럼 3: 유관 기관 링크 */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">
              교육 유관기관
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="https://jjfe.gne.go.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors block"
                >
                  경상남도진주교육지원청 ↗
                </a>
              </li>
              <li>
                <a
                  href="https://www.gne.go.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors block"
                >
                  경상남도교육청 ↗
                </a>
              </li>
              <li>
                <a
                  href="https://www.jinju.go.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors block"
                >
                  진주시청 ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} 학교운영위원회 진주지역협의회. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-slate-400">회칙 열람</Link>
            <span>•</span>
            <Link href="/community" className="hover:text-slate-400">게시판 이용수칙</Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-slate-400">임원 관리자 로그인</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
