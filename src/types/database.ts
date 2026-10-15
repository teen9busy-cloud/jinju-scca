export interface Executive {
  id: number;
  year: number;
  category: '회장' | '부회장단' | '감사' | '사무국';
  role: string;
  name: string;
  school: string;
  photo_url?: string;
  display_order: number;
  created_at: string;
}

export interface HistoryItem {
  id: number;
  year: number;
  month?: number;
  title: string;
  description?: string;
  display_order: number;
  created_at: string;
}

export interface Notice {
  id: number;
  title: string;
  content: string;
  author: string;
  is_pinned: boolean;
  view_count: number;
  created_at: string;
}

export interface GalleryItem {
  id: number;
  title: string;
  content?: string;
  event_date: string;
  images: string[];
  created_at: string;
}

export interface ResourceItem {
  id: number;
  category: '실무자료' | '회의록' | '조례법령';
  title: string;
  content?: string;
  file_url?: string;
  file_name?: string;
  created_at: string;
}

export interface AnonymousPost {
  id: number;
  author_name: string;
  school_name?: string;
  password_hash: string;
  title: string;
  content: string;
  view_count: number;
  is_deleted: boolean;
  created_at: string;
  comments_count?: number;
}

// 전자투표 & 설문조사 타입
export interface OfficialVote {
  id: number;
  category: '협의회 임원단' | '전체 운영위원장' | '운영위원 조사' | '진주 학부모 설문';
  title: string;
  description?: string;
  is_secret: boolean; // 무기명 여부
  status: 'active' | 'closed'; // 진행중 or 마감
  created_at: string;
  closed_at?: string;
  options?: OfficialVoteOption[];
  total_votes?: number;
}

export interface OfficialVoteOption {
  id: number;
  vote_id: number;
  option_text: string;
  vote_count: number;
}

export interface OfficialVoteBallot {
  id: number;
  vote_id: number;
  member_name: string;
  school_name: string;
  role_type: '협의회 임원' | '학교운영위원장' | '학교운영위원' | '학부모';
  option_id: number;
  comment?: string;
  created_at: string;
}
