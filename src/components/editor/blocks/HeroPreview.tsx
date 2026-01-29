// @TASK P1-T1.3 - HeroBlock 프리뷰
// @SPEC docs/planning/06-tasks.md#P1-T1.3

'use client';

import React from 'react';
import { HeroContent } from '@/types/block';

interface HeroPreviewProps {
  content: HeroContent;
}

export function HeroPreview({ content }: HeroPreviewProps) {
  const { title, subtitle, backgroundImage, overlayColor, overlayOpacity } = content;

  // 오버레이 스타일 계산
  const overlayStyle = backgroundImage
    ? {
        backgroundColor: overlayColor || '#000000',
        opacity: (overlayOpacity || 0) / 100,
      }
    : undefined;

  return (
    <div className="relative w-full h-[60vh] min-h-[400px] overflow-hidden rounded-xl bg-surface">
      {/* 배경 이미지 */}
      {backgroundImage ? (
        <img
          src={backgroundImage}
          alt="히어로 배경"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
          <p className="text-text-secondary text-caption">배경 이미지를 업로드하세요</p>
        </div>
      )}

      {/* 오버레이 */}
      {backgroundImage && overlayStyle && (
        <div className="absolute inset-0" style={overlayStyle} aria-hidden="true" />
      )}

      {/* 텍스트 콘텐츠 */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        {title ? (
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
          >
            {title}
          </h1>
        ) : (
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-secondary/50 mb-4"
          >
            숙소명을 입력하세요
          </h1>
        )}

        {subtitle && (
          <p
            className="text-lg sm:text-xl text-white/90 max-w-2xl drop-shadow-md"
            style={{ textShadow: '0 1px 5px rgba(0,0,0,0.3)' }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
