// @TASK P1-T1.7 - GalleryPreview 컴포넌트
// @SPEC docs/planning/06-tasks.md#P1-T1.7

'use client';

import { GalleryContent } from '@/types/block';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Image as ImageIcon, Grid3x3, Presentation } from 'lucide-react';

interface GalleryPreviewProps {
  content: GalleryContent;
}

export function GalleryPreview({ content }: GalleryPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            이미지 갤러리
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {content.layout === 'grid' ? (
              <>
                <Grid3x3 className="h-3 w-3" />
                <span>그리드</span>
              </>
            ) : (
              <>
                <Presentation className="h-3 w-3" />
                <span>슬라이더</span>
              </>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {content.images.length > 0 ? (
          <div
            className={
              content.layout === 'grid'
                ? 'grid grid-cols-2 gap-2'
                : 'flex overflow-x-auto gap-2 pb-2'
            }
          >
            {content.images.map((image) => (
              <div
                key={image.id}
                className={`rounded-lg overflow-hidden ${
                  content.layout === 'grid' ? '' : 'flex-shrink-0 w-64'
                }`}
              >
                <div className="aspect-video bg-muted relative">
                  <img
                    src={image.url}
                    alt={image.alt || '이미지'}
                    className="w-full h-full object-cover"
                  />
                </div>
                {(image.alt || image.caption) && (
                  <div className="p-2 bg-muted/50">
                    {image.alt && (
                      <p className="text-xs font-medium">{image.alt}</p>
                    )}
                    {image.caption && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {image.caption}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">아직 추가된 이미지가 없습니다</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
