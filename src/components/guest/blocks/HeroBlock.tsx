// @TASK P2-T2.2, P7-T7.8 - 게스트용 HeroBlock + 이미지 최적화
// @SPEC docs/planning/06-tasks.md#P2-T2.2

'use client';

import React from 'react';
import Image from 'next/image';
import { HeroContent } from '@/types/block';

interface HeroBlockProps {
  content: HeroContent;
}

/**
 * 게스트용 히어로 블록
 * - 전체 너비 배경 이미지
 * - 제목/부제목 중앙 정렬
 * - 오버레이 그라데이션
 */
export function HeroBlock({ content }: HeroBlockProps) {
  const { title, subtitle, backgroundImage, overlayColor, overlayOpacity } = content;

  // 오버레이 스타일
  const overlayStyle = backgroundImage
    ? {
        backgroundColor: overlayColor || '#000000',
        opacity: (overlayOpacity || 40) / 100,
      }
    : undefined;

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
      {/* 배경 이미지 - @TASK P7-T7.8 next/image 사용 */}
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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600" />
      )}

      {/* 오버레이 */}
      {backgroundImage && overlayStyle && (
        <div className="absolute inset-0" style={overlayStyle} aria-hidden="true" />
      )}

      {/* 텍스트 콘텐츠 */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-2xl"
          style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className="text-lg sm:text-xl md:text-2xl text-white/95 max-w-3xl drop-shadow-lg leading-relaxed"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
