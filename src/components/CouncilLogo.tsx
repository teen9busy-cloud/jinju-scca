'use client';

import React, { useId } from 'react';

interface CouncilLogoProps {
  size?: number;
  className?: string;
  variant?: 'mark' | 'full';
  showSubtitle?: boolean;
  lightText?: boolean;
}

export default function CouncilLogo({
  size = 40,
  className = '',
  variant = 'mark',
  showSubtitle = true,
  lightText = false,
}: CouncilLogoProps) {
  const id = useId();

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* 공식 심볼 마크 (SVG) */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 drop-shadow-sm select-none"
        aria-label="학교운영위원회 진주지역협의회 공식 로고"
      >
        <defs>
          {/* 베이스 배경 그라데이션 (진주 남강 블루 ~ 로열 인디고) */}
          <linearGradient id={`${id}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>

          {/* 빛나는 진주(Pearl) 방사형 그라데이션 */}
          <radialGradient id={`${id}-pearl`} cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#F8FAFC" />
            <stop offset="75%" stopColor="#E0E7FF" />
            <stop offset="100%" stopColor="#C7D2FE" />
          </radialGradient>

          {/* 성장과 보호의 새싹/날개 그라데이션 (에메랄드 ~ 시안) */}
          <linearGradient id={`${id}-wing-left`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
          <linearGradient id={`${id}-wing-right`} x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#0D9488" />
            <stop offset="100%" stopColor="#2DD4BF" />
          </linearGradient>

          {/* 금빛 배움의 등불 하이라이트 */}
          <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* 1. 배경 스퀘어클 (부드러운 라운딩) */}
        <rect width="64" height="64" rx="16" fill={`url(#${id}-bg)`} />

        {/* 2. 남강의 물결과 빛 (외곽 부드러운 링) */}
        <circle cx="32" cy="32" r="27" stroke="#93C5FD" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />

        {/* 3. 하단 펼쳐진 책 (교육, 학교의 든든한 기초) */}
        <path
          d="M17 48C21.5 45.5 27 45.5 32 47.8C37 45.5 42.5 45.5 47 48"
          stroke="#FFFFFF"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M19 44C23 42 27.5 42 32 44.2C36.5 42 41 42 45 44"
          stroke="#BFDBFE"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* 책의 중심선 */}
        <line x1="32" y1="44.5" x2="32" y2="48" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />

        {/* 4. 좌우 감싸 안는 연대와 돌봄의 날개/새싹 (학부모 · 위원장 협력) */}
        {/* 좌측 날개/잎 */}
        <path
          d="M18 38C16 31 19 22 24 19C24 23 23 30 29 35C24.5 36.5 20.5 37.5 18 38Z"
          fill={`url(#${id}-wing-left)`}
          opacity="0.95"
        />
        {/* 우측 날개/잎 */}
        <path
          d="M46 38C48 31 45 22 40 19C40 23 41 30 35 35C39.5 36.5 43.5 37.5 46 38Z"
          fill={`url(#${id}-wing-right)`}
          opacity="0.95"
        />

        {/* 5. 중심의 찬란한 진주(Pearl) & 소중한 아이들의 미래 */}
        <circle cx="32" cy="27" r="9.5" fill={`url(#${id}-pearl)`} />
        {/* 진주 입체 광택 (하이라이트) */}
        <ellipse cx="29" cy="23.5" rx="3.2" ry="2" fill="#FFFFFF" opacity="0.95" transform="rotate(-25 29 23.5)" />
        <circle cx="34.5" cy="29.5" r="1.2" fill="#FFFFFF" opacity="0.6" />

        {/* 6. 진주 상단의 별빛 (배움의 지혜와 희망) */}
        <path
          d="M32 12.5L33.2 15L35.5 15.3L33.7 16.9L34.2 19.3L32 18L29.8 19.3L30.3 16.9L28.5 15.3L30.8 15L32 12.5Z"
          fill={`url(#${id}-gold)`}
        />
      </svg>

      {/* 텍스트 워드마크 (variant === 'full' 일 때) */}
      {variant === 'full' && (
        <div className="whitespace-nowrap leading-tight">
          <div
            className={`text-lg sm:text-xl font-black tracking-tight ${
              lightText ? 'text-white' : 'text-slate-900 group-hover:text-blue-600 transition-colors'
            }`}
          >
            학교운영위원회 진주지역협의회
          </div>
          {showSubtitle && (
            <div
              className={`text-[11px] font-bold tracking-wide ${
                lightText ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Jinju School Council Chairpersons Association
            </div>
          )}
        </div>
      )}
    </div>
  );
}
