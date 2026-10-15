'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Notice, GalleryItem } from '@/types/database';
import { Bell, Camera, Pin, Calendar, Search, FileText, ArrowRight, X } from 'lucide-react';

export default function NewsPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'notices' | 'gallery'>('notices');
  const [notices, setNotices] = useState<Notice[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  // 기본 회칙 공지글 (게시판 상단 고정용)
  const defaultRulesNotice: Notice = {
    id: 9999,
    title: '📢 [공지] 학교운영위원회 진주지역협의회 회칙 전문 (최근 개정본 열람)',
    content: `학교운영위원회 진주지역협의회 회칙 전문입니다.

제1장 총칙
제1조(명칭) 협의회의 명칭은 "학교운영위원회 진주지역협의회"(이하 "협의회"라 한다.)라 한다.
제2조(목적) 협의회는 학교 간 유기적인 협조체제를 구축하여 교육현장의 다양한 의견을 상호교환, 수렴함으로써 단위학교의 교육자치를 활성화함에 그 목적을 둔다.

제2장 회원 및 조직
제3조(회원의 자격) 협의회 회원은 진주 지역 내 유치원, 초등학교, 중학교, 고등학교, 특수학교, 기타학교 운영위원장으로 한다.
제4조(임원) 
① 협의회에는 회장 1명, 부회장 14명(수석부회장 1명 포함), 감사 2명, 사무국장 1명의 임원을 둔다.
② 단, 부회장은 유 2명, 초 4명, 중 4명, 고 3명, 특수(기타) 1명으로 한다.
제5조(임무) 회장은 협의회를 대표하고 협의회 사무를 총괄한다.
제6조(임원의 임기) 임원의 임기는 1년으로 하고, 1회에 한하여 연임할 수 있다. 임원의 임기는 5월 1일에 시작한다.

제3장 회의 및 제4장 재정
제8조(회의) 정기회는 4월중에 개최한다. 임시회는 분기별 1회 개최를 원칙으로 한다.
제9조(협의사항) 단위학교 운영 내실화, 공동현안 의견 교환 및 교육자치 발전 방안 협의.
제12조(회계연도) 매년 정기회 개최일로부터 다음연도 정기회 개최 전일까지로 한다.

※ 본 회칙은 2023.04.26 개정본 기준이며, 2026년도 정기총회 의결 사항에 따라 개정될 수 있습니다.`,
    author: '진주학운위협의회',
    is_pinned: true,
    view_count: 142,
    created_at: '2026-05-01T00:00:00Z',
  };

  const loadData = async () => {
    setLoading(true);
    // 공지사항
    const { data: nData } = await supabase
      .from('notices')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    const combinedNotices = [defaultRulesNotice, ...(nData || []).filter((n) => n.id !== 9999)];
    setNotices(combinedNotices);

    // 갤러리
    const { data: gData } = await supabase
      .from('gallery')
      .select('*')
      .order('event_date', { ascending: false });
    if (gData) setGallery(gData);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredNotices = notices.filter(
    (n) =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGallery = gallery.filter(
    (g) =>
      g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.content && g.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* 타이틀 */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-sm font-bold">
          <Bell className="w-4 h-4 text-blue-600" /> 협의회 소식마당
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          협의회 소식 & 활동 갤러리
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
          학교운영위원회 진주지역협의회의 공식 공지, 회칙 안내 및 현장 활동 사진을 한곳에서 확인하세요.
        </p>
      </div>

      {/* 2대 탭 네비게이션: 공지사항 vs 활동 갤러리 */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('notices')}
            className={`px-6 py-3 rounded-2xl text-base font-black transition-all flex items-center gap-2 ${
              activeTab === 'notices'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-4 h-4" /> 공지사항 ({notices.length}건)
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-6 py-3 rounded-2xl text-base font-black transition-all flex items-center gap-2 ${
              activeTab === 'gallery'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Camera className="w-4 h-4" /> 활동 갤러리 ({gallery.length}건)
          </button>
        </div>

        {/* 검색창 */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="소식 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* 탭 1: 공지사항 목록 */}
      {activeTab === 'notices' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm divide-y divide-slate-100">
          {filteredNotices.map((notice) => (
            <div
              key={notice.id}
              onClick={() => setSelectedNotice(notice)}
              className="p-6 sm:p-7 hover:bg-blue-50/40 cursor-pointer transition-colors space-y-2 group"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 font-medium">
                {notice.is_pinned && (
                  <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 font-black px-2.5 py-0.5 rounded-lg text-xs">
                    <Pin className="w-3.5 h-3.5" /> 상단 고정
                  </span>
                )}
                <span className="font-bold text-slate-700">{notice.author}</span>
                <span>•</span>
                <span>{new Date(notice.created_at).toLocaleDateString('ko-KR')}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center justify-between">
                <span>{notice.title}</span>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </h3>
              <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                {notice.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 탭 2: 활동 갤러리 그리드 */}
      {activeTab === 'gallery' && (
        <div>
          {filteredGallery.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGallery.map((item) => (
                <div key={item.id} className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                  <div className="h-52 bg-slate-100 relative overflow-hidden">
                    {item.images && item.images.length > 0 ? (
                      <img 
                        src={item.images[0]} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Camera className="w-12 h-12 stroke-1" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 space-y-2">
                    <div className="text-xs font-bold text-blue-600 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {item.event_date}
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg line-clamp-1">{item.title}</h3>
                    {item.content && (
                      <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">{item.content}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 text-slate-400 space-y-2">
              <Camera className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
              <p className="font-bold text-slate-700">등록된 활동 사진이 없습니다.</p>
              <p className="text-sm text-slate-400">관리자 페이지에서 총회 및 행사 사진을 업로드해 보세요.</p>
            </div>
          )}
        </div>
      )}

      {/* 공지 상세 보기 모달 */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-bold text-blue-600">{selectedNotice.author}</span>
                  <span>•</span>
                  <span>{new Date(selectedNotice.created_at).toLocaleDateString('ko-KR')}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 pt-1">
                  {selectedNotice.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="text-slate-700 text-base leading-relaxed whitespace-pre-line bg-slate-50 p-6 rounded-2xl border border-slate-100 font-normal">
              {selectedNotice.content}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedNotice(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
