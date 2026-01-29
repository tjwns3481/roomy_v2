// @TASK P5-T5.3, P5-T5.5 - 링크 복사 섹션 + 이벤트 추적
// @SPEC docs/planning/06-tasks.md#p5-t53

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ShareLinkSectionProps {
  fullUrl: string;
  shortUrl: string | null;
  /** @TASK P5-T5.5 - 링크 복사 시 이벤트 추적 콜백 */
  onCopy?: () => void;
}

export function ShareLinkSection({ fullUrl, shortUrl, onCopy }: ShareLinkSectionProps) {
  const [copiedType, setCopiedType] = useState<'full' | 'short' | null>(null);

  const handleCopy = async (url: string, type: 'full' | 'short') => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedType(type);
      toast.success('링크가 복사되었습니다');
      setTimeout(() => setCopiedType(null), 2000);

      // @TASK P5-T5.5 - 이벤트 추적
      onCopy?.();
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('링크 복사에 실패했습니다');
    }
  };

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="full-url" className="text-sm font-medium text-gray-900">
          링크 복사
        </Label>
        <div className="mt-2 space-y-3">
          {/* 전체 URL */}
          <div className="space-y-2">
            <Input
              id="full-url"
              type="text"
              value={fullUrl}
              readOnly
              onClick={handleInputClick}
              className="font-mono text-sm bg-gray-50"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(fullUrl, 'full')}
              className="w-full"
            >
              {copiedType === 'full' ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  복사됨
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  전체 URL 복사
                </>
              )}
            </Button>
          </div>

          {/* 단축 URL (있을 경우) */}
          {shortUrl && (
            <div className="space-y-2">
              <Input
                type="text"
                value={shortUrl}
                readOnly
                onClick={handleInputClick}
                className="font-mono text-sm bg-gray-50"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(shortUrl, 'short')}
                className="w-full"
              >
                {copiedType === 'short' ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    단축 URL 복사
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
