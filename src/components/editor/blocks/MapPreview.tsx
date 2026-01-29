// @TASK P1-T1.7 - MapPreview 컴포넌트
// @SPEC docs/planning/06-tasks.md#P1-T1.7

'use client';

import { MapContent } from '@/types/block';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map, MapPin } from 'lucide-react';

interface MapPreviewProps {
  content: MapContent;
}

const CATEGORY_COLORS: Record<MapContent['markers'][0]['category'], string> = {
  accommodation: 'bg-blue-500',
  restaurant: 'bg-orange-500',
  convenience: 'bg-green-500',
  attraction: 'bg-purple-500',
  transport: 'bg-gray-500',
};

const CATEGORY_LABELS: Record<MapContent['markers'][0]['category'], string> = {
  accommodation: '숙소',
  restaurant: '음식점',
  convenience: '편의점',
  attraction: '관광지',
  transport: '교통',
};

export function MapPreview({ content }: MapPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="h-5 w-5" />
          주변 지도
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 지도 플레이스홀더 */}
        <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Map className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">
              {content.provider === 'naver' ? '네이버 지도' : '카카오 지도'}
            </p>
            <p className="text-xs mt-1">
              중심: {content.center.lat.toFixed(4)}, {content.center.lng.toFixed(4)}
            </p>
            <p className="text-xs">줌: {content.zoom}</p>
          </div>
        </div>

        {/* 마커 목록 */}
        {content.markers.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              주변 장소 ({content.markers.length}개)
            </h4>
            <div className="space-y-2">
              {content.markers.map((marker) => (
                <div
                  key={marker.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                >
                  <div className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[marker.category]}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{marker.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {CATEGORY_LABELS[marker.category]}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {content.markers.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            마커가 아직 추가되지 않았습니다
          </p>
        )}
      </CardContent>
    </Card>
  );
}
