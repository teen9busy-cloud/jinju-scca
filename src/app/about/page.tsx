import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { 
  BookOpen, 
  Award, 
  Users, 
  Calendar, 
  FileText, 
  CheckCircle, 
  ArrowRight, 
  School, 
  Shield, 
  Briefcase,
  History as HistoryIcon
} from 'lucide-react';

export default async function AboutPage() {
  const supabase = createClient();

  // 2026 임원진 명단 가져오기
  const { data: executives } = await supabase
    .from('executives')
    .select('*')
    .eq('year', 2026)
    .order('display_order', { ascending: true });

  const president = executives?.filter((e) => e.category === '회장') || [];
  const vicePresidents = executives?.filter((e) => e.category === '부회장단') || [];
  const auditors = executives?.filter((e) => e.category === '감사') || [];
  const secretariat = executives?.filter((e) => e.category === '사무국') || [];

  // 역대 연혁 데이터 가져오기
  const { data: historyList } = await supabase
    .from('history')
    .select('*')
    .order('year', { ascending: false })
    .order('display_order', { ascending: true });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      {/* 헤더 */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-sm font-bold">
          <BookOpen className="w-4 h-4 text-blue-600" /> 협의회 소개
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          학교운영위원회 진주지역협의회
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-4xl mx-auto md:whitespace-nowrap">
          진주 교육의 자주성과 단위학교의 교육 자치를 실현하는 학교운영위원장 공식 협조기구입니다.
        </p>
      </div>

      {/* 1. 협회장(이준부 회장) 프로필 및 취임 인사말 */}
      <section className="bg-white rounded-3xl border-2 border-slate-200 p-8 sm:p-12 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-start">
          {/* 협회장 사진 & 프로필 */}
          <div className="w-56 sm:w-64 flex-shrink-0 text-center space-y-3">
            <div className="relative w-56 h-64 sm:w-64 sm:h-72 mx-auto rounded-3xl overflow-hidden shadow-xl border-4 border-slate-100 bg-slate-50">
              <img
                src="/president.png"
                alt="학교운영위원회 진주지역협의회 이준부 회장"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div>
              <div className="inline-block px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold mb-1">
                학교운영위원회 진주지역협의회
              </div>
              <h3 className="text-3xl font-black text-slate-900">이준부 회장</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-semibold">
                진주시 유·초·중·고·특수학교 운영위원장 협의회 대표
              </p>
            </div>
          </div>

          {/* 인사말 본문 */}
          <div className="space-y-5 flex-1">
            <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" /> 협의회장 취임 인사말
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug break-keep">
              "소통과 신뢰로 함께 여는 진주 교육의 희망찬 내일"
            </h2>

            <div className="space-y-4 text-slate-700 text-base leading-relaxed break-keep">
              <p>
                존경하는 진주시 학부모님과 학교운영위원, 그리고 교육가족 여러분, 안녕하십니까.<br />
                학교운영위원회 진주지역협의회 홈페이지를 찾아주신 여러분을 진심으로 환영합니다.
              </p>
              <p>
                유구한 역사와 충절의 고장이자 천년 교육의 요람인 우리 진주는 예로부터 올곧은 인재를 길러온 자랑스러운 배움터입니다. 급변하는 교육 환경 속에서 우리 아이들이 안전하고 행복하게 꿈을 키워갈 수 있도록 돕는 것은 우리 교육공동체 모두의 소중한 사명입니다.
              </p>
              <p>
                저희 협의회는 진주시 관내 유치원, 초등학교, 중학교, 고등학교, 특수학교의 모든 운영위원장님들과 머리를 맞대고, <strong>단위학교의 교육 자치 실현과 학교 간 유기적인 협조체제 구축</strong>을 위해 최선을 다하겠습니다. 특히 교육 현장의 생생한 목소리와 학부모님들의 진솔한 의견을 수렴하여 진주교육지원청 및 유관기관과 적극적으로 소통하는 <strong>든든한 가교</strong>가 되겠습니다.
              </p>
              <p className="pt-1">
                진주 교육가족 여러분의 가정에 늘 건강과 행복이 가득하시기를 진심으로 기원합니다. 감사합니다.
              </p>
            </div>

            <div className="pt-5 border-t border-slate-100 flex justify-between items-center text-sm sm:text-base">
              <span className="text-slate-400 text-sm">학교운영위원회 진주지역협의회</span>
              <span className="font-black text-slate-900 text-lg">
                회장 이 준 부
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 회장 바로 밑에 배치된 2026년 임원진 조직도 */}
      <section id="organization" className="space-y-8 pt-4">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
            <Users className="w-3.5 h-3.5" /> 2026학년도 대표단
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            협의회 임원진 조직도
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-5xl mx-auto md:whitespace-nowrap">
            회칙 제4조에 의거하여 선출된 회장, 부회장단(유치원 2명, 초등 4명, 중등 4명, 고등 3명, 특수 1명), 감사, 사무국 임원진입니다.
          </p>
        </div>

        {/* 부회장단 (14인) 카드 그리드 */}
        <div className="space-y-4">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
            <School className="w-5 h-5 text-blue-600" /> 부회장단 (14인)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {vicePresidents.map((vp) => (
              <div key={vp.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center text-xl font-bold">
                  {vp.name.slice(0, 1)}
                </div>
                <div className="text-xs font-bold text-blue-600">{vp.role}</div>
                <h4 className="text-base font-bold text-slate-900">{vp.name}</h4>
                <p className="text-xs text-slate-500 font-medium">{vp.school}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 감사 및 사무국 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* 감사 */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Shield className="w-5 h-5 text-purple-600" /> 감사 (2인)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {auditors.map((a) => (
                <div key={a.id} className="p-4 bg-slate-50 rounded-2xl text-center">
                  <div className="text-xs font-bold text-purple-600 mb-1">{a.role}</div>
                  <div className="font-bold text-slate-900 text-base">{a.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{a.school}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 사무국 */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Briefcase className="w-5 h-5 text-amber-600" /> 사무국
            </h3>
            <div className="space-y-3">
              {secretariat.map((s) => (
                <div key={s.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-amber-600">{s.role}</div>
                    <div className="font-bold text-slate-900 text-base">{s.name}</div>
                  </div>
                  <div className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-xl border border-slate-200">
                    {s.school}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. 협의회 회칙 게시판 링크 배너 (게시판으로 깔끔하게 이동) */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-8 sm:p-10 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 text-xs font-bold">
            <FileText className="w-3.5 h-3.5" /> 회칙 열람 안내
          </div>
          <h3 className="text-2xl font-black">학교운영위원회 진주지역협의회 회칙</h3>
          <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
            협의회 명칭, 임원 선출 규정(유2·초4·중4·고3·특수1), 회의 및 재정에 관한 회칙 전문을 소식 게시판에서 상시 열람하실 수 있습니다.
          </p>
        </div>
        <Link
          href="/news"
          className="px-7 py-3.5 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 font-black text-sm shadow-md flex items-center gap-2 flex-shrink-0 transition-transform hover:scale-105"
        >
          회칙 전문 공지글 보기 <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* 4. 주요 연혁 및 역대 회장·부회장단 아카이빙 명부 */}
      <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-2">
            <HistoryIcon className="w-3.5 h-3.5" /> 연혁 및 역사
          </div>
          <h2 className="text-3xl font-black text-slate-900">
            주요 연혁 및 역대 임원진 명부
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            2001년 창립 이래 진주 교육 발전을 위해 헌신해 온 역대 임원진과 주요 활동 발자취입니다. (매년 자동 누적 보존)
          </p>
        </div>

        {/* 타임라인 */}
        <div className="relative border-l-2 border-blue-200 ml-4 sm:ml-8 space-y-8 py-2">
          {historyList && historyList.length > 0 ? (
            historyList.map((item) => (
              <div key={item.id} className="relative pl-6 sm:pl-8 group">
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm group-hover:scale-125 transition-transform" />
                <div className="text-xs font-bold text-blue-600">
                  {item.year}년 {item.month ? `${item.month}월` : ''}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="text-slate-400 text-sm pl-6">등록된 연혁이 없습니다.</div>
          )}
        </div>

        {/* 역대 회장 및 임원진 누적 보존 테이블 */}
        <div className="pt-6 border-t border-slate-200 space-y-4">
          <h3 className="text-xl font-black text-slate-900">역대 임원진</h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-xs sm:text-sm">
                  <th className="p-3.5 text-center w-24">연도/대수</th>
                  <th className="p-3.5 w-32">협의회장</th>
                  <th className="p-3.5">부회장단 구성 (소속 및 성명)</th>
                  <th className="p-3.5 w-32 text-center">비고</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-blue-50/40 bg-blue-50/20 font-medium">
                  <td className="p-3.5 text-center font-bold text-blue-700">2026년도</td>
                  <td className="p-3.5 font-bold text-slate-900">이준부</td>
                  <td className="p-3.5 text-xs sm:text-sm leading-relaxed">
                    <strong>유치원(2):</strong> 으뜸유치원 등 2명 / <strong>초등학교(4):</strong> 4명 / <strong>중학교(4):</strong> 4명 / <strong>고등학교(3):</strong> 3명 / <strong>특수(1):</strong> 1명
                  </td>
                  <td className="p-3.5 text-center text-xs font-bold text-emerald-600 bg-emerald-50 rounded-lg">
                    당해연도 임원단
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 text-slate-600">
                  <td className="p-3.5 text-center font-semibold">2025년도</td>
                  <td className="p-3.5 font-semibold">역대 회장</td>
                  <td className="p-3.5 text-xs leading-relaxed text-slate-500">
                    각급 학교(유·초·중·고) 부회장단 및 감사, 사무국
                  </td>
                  <td className="p-3.5 text-center text-xs text-slate-400">임기 만료</td>
                </tr>
                <tr className="hover:bg-slate-50 text-slate-600">
                  <td className="p-3.5 text-center font-semibold">2024년도</td>
                  <td className="p-3.5 font-semibold">역대 회장</td>
                  <td className="p-3.5 text-xs leading-relaxed text-slate-500">
                    각급 학교(유·초·중·고) 부회장단 및 감사, 사무국
                  </td>
                  <td className="p-3.5 text-center text-xs text-slate-400">임기 만료</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400">
            ※ 매년 총회가 끝나면 관리자 모드를 통해 당해연도 임원이 갱신되고, 이전 임원 명단은 본 아카이브 표에 연도별로 영구 누적 보존됩니다.
          </p>
        </div>
      </section>
    </div>
  );
}
