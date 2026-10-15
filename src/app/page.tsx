import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { 
  Users, 
  MessageSquare, 
  BookOpen, 
  Bell, 
  Vote, 
  ArrowRight, 
  Calendar,
  AlertTriangle,
  Sparkles,
  History,
  CheckCircle2
} from 'lucide-react';

export default async function HomePage() {
  const supabase = createClient();

  // 1. 최신 공지사항 3건
  const { data: notices } = await supabase
    .from('notices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  // 2. 최근 익명 소통방 글 3건
  const { data: recentPosts } = await supabase
    .from('anonymous_posts')
    .select('id, title, author_name, school_name, created_at')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(3);

  // 3. 최신 진행중 전자투표/설문 안건 2건
  const { data: voteData } = await supabase
    .from('official_votes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(2);

  // 4. 주요 연혁 3건
  const { data: historyList } = await supabase
    .from('history')
    .select('*')
    .order('year', { ascending: false })
    .order('display_order', { ascending: true })
    .limit(3);

  // 5. 2026 임원진 요약
  const { data: executives } = await supabase
    .from('executives')
    .select('*')
    .eq('year', 2026)
    .order('display_order', { ascending: true })
    .limit(8);

  return (
    <div className="space-y-16 pb-20">
      {/* 1. 히어로 섹션 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            2026년도 학교운영위원회 진주지역협의회 공식 웹플랫폼
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-tight">
            진주 교육의 밝은 미래,<br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-teal-300">
              학교운영위원회가 함께합니다
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            진주시 관내 유치원, 초등학교, 중학교, 고등학교, 특수학교가 하나 되어<br className="hidden sm:inline" />
            교육 현장의 소중한 목소리를 모으고 교육 자치를 실현합니다.
          </p>
        </div>
      </section>

      {/* 데모 안내 배너 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 sm:p-5 rounded-r-xl shadow-sm flex items-start gap-3.5">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900 leading-relaxed">
            <span className="font-bold text-amber-950">📢 [알림 / 시스템 데모 운영 안내]: </span>
            본 사이트는 협의회 임원진 인수인계 및 학부모 소통을 위해 구축된 프로토타입 플랫폼입니다. 
            등록된 협의회 회칙은 2023.04.26 개정본을 기초로 등록되어 있으며, 최신 개정 사항 확인 후 관리자 모드를 통해 실시간 갱신될 예정입니다.
          </div>
        </div>
      </div>

      {/* 메인 4대 핵심 대시보드 그리드 (공지사항 / 학부모 열린마당 / 전자투표·설문 / 협의회 연혁 & 회칙) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 1. 협의회 공지사항 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center pb-5 mb-5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">협의회 공지사항</h2>
                    <p className="text-xs text-slate-500">진주학운위협의회 주요 공지 및 알림</p>
                  </div>
                </div>
                <Link href="/news" className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                  전체보기 +
                </Link>
              </div>

              <div className="space-y-3.5">
                {/* 상단 고정 회칙 링크 */}
                <Link
                  href="/news"
                  className="block p-3.5 rounded-2xl bg-blue-50/60 hover:bg-blue-50 transition-colors border border-blue-200/60"
                >
                  <div className="flex justify-between items-center text-xs text-blue-700 font-bold mb-1">
                    <span>📌 협의회 공식 안내</span>
                    <span>상시 열람</span>
                  </div>
                  <div className="text-sm font-black text-slate-900 truncate">
                    📢 [공지] 학교운영위원회 진주지역협의회 회칙 전문 열람
                  </div>
                </Link>

                {notices && notices.length > 0 ? (
                  notices.map((n) => (
                    <Link
                      key={n.id}
                      href={`/news#notice-${n.id}`}
                      className="block p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200/60"
                    >
                      <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                        <span className="font-semibold text-slate-600">{n.author}</span>
                        <span>{new Date(n.created_at).toLocaleDateString('ko-KR')}</span>
                      </div>
                      <div className="text-sm font-bold text-slate-800 truncate">
                        {n.title}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    등록된 추가 공지사항이 없습니다.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <Link href="/news" className="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center justify-between">
                <span>공지사항 및 활동 갤러리 소식 보러가기</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 2. 학부모 열린마당 (최신글) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center pb-5 mb-5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">학부모 열린마당 (최신글)</h2>
                    <p className="text-xs text-slate-500">진주시 학부모 익명 건의 및 소통</p>
                  </div>
                </div>
                <Link href="/community" className="text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors">
                  소통방 입장 +
                </Link>
              </div>

              <div className="space-y-3.5">
                {recentPosts && recentPosts.length > 0 ? (
                  recentPosts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/community#post-${p.id}`}
                      className="block p-3.5 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200/60"
                    >
                      <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                        <span className="font-semibold text-emerald-700">
                          {p.school_name ? `[${p.school_name}] ` : ''}{p.author_name}
                        </span>
                        <span>{new Date(p.created_at).toLocaleDateString('ko-KR')}</span>
                      </div>
                      <div className="text-sm font-bold text-slate-800 truncate">
                        {p.title}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    등록된 학부모 의견이 없습니다. 첫 번째 의견을 남겨보세요!
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <Link href="/community/write" className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center justify-between">
                <span>학부모 건의사항 직접 작성하기 (익명 보장)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 3. 전자투표 & 설문조사 현황 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center pb-5 mb-5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                    <Vote className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">전자투표 & 설문조사</h2>
                    <p className="text-xs text-slate-500">진주시 학교운영위원 및 학부모 의견 수렴</p>
                  </div>
                </div>
                <Link href="/vote" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                  투표 참여 +
                </Link>
              </div>

              <div className="space-y-3.5">
                {voteData && voteData.length > 0 ? (
                  voteData.map((v) => (
                    <Link
                      key={v.id}
                      href="/vote"
                      className="block p-3.5 rounded-2xl bg-indigo-50/40 hover:bg-indigo-50 border border-indigo-100/80 transition-all"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[11px] font-extrabold">
                          {v.category || '전체 운영위원장'}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          ● 진행중
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 line-clamp-1">
                        {v.title}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {v.description || '진주시 학교운영위원회 협의회 공식 전자투표 안건입니다.'}
                      </p>
                    </Link>
                  ))
                ) : (
                  <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-200 text-indigo-800 text-[11px] font-bold">
                        [전체 운영위원장]
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600">
                        ● 상시 의견 수렴
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      진주시 교육 현안 및 학교운영위원회 협의회 발전 방안 여론조사
                    </div>
                    <p className="text-xs text-slate-500">
                      관내 유·초·중·고·특수학교 위원장 및 학부모 누구나 참여하여 의견을 남기실 수 있습니다.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <Link href="/vote" className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center justify-between">
                <span>진행 중인 투표 안건 참여 및 결과 확인</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 4. 협의회 연혁 & 회칙 안내 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center pb-5 mb-5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">협의회 연혁 & 회칙</h2>
                    <p className="text-xs text-slate-500">2001년 창립 이래 진주 교육 자치 발자취</p>
                  </div>
                </div>
                <Link href="/about" className="text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors">
                  상세보기 +
                </Link>
              </div>

              <div className="space-y-3.5">
                <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-700">
                    <span>📜 학교운영위원회 진주지역협의회 회칙</span>
                    <span className="text-[11px] bg-purple-100 px-2 py-0.5 rounded-md">상시 열람</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    단위학교 교육자치 활성화, 임원 선출 규정(유2·초4·중4·고3·특수1), 회의 및 재정 규정을 투명하게 공표합니다.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-start gap-2.5 text-xs text-slate-700">
                    <span className="font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md flex-shrink-0">
                      2026년
                    </span>
                    <span className="font-semibold text-slate-800">
                      이준부 협의회장 취임 및 2026학년도 임원진 출범
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-600">
                    <span className="font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex-shrink-0">
                      2001년
                    </span>
                    <span>학교운영위원회 진주지역협의회 창립 총회 개최</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <Link href="/about" className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center justify-between">
                <span>협의회 소개, 회칙 전문 및 역대 임원진 보기</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </section>

        {/* 2026 임원진 요약 섹션 */}
        <section className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className="max-w-4xl mb-10">
            <div className="text-blue-400 font-semibold text-sm mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4" /> 2026학년도 임원진 출범
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
              진주시 학교운영위원회 협의회를 이끄는 대표단
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed lg:whitespace-nowrap">
              유치원(2명), 초등학교(4명), 중학교(4명), 고등학교(3명), 특수학교(1명) 부회장단과 감사, 사무국이 진주 교육 발전을 위해 헌신합니다.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {executives && executives.length > 0 ? (
              executives.map((exec) => (
                <div key={exec.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-blue-400 mb-3 shadow-inner bg-slate-800">
                    <img
                      src={exec.category === '회장' ? '/president.png' : (exec.photo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${exec.name}`)}
                      alt={exec.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="text-xs font-semibold text-blue-300 mb-1">{exec.role}</div>
                  <div className="font-bold text-white text-base">
                    {exec.category === '회장' && exec.name === '회장 성명' ? '이준부' : exec.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {exec.category === '회장' && exec.school === '소속 학교명' ? '협의회장' : exec.school}
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-blue-400 mb-3 shadow-inner bg-slate-800">
                    <img src="/president.png" alt="이준부 회장" className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="text-xs font-semibold text-blue-300 mb-1">협의회장</div>
                  <div className="font-bold text-white text-base">이준부</div>
                  <div className="text-xs text-slate-400 mt-0.5">협의회 대표</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 border-2 border-blue-400 mb-3 flex items-center justify-center text-blue-300 font-bold text-xl">
                    유
                  </div>
                  <div className="text-xs font-semibold text-blue-300 mb-1">유치원 부회장</div>
                  <div className="font-bold text-white text-base">2인 선출</div>
                  <div className="text-xs text-slate-400 mt-0.5">으뜸유치원 등</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 border-2 border-blue-400 mb-3 flex items-center justify-center text-blue-300 font-bold text-xl">
                    초
                  </div>
                  <div className="text-xs font-semibold text-blue-300 mb-1">초등학교 부회장</div>
                  <div className="font-bold text-white text-base">4인 선출</div>
                  <div className="text-xs text-slate-400 mt-0.5">관내 초등학교</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 border-2 border-blue-400 mb-3 flex items-center justify-center text-blue-300 font-bold text-xl">
                    중
                  </div>
                  <div className="text-xs font-semibold text-blue-300 mb-1">중학교 부회장</div>
                  <div className="font-bold text-white text-base">4인 선출</div>
                  <div className="text-xs text-slate-400 mt-0.5">관내 중학교</div>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/about#organization"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-md"
            >
              전체 임원진 상세 명단 및 조직도 보기 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
