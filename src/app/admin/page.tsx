'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Executive, HistoryItem, AnonymousPost, Notice, OfficialVote, ResourceItem, GalleryItem } from '@/types/database';
import { 
  Lock, 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Calendar, 
  Bell, 
  MessageSquare, 
  ShieldCheck, 
  CheckCircle, 
  LogOut,
  Vote,
  BarChart2,
  FolderDown,
  Camera,
  Upload,
  Share2,
  ExternalLink,
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react';

export default function AdminPage() {
  const supabase = createClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // 탭 상태: executives, vote, community, notices, gallery, resources, history, settings
  const [activeTab, setActiveTab] = useState<'executives' | 'vote' | 'community' | 'notices' | 'gallery' | 'resources' | 'history' | 'settings'>('executives');

  // 데이터 상태
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [posts, setPosts] = useState<AnonymousPost[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [votes, setVotes] = useState<OfficialVote[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [greeting, setGreeting] = useState('');
  const [ogImage, setOgImage] = useState('/og-image.png');

  // 새 갤러리 입력 폼
  const [newGallery, setNewGallery] = useState({
    title: '',
    content: '',
    event_date: new Date().toISOString().slice(0, 10),
    image_url: '',
  });

  // 새 자료실 입력 폼
  const [newResource, setNewResource] = useState({
    category: '회의록',
    title: '',
    content: '',
    file_url: '',
    file_name: '',
  });

  // 새 임원 입력 폼
  const [newExec, setNewExec] = useState({
    year: 2026,
    category: '부회장단',
    role: '유치원 부회장',
    name: '',
    school: '',
    photo_url: '',
    display_order: 10,
  });

  // 새 투표 입력 폼
  const [newVote, setNewVote] = useState({
    category: '전체 운영위원장',
    title: '',
    description: '',
    is_secret: false,
    options: ['찬성 (원안 가결)', '반대 (원안 부결)', '기권'],
  });

  // 새 공지 입력 폼
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    author: '진주학운위협의회',
    is_pinned: false,
  });

  // 새 연혁 입력 폼
  const [newHistory, setNewHistory] = useState({
    year: 2026,
    month: 5,
    title: '',
    description: '',
  });

  // 로그인 핸들러
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'Wlswntl1234!') {
      setIsAuthenticated(true);
      setLoginError('');
      loadAllData();
    } else {
      setLoginError('관리자 비밀번호가 일치하지 않습니다.');
    }
  };

  // 데이터 불러오기
  const loadAllData = async () => {
    // 1. 임원진
    const { data: execData } = await supabase
      .from('executives')
      .select('*')
      .order('display_order', { ascending: true });
    if (execData) setExecutives(execData);

    // 2. 투표 목록
    const { data: voteData } = await supabase
      .from('official_votes')
      .select('*')
      .order('created_at', { ascending: false });
    if (voteData) setVotes(voteData);

    // 3. 연혁
    const { data: histData } = await supabase
      .from('history')
      .select('*')
      .order('year', { ascending: false });
    if (histData) setHistoryList(histData);

    // 4. 공지사항
    const { data: notData } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false });
    if (notData) setNotices(notData);

    // 5. 익명게시판
    const { data: postData } = await supabase
      .from('anonymous_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (postData) setPosts(postData);

    // 6. 자료실
    const { data: resData } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });
    if (resData) setResources(resData);

    // 7. 활동 갤러리
    const { data: galData } = await supabase
      .from('gallery')
      .select('*')
      .order('event_date', { ascending: false });
    if (galData) setGallery(galData);

    // 8. 사이트 설정 (인사말 & 공유 썸네일)
    const { data: setData } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', 'greeting')
      .maybeSingle();
    if (setData) setGreeting(setData.value);

    const { data: ogData } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', 'og_image')
      .maybeSingle();
    if (ogData?.value) setOgImage(ogData.value);
  };

  // 갤러리 사진 등록 핸들러
  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGallery.title.trim()) {
      alert('활동 사진 제목을 입력해 주세요.');
      return;
    }

    const { error } = await supabase.from('gallery').insert([
      {
        title: newGallery.title.trim(),
        content: newGallery.content.trim() || null,
        event_date: newGallery.event_date,
        images: newGallery.image_url ? [newGallery.image_url.trim()] : [],
      },
    ]);

    if (!error) {
      alert('활동 사진이 성공적으로 등록되었습니다.');
      setNewGallery({
        title: '',
        content: '',
        event_date: new Date().toISOString().slice(0, 10),
        image_url: '',
      });
      loadAllData();
    } else {
      alert('등록 실패: ' + error.message);
    }
  };

  // 갤러리 삭제 핸들러
  const handleDeleteGallery = async (id: number) => {
    if (!confirm('이 활동 사진을 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('gallery').delete().eq('id', id);
    if (!error) loadAllData();
  };

  // 자료실 등록 핸들러
  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResource.title.trim()) {
      alert('자료 제목을 입력해 주세요.');
      return;
    }

    const { error } = await supabase.from('resources').insert([newResource]);
    if (!error) {
      alert('자료가 성공적으로 등록되었습니다.');
      setNewResource({
        category: '회의록',
        title: '',
        content: '',
        file_url: '',
        file_name: '',
      });
      loadAllData();
    } else {
      alert('자료 등록 실패: ' + error.message);
    }
  };

  // 자료실 삭제 핸들러
  const handleDeleteResource = async (id: number) => {
    if (!confirm('이 자료를 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('resources').delete().eq('id', id);
    if (!error) loadAllData();
  };

  // 새 투표 등록 핸들러
  const handleAddVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVote.title.trim()) {
      alert('투표 제목을 입력해 주세요.');
      return;
    }

    // 1. 투표 마스터 등록
    const { data: voteInserted, error: voteErr } = await supabase
      .from('official_votes')
      .insert([
        {
          category: newVote.category,
          title: newVote.title.trim(),
          description: newVote.description.trim() || null,
          is_secret: newVote.is_secret,
          status: 'active',
        },
      ])
      .select()
      .single();

    if (voteErr || !voteInserted) {
      alert('투표 등록 실패: ' + voteErr?.message);
      return;
    }

    // 2. 선택지 등록
    const optionsToInsert = newVote.options
      .filter((opt) => opt.trim().length > 0)
      .map((opt) => ({
        vote_id: voteInserted.id,
        option_text: opt.trim(),
        vote_count: 0,
      }));

    if (optionsToInsert.length > 0) {
      await supabase.from('official_vote_options').insert(optionsToInsert);
    }

    alert('새 투표 및 설문 안건이 성공적으로 등록되었습니다.');
    setNewVote({
      category: '전체 운영위원장',
      title: '',
      description: '',
      is_secret: false,
      options: ['찬성 (원안 가결)', '반대 (원안 부결)', '기권'],
    });
    loadAllData();
  };

  // 투표 마감/재개 토글
  const handleToggleVoteStatus = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'closed' : 'active';
    const { error } = await supabase
      .from('official_votes')
      .update({ status: nextStatus, closed_at: nextStatus === 'closed' ? new Date().toISOString() : null })
      .eq('id', id);

    if (!error) loadAllData();
  };

  // 투표 삭제
  const handleDeleteVote = async (id: number) => {
    if (!confirm('이 투표 안건과 관련된 모든 투표 결과를 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('official_votes').delete().eq('id', id);
    if (!error) loadAllData();
  };

  // 임원 추가
  const handleAddExec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExec.name || !newExec.school) {
      alert('이름과 소속 학교를 입력해 주세요.');
      return;
    }

    const { error } = await supabase.from('executives').insert([newExec]);
    if (!error) {
      alert('임원이 성공적으로 등록되었습니다.');
      setNewExec({
        year: 2026,
        category: '부회장단',
        role: '초등학교 부회장',
        name: '',
        school: '',
        photo_url: '',
        display_order: 10,
      });
      loadAllData();
    }
  };

  // 임원 삭제
  const handleDeleteExec = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('executives').delete().eq('id', id);
    if (!error) loadAllData();
  };

  // 공지사항 등록
  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.content) {
      alert('제목과 내용을 입력해 주세요.');
      return;
    }
    const { error } = await supabase.from('notices').insert([newNotice]);
    if (!error) {
      alert('공지사항이 등록되었습니다.');
      setNewNotice({ title: '', content: '', author: '진주학운위협의회', is_pinned: false });
      loadAllData();
    }
  };

  // 공지사항 삭제
  const handleDeleteNotice = async (id: number) => {
    if (!confirm('공지사항을 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('notices').delete().eq('id', id);
    if (!error) loadAllData();
  };

  // 연혁 추가
  const handleAddHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHistory.title) return;
    const { error } = await supabase.from('history').insert([newHistory]);
    if (!error) {
      alert('연혁이 추가되었습니다.');
      setNewHistory({ year: 2026, month: 5, title: '', description: '' });
      loadAllData();
    }
  };

  // 연혁 삭제
  const handleDeleteHistory = async (id: number) => {
    if (!confirm('연혁 항목을 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('history').delete().eq('id', id);
    if (!error) loadAllData();
  };

  // 익명글 원클릭 삭제/복원 토글
  const handleTogglePostDelete = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('anonymous_posts')
      .update({ is_deleted: !currentStatus })
      .eq('id', id);
    if (!error) loadAllData();
  };

  // 인사말 저장
  const handleSaveGreeting = async () => {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'greeting', value: greeting, updated_at: new Date().toISOString() });
    if (!error) {
      alert('회장 인사말이 저장되었습니다.');
    }
  };

  // 카카오톡/SNS 공유 썸네일(OG 이미지) 저장
  const handleSaveOgImage = async (customUrl?: string) => {
    const targetUrl = customUrl !== undefined ? customUrl : ogImage.trim();
    if (!targetUrl) {
      alert('썸네일 이미지 주소를 입력해 주세요.');
      return;
    }
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'og_image', value: targetUrl, updated_at: new Date().toISOString() });
    if (!error) {
      setOgImage(targetUrl);
      alert('카카오톡 / SNS 공유 썸네일 설정이 저장되었습니다!\n\n※ 이미 카톡에 공유된 적이 있는 경우 아래 [카카오 공유 디버거]에서 캐시를 초기화하시면 즉시 새 이미지로 변경됩니다.');
    } else {
      alert('저장 중 오류: ' + error.message);
    }
  };

  // 기본 공식 썸네일로 초기화
  const handleResetOgImage = async () => {
    if (confirm('공식 기본 협의회 썸네일(/og-image.png)로 초기화하시겠습니까?')) {
      await handleSaveOgImage('/og-image.png');
    }
  };

  // 로그인 화면
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 max-w-md w-full shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">협의회 관리자 로그인</h1>
            <p className="text-xs text-slate-500 mt-1">
              임원진, 전자투표 및 홈페이지 내용을 관리할 수 있는 관리자 모드입니다.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="관리자 비밀번호 입력"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all"
            >
              관리자 모드 입장
            </button>
          </form>

          <div className="text-xs text-slate-400">
            ※ 비밀번호: Wlswntl1234!
          </div>
        </div>
      </div>
    );
  }

  // 관리자 대시보드 메인
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 관리자 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 text-white p-6 rounded-3xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
            <ShieldCheck className="w-4 h-4" /> 진주시 학교운영위원회 협의회 CMS
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1">협의회 통합 관리자 모드</h1>
        </div>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <LogOut className="w-4 h-4" /> 로그아웃
        </button>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('executives')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'executives' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          👥 2026 임원진 ({executives.length}명)
        </button>
        <button
          onClick={() => setActiveTab('vote')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'vote' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          🗳️ 전자투표 & 설문 관리 ({votes.length}건)
        </button>
        <button
          onClick={() => setActiveTab('community')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'community' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          💬 익명 게시판 ({posts.length}건)
        </button>
        <button
          onClick={() => setActiveTab('notices')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'notices' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          📢 공지사항 ({notices.length}건)
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'gallery' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          📸 활동 갤러리 ({gallery.length}건)
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'resources' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          📁 자료실 관리 ({resources.length}건)
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'history' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          📅 연혁 관리 ({historyList.length}건)
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'settings' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          ⚙️ 사이트 설정 (인사말 / 공유 썸네일)
        </button>
      </div>

      {/* 탭: 전자투표 & 설문 관리 */}
      {activeTab === 'vote' && (
        <div className="space-y-6">
          {/* 새 투표 등록 카드 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Vote className="w-5 h-5 text-indigo-600" /> 새 투표 / 여론조사 안건 등록
            </h3>
            <form onSubmit={handleAddVote} className="space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">말머리 (대상 구분) *</label>
                  <select
                    value={newVote.category}
                    onChange={(e) => setNewVote({ ...newVote, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-indigo-700"
                  >
                    <option value="전체 운영위원장">[전체 운영위원장] 진주시 전체 학교</option>
                    <option value="협의회 임원단">[협의회 임원단] 2026 임원 17인 의결</option>
                    <option value="운영위원 조사">[운영위원 조사] 각 학교 운영위원</option>
                    <option value="진주 학부모 설문">[진주 학부모 설문] 진주시 전체 학부모</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-500 mb-1">투표 안건 제목 *</label>
                  <input
                    type="text"
                    placeholder="예: 2026년도 학교운영위원회 진주지역협의회 정관 개정안 의결"
                    value={newVote.title}
                    onChange={(e) => setNewVote({ ...newVote, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">안건 상세 설명</label>
                <textarea
                  placeholder="의결 안건 또는 여론조사의 취지와 배경을 설명해 주세요."
                  value={newVote.description}
                  onChange={(e) => setNewVote({ ...newVote, description: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">투표 선택지 (쉼표나 줄바꿈으로 구분)</label>
                <input
                  type="text"
                  placeholder="예: 찬성 (원안 가결), 반대 (원안 부결), 기권"
                  value={newVote.options.join(', ')}
                  onChange={(e) => setNewVote({ ...newVote, options: e.target.value.split(',').map((s) => s.trim()) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newVote.is_secret}
                    onChange={(e) => setNewVote({ ...newVote, is_secret: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  무기명 비밀투표로 진행 (체크 해제 시 찬반 투표자 명단 공개)
                </label>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all"
                >
                  투표 안건 공고하기
                </button>
              </div>
            </form>
          </div>

          {/* 등록된 투표 목록 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">진행 중 및 마감된 투표 목록</h3>
            <div className="divide-y divide-slate-100">
              {votes.map((v) => (
                <div key={v.id} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs mb-1">
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                        {v.category || '전체'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md font-bold ${
                        v.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {v.status === 'active' ? '진행중' : '마감됨'}
                      </span>
                      <span className="text-slate-400">
                        {new Date(v.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{v.title}</h4>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleToggleVoteStatus(v.id, v.status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        v.status === 'active'
                          ? 'bg-amber-500 hover:bg-amber-600 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {v.status === 'active' ? '투표 마감하기' : '다시 진행하기'}
                    </button>
                    <button
                      onClick={() => handleDeleteVote(v.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      title="투표 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 탭 1: 임원진 관리 */}
      {activeTab === 'executives' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" /> 새 임원 추가 (유·초·중·고·특수학교 부회장 등)
            </h3>
            <form onSubmit={handleAddExec} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <label className="block text-xs text-slate-500 mb-1">카테고리</label>
                <select
                  value={newExec.category}
                  onChange={(e) => setNewExec({ ...newExec, category: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                >
                  <option value="회장">회장</option>
                  <option value="부회장단">부회장단</option>
                  <option value="감사">감사</option>
                  <option value="사무국">사무국</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">직책</label>
                <input
                  type="text"
                  placeholder="예: 유치원 부회장 / 초등학교 부회장"
                  value={newExec.role}
                  onChange={(e) => setNewExec({ ...newExec, role: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">성명</label>
                <input
                  type="text"
                  placeholder="위원장 성명"
                  value={newExec.name}
                  onChange={(e) => setNewExec({ ...newExec, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">소속 학교 / 유치원</label>
                <input
                  type="text"
                  placeholder="예: 으뜸유치원"
                  value={newExec.school}
                  onChange={(e) => setNewExec({ ...newExec, school: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">연도</label>
                <input
                  type="number"
                  value={newExec.year}
                  onChange={(e) => setNewExec({ ...newExec, year: parseInt(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
                >
                  임원 등록하기
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-4">현재 등록된 2026 임원진 목록</h3>
            <div className="divide-y divide-slate-100">
              {executives.map((exec) => (
                <div key={exec.id} className="py-3 flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700">
                      {exec.role}
                    </span>
                    <span className="font-bold text-slate-900">{exec.name}</span>
                    <span className="text-slate-500 text-xs">({exec.school})</span>
                  </div>
                  <button
                    onClick={() => handleDeleteExec(exec.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 탭: 익명 게시판 모니터링 */}
      {activeTab === 'community' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">학부모 소통방 글 관리</h3>
            <p className="text-xs text-slate-500 mt-1">
              비방, 광고, 허위사실 게시글은 [즉시 블라인드] 버튼을 눌러 사이트에서 숨길 수 있습니다.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {posts.map((post) => (
              <div key={post.id} className="py-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-bold text-slate-700">{post.author_name}</span>
                    {post.school_name && <span>({post.school_name})</span>}
                    <span>•</span>
                    <span>{new Date(post.created_at).toLocaleString('ko-KR')}</span>
                    {post.is_deleted && (
                      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">
                        [삭제(블라인드) 처리됨]
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleTogglePostDelete(post.id, post.is_deleted)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      post.is_deleted
                        ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                        : 'bg-red-600 text-white hover:bg-red-500'
                    }`}
                  >
                    {post.is_deleted ? '복원하기' : '원클릭 삭제(숨김)'}
                  </button>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{post.title}</h4>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {post.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 탭: 공지사항 관리 */}
      {activeTab === 'notices' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" /> 새 공지사항 등록
            </h3>
            <form onSubmit={handleAddNotice} className="space-y-3 text-sm">
              <input
                type="text"
                placeholder="공지사항 제목"
                value={newNotice.title}
                onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
                required
              />
              <textarea
                placeholder="공지사항 본문 내용"
                value={newNotice.content}
                onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                rows={5}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                required
              ></textarea>
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newNotice.is_pinned}
                    onChange={(e) => setNewNotice({ ...newNotice, is_pinned: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  상단 중요 공지 고정
                </label>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 shadow-md"
                >
                  공지 등록하기
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-4">등록된 공지사항</h3>
            <div className="divide-y divide-slate-100">
              {notices.map((n) => (
                <div key={n.id} className="py-3 flex justify-between items-center text-sm">
                  <div>
                    <h4 className="font-bold text-slate-900">{n.title}</h4>
                    <span className="text-xs text-slate-400">{new Date(n.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteNotice(n.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 탭: 활동 갤러리 관리 */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" /> 새 활동 사진 앨범 등록
            </h3>
            <form onSubmit={handleAddGallery} className="space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-500 mb-1">행사/활동 제목 *</label>
                  <input
                    type="text"
                    placeholder="예: 2026년도 학교운영위원회 진주지역협의회 정기총회 개최"
                    value={newGallery.title}
                    onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">행사 일자 *</label>
                  <input
                    type="date"
                    value={newGallery.event_date}
                    onChange={(e) => setNewGallery({ ...newGallery, event_date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">사진 이미지 웹 주소 (URL)</label>
                <input
                  type="text"
                  placeholder="예: https://... 또는 수파베이스/웹 이미지 주소"
                  value={newGallery.image_url}
                  onChange={(e) => setNewGallery({ ...newGallery, image_url: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">활동 설명 및 소감 (선택)</label>
                <textarea
                  placeholder="행사에 대한 간단한 소개 글을 적어주세요."
                  value={newGallery.content}
                  onChange={(e) => setNewGallery({ ...newGallery, content: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                ></textarea>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" /> 활동 사진 등록하기
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">등록된 활동 갤러리 목록</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {gallery.map((g) => (
                <div key={g.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2 relative group">
                  <div className="h-32 bg-slate-200 rounded-xl overflow-hidden relative">
                    {g.images && g.images.length > 0 ? (
                      <img src={g.images[0]} alt={g.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Camera className="w-8 h-8 stroke-1" />
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-blue-600 font-bold">{g.event_date}</div>
                  <h4 className="font-bold text-slate-900 text-sm truncate">{g.title}</h4>
                  <button
                    onClick={() => handleDeleteGallery(g.id)}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-90 hover:opacity-100 shadow-sm"
                    title="삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 탭: 자료실 관리 */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FolderDown className="w-5 h-5 text-blue-600" /> 새 자료 / 회의록 등록
            </h3>
            <form onSubmit={handleAddResource} className="space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">구분 *</label>
                  <select
                    value={newResource.category}
                    onChange={(e) => setNewResource({ ...newResource, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-blue-700"
                  >
                    <option value="회의록">회의록</option>
                    <option value="실무자료">실무자료</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-500 mb-1">자료 제목 *</label>
                  <input
                    type="text"
                    placeholder="예: 2026년도 제1차 정기총회 회의록 및 안건지"
                    value={newResource.title}
                    onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">상세 내용 및 설명</label>
                <textarea
                  placeholder="자료에 대한 주요 내용 요약"
                  value={newResource.content}
                  onChange={(e) => setNewResource({ ...newResource, content: e.target.value })}
                  rows={4}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">첨부파일 다운로드 링크 (URL)</label>
                  <input
                    type="text"
                    placeholder="예: https://... 또는 구글드라이브 공유링크"
                    value={newResource.file_url}
                    onChange={(e) => setNewResource({ ...newResource, file_url: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">표시할 파일명</label>
                  <input
                    type="text"
                    placeholder="예: 2026_정기총회_회의록.pdf"
                    value={newResource.file_name}
                    onChange={(e) => setNewResource({ ...newResource, file_name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 shadow-md transition-all"
                >
                  자료 등록하기
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-4">등록된 자료 및 회의록 목록</h3>
            <div className="divide-y divide-slate-100">
              {resources.map((r) => (
                <div key={r.id} className="py-3 flex justify-between items-center text-sm">
                  <div>
                    <span className="font-bold text-blue-600 text-xs bg-blue-50 px-2 py-0.5 rounded mr-2">
                      {r.category}
                    </span>
                    <span className="font-bold text-slate-900">{r.title}</span>
                    <span className="text-xs text-slate-400 ml-2">
                      {new Date(r.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteResource(r.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 탭: 연혁 관리 */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" /> 연혁 추가
            </h3>
            <form onSubmit={handleAddHistory} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-sm">
              <input
                type="number"
                placeholder="연도(예: 2026)"
                value={newHistory.year}
                onChange={(e) => setNewHistory({ ...newHistory, year: parseInt(e.target.value) })}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                required
              />
              <input
                type="number"
                placeholder="월(예: 4)"
                value={newHistory.month}
                onChange={(e) => setNewHistory({ ...newHistory, month: parseInt(e.target.value) })}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
              />
              <input
                type="text"
                placeholder="주요 내용 (예: 정기총회 개최)"
                value={newHistory.title}
                onChange={(e) => setNewHistory({ ...newHistory, title: e.target.value })}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:col-span-2"
                required
              />
              <div className="sm:col-span-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 shadow-md"
                >
                  연혁 등록하기
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-4">현재 등록된 연혁 목록</h3>
            <div className="divide-y divide-slate-100">
              {historyList.map((h) => (
                <div key={h.id} className="py-3 flex justify-between items-center text-sm">
                  <div>
                    <span className="font-bold text-blue-600 mr-2">{h.year}년 {h.month ? `${h.month}월` : ''}</span>
                    <span className="font-semibold text-slate-900">{h.title}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteHistory(h.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 탭: 사이트 설정 (인사말 & 공유 썸네일) */}
      {activeTab === 'settings' && (
        <div className="space-y-8">
          {/* 섹션 1: 카카오톡 / SNS 공유 썸네일(OG 이미지) 관리 */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-blue-600" /> 카카오톡 / SNS 링크 공유 썸네일 (OG 이미지) 관리
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  카카오톡, 문자, 밴드, 페이스북 등에 홈페이지 링크를 전송했을 때 노출되는 대표 카드 이미지를 설정합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetOgImage}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap self-start sm:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> 공식 기본 이미지로 초기화
              </button>
            </div>

            {/* 현재 적용 썸네일 미리보기 (카카오톡 말풍선 스타일 카드) */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-slate-400" /> 카카오톡 전송 시 실제 표시되는 미리보기
              </span>
              <div className="max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="w-full aspect-[1.91/1] bg-slate-900 relative overflow-hidden flex items-center justify-center">
                  <img
                    src={ogImage || '/og-image.png'}
                    alt="공유 썸네일 미리보기"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/og-image.png';
                    }}
                  />
                </div>
                <div className="p-4 space-y-1">
                  <div className="text-xs font-semibold text-slate-400">jinju-scca.vercel.app</div>
                  <div className="font-black text-slate-900 text-sm line-clamp-1">
                    학교운영위원회 진주지역협의회
                  </div>
                  <div className="text-xs text-slate-500 line-clamp-2">
                    진주시 관내 유치원·초·중·고·특수학교 학교운영위원장 협조 및 학부모 소통 기구
                  </div>
                </div>
              </div>
            </div>

            {/* 이미지 URL 입력 및 저장 */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                썸네일 이미지 주소 (URL 또는 상대경로)
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  placeholder="예: /og-image.png 또는 직접 업로드하신 이미지 웹 주소(https://...)"
                  className="flex-1 p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleSaveOgImage()}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <Save className="w-4 h-4" /> 썸네일 저장
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                * 기본값인 <code className="text-blue-600 font-bold">/og-image.png</code>를 사용하시면 협의회 공식 엠블럼 심볼과 슬로건이 포함된 고해상도(1200×630) 공식 카드가 적용됩니다.
              </p>
            </div>

            {/* 카카오 캐시 초기화 바로가기 배너 */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                💡 카카오톡에 이미 한 번 공유된 링크의 사진이 바뀌지 않을 때 (캐시 초기화 안내)
              </div>
              <p className="leading-relaxed">
                카카오톡은 서버 부하를 줄이기 위해 한 번 공유된 링크의 썸네일을 며칠간 저장해 둡니다. 이미 회장님 사진으로 전송된 적이 있다면, 카카오 공식 디버거에서 홈페이지 주소를 넣고 <strong>[캐시 초기화]</strong> 버튼을 누르시면 즉시 새 썸네일로 갱신됩니다.
              </p>
              <div className="pt-1">
                <a
                  href="https://developers.kakao.com/tool/debugger/sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> 카카오 공유 디버거 (캐시 초기화 바로가기) ↗
                </a>
              </div>
            </div>
          </div>

          {/* 섹션 2: 회장 인사말 편집 */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2 pb-4 border-b border-slate-100">
              <Edit3 className="w-5 h-5 text-blue-600" /> 회장 인사말 편집
            </h3>
            <p className="text-xs text-slate-500">
              인사말 문구를 수정하시면 홈페이지 소개(/about) 화면에 줄바꿈과 함께 즉시 반영됩니다.
            </p>
            <textarea
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              rows={10}
              className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm leading-relaxed"
            ></textarea>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveGreeting}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" /> 인사말 저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
