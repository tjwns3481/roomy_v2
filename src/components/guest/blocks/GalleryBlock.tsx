// @TASK P2-T2.2, P7-T7.8 - 게스트용 GalleryBlock + 이미지 최적화
// @SPEC docs/planning/06-tasks.md#P2-T2.2

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { GalleryContent } from '@/types/block';
import { Card, CardContent } from '@/components/ui/card';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GalleryBlockProps {
  content: GalleryContent;
}

/**
 * 게스트용 갤러리 블록
 * - 그리드/슬라이더 레이아웃
 * - 라이트박스 기능
 */
export function GalleryBlock({ content }: GalleryBlockProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const goToPrevious = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  const goToNext = () => {
    if (lightboxIndex !== null && lightboxIndex < content.images.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  // 키보드 이벤트 핸들러
  React.useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex]);

  if (content.images.length === 0) {
    return (
      <div className="px-4 py-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">등록된 이미지가 없습니다</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 py-6">
        {/* 그리드 레이아웃 */}
        {content.layout === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {content.images.map((image, index) => (
              <div
                key={image.id}
                className="rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity group"
                onClick={() => openLightbox(index)}
              >
                <div className="aspect-square bg-muted relative">
                  <Image
                    src={image.url}
                    alt={image.alt || `이미지 ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {(image.alt || image.caption) && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-white text-sm font-medium line-clamp-1">
                        {image.alt || image.caption}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 슬라이더 레이아웃 */}
        {content.layout === 'slider' && (
          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-3 pb-2">
                {content.images.map((image, index) => (
                  <div
                    key={image.id}
                    className="flex-shrink-0 w-80 sm:w-96 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openLightbox(index)}
                  >
                    <div className="aspect-video bg-muted relative">
                      <Image
                        src={image.url}
                        alt={image.alt || `이미지 ${index + 1}`}
                        fill
                        sizes="384px"
                        className="object-cover"
                      />
                    </div>
                    {(image.alt || image.caption) && (
                      <div className="bg-muted/80 p-3">
                        {image.alt && (
                          <p className="text-sm font-medium">{image.alt}</p>
                        )}
                        {image.caption && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {image.caption}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 라이트박스 */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* 닫기 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={closeLightbox}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* 이전 버튼 */}
          {lightboxIndex > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {/* 이미지 */}
          <div className="max-w-7xl max-h-[90vh] px-16" onClick={(e) => e.stopPropagation()}>
            <img
              src={content.images[lightboxIndex].url}
              alt={content.images[lightboxIndex].alt || `이미지 ${lightboxIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain"
            />
            {(content.images[lightboxIndex].alt || content.images[lightboxIndex].caption) && (
              <div className="mt-4 text-center text-white">
                {content.images[lightboxIndex].alt && (
                  <p className="text-lg font-medium">{content.images[lightboxIndex].alt}</p>
                )}
                {content.images[lightboxIndex].caption && (
                  <p className="text-sm text-white/70 mt-1">
                    {content.images[lightboxIndex].caption}
                  </p>
                )}
              </div>
            )}
            <p className="text-center text-white/50 text-sm mt-2">
              {lightboxIndex + 1} / {content.images.length}
            </p>
          </div>

          {/* 다음 버튼 */}
          {lightboxIndex < content.images.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}
        </div>
      )}
    </>
  );
}
