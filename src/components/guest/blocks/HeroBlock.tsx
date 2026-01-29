// @TASK P8-S2-T1 - AirBnB 스타일 히어로 블록
// @SPEC specs/screens/guest-viewer.yaml

'use client';

import React from 'react';
import Image from 'next/image';
import { HeroContent } from '@/types/block';

interface HeroBlockProps {
  content: HeroContent;
}

/**
 * AirBnB 스타일 히어로 블록
 * - 풀스크린 이미지 + 부드러운 그라데이션 오버레이
 * - 대형 타이포그래피
 * - 스크롤 유도 애니메이션
 */
export function HeroBlock({ content }: HeroBlockProps) {
  const { title, subtitle, backgroundImage, overlayColor, overlayOpacity } = content;

  // AirBnB 스타일 그라데이션 오버레이
  const overlayStyle = backgroundImage
    ? {
        background: `linear-gradient(
          to bottom,
          rgba(0,0,0,0) 0%,
          rgba(0,0,0,0.3) 50%,
          rgba(0,0,0,0.6) 100%
        )`,
      }
    : undefined;

  return (
    <div className="relative w-full h-[85vh] min-h-[600px] overflow-hidden">
      {/* 배경 이미지 */}
      {backgroundImage ? (
        <Image
          src={backgroundImage}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          quality={90}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent" />
      )}

      {/* AirBnB 스타일 그라데이션 오버레이 */}
      {backgroundImage && overlayStyle && (
        <div
          className="absolute inset-0"
          style={overlayStyle}
          aria-hidden="true"
        />
      )}

      {/* 텍스트 콘텐츠 - 하단 정렬 (AirBnB 스타일) */}
      <div className="relative z-10 h-full flex flex-col items-start justify-end px-6 sm:px-8 md:px-12 pb-16 sm:pb-20">
        <div className="max-w-4xl animate-fade-up">
          <h1 className="text-display sm:text-[4rem] md:text-[5rem] font-bold text-white mb-4 leading-tight">
            {title}
          </h1>

          {subtitle && (
            <p className="text-body-lg sm:text-[1.375rem] text-white/95 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}

          {/* 스크롤 유도 (AirBnB 스타일) */}
          <div className="mt-8 flex items-center gap-2 text-white/80 animate-bounce">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
            <span className="text-sm font-medium">스크롤하여 더 보기</span>
          </div>
        </div>
      </div>

      {/* 하단 곡선 (AirBnB 스타일) */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-white rounded-t-3xl" />
    </div>
  );
}
