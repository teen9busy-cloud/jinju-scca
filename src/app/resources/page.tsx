'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ResourceItem } from '@/types/database';
import { FolderDown, FileText, Download, Search, Paperclip, ChevronRight, X, Calendar, User } from 'lucide-react';

export default function ResourcesPage() {
  const supabase = createClient();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedItem, setSelectedItem] = useState<ResourceItem | null>(null);

  // 자료실 목록 불러오기
  const fetchResources = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setResources(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const categories = ['전체', '회의록', '실무자료', '기타'];

  const filteredResources = resources.filter((item) => {
    const matchCat = selectedCategory === '전체' || item.category === selectedCategory;
    const matchSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.content && item.content.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* 타이틀 */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-sm font-bold">
          <FolderDown className="w-4 h-4 text-blue-600" /> 협의회 자료실
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          자료실 및 회의록
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
          학교운영위원회 진주지역협의회의 정기총회 회의록, 운영위원회 실무 서식 및 공유 자료를 확인하실 수 있습니다.
        </p>
      </div>

      {/* 검색 및 카테고리 필터 바 */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
        {/* 카테고리 탭 */}
        <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 검색창 */}
        <div className="relative w-full sm:w-80">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3" />
          <input
            type="text"
            placeholder="자료명, 회의록 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* 자료실 정통 게시판 테이블 */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        {/* 테이블 헤더 */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="col-span-1 text-center">번호</div>
          <div className="col-span-2 text-center">구분</div>
          <div className="col-span-6">제목</div>
          <div className="col-span-2 text-center">등록일</div>
          <div className="col-span-1 text-center">첨부</div>
        </div>

        {/* 목록 */}
        {loading ? (
          <div className="text-center py-24 text-slate-400 text-base">
            자료 목록을 불러오는 중입니다...
          </div>
        ) : filteredResources.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredResources.map((item, index) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4.5 items-center hover:bg-blue-50/50 cursor-pointer transition-colors group"
              >
                {/* 번호 */}
                <div className="hidden sm:block col-span-1 text-center text-xs font-medium text-slate-400">
                  {filteredResources.length - index}
                </div>

                {/* 구분 배지 */}
                <div className="col-span-2 flex sm:justify-center">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    item.category === '회의록'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {item.category || '일반자료'}
                  </span>
                </div>

                {/* 제목 */}
                <div className="col-span-6 font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-base flex items-center gap-2">
                  <span className="truncate">{item.title}</span>
                </div>

                {/* 등록일 */}
                <div className="col-span-2 text-left sm:text-center text-xs text-slate-400">
                  {new Date(item.created_at).toLocaleDateString('ko-KR')}
                </div>

                {/* 첨부파일 아이콘 */}
                <div className="col-span-1 flex sm:justify-center">
                  {item.file_url ? (
                    <span className="p-1 rounded-md bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors" title="첨부파일 있음">
                      <Paperclip className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="text-slate-300 text-xs">-</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-slate-400 text-base space-y-2">
            <FileText className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
            <p className="font-bold text-slate-700">등록된 자료나 회의록이 없습니다.</p>
            <p className="text-sm text-slate-400">관리자 모드에서 첫 번째 회의록 및 자료를 등록해 보세요.</p>
          </div>
        )}
      </div>

      {/* 자료 상세 모달 */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* 상단 닫기 및 구분 */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700">
                  {selectedItem.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 pt-1">
                  {selectedItem.title}
                </h3>
                <div className="text-xs text-slate-400 flex items-center gap-3 pt-1">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(selectedItem.created_at).toLocaleDateString('ko-KR')}</span>
                  <span>•</span>
                  <span>학교운영위원회 진주지역협의회</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 본문 내용 */}
            <div className="text-slate-700 text-base leading-relaxed whitespace-pre-line bg-slate-50 p-6 rounded-2xl border border-slate-100 min-h-[140px]">
              {selectedItem.content || '본문 설명이 등록되지 않은 자료입니다.'}
            </div>

            {/* 첨부파일 다운로드 */}
            {selectedItem.file_url ? (
              <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 truncate">
                  <div className="p-2.5 rounded-xl bg-blue-600 text-white">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <div className="text-sm font-bold text-slate-900 truncate">
                      {selectedItem.file_name || '첨부 문서 다운로드'}
                    </div>
                    <div className="text-xs text-blue-600">클릭하여 파일 다운로드</div>
                  </div>
                </div>
                <a
                  href={selectedItem.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md flex items-center gap-1.5 transition-all flex-shrink-0"
                >
                  <Download className="w-4 h-4" /> 받기
                </a>
              </div>
            ) : (
              <div className="text-xs text-slate-400 text-center py-2">
                첨부파일이 없는 안내 문서입니다.
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
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
