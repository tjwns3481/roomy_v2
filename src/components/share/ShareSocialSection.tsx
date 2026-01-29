// @TASK P5-T5.3, P5-T5.5 - SNS 공유 섹션 + 이벤트 추적
// @SPEC docs/planning/06-tasks.md#p5-t53

'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MessageCircle, Twitter, Facebook } from 'lucide-react';
import { SocialPlatform } from '@/types/share';

interface ShareSocialSectionProps {
  url: string;
  title: string;
  /** @TASK P5-T5.5 - SNS 공유 시 이벤트 추적 콜백 */
  onShare?: (platform: SocialPlatform) => void;
}

export function ShareSocialSection({ url, title, onShare }: ShareSocialSectionProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleKakaoShare = () => {
    // Kakao SDK가 로드되어 있는지 확인
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).Kakao) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Kakao = (window as unknown as Record<string, any>).Kakao;

      // Kakao SDK 초기화 (이미 초기화되어 있지 않을 경우)
      if (!Kakao.isInitialized()) {
        const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_KEY;
        if (kakaoKey) {
          Kakao.init(kakaoKey);
        }
      }

      // 카카오톡 공유
      if (Kakao.isInitialized()) {
        Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: title,
            description: '게스트 가이드북을 확인해보세요',
            imageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/og-image.png`,
            link: {
              mobileWebUrl: url,
              webUrl: url,
            },
          },
          buttons: [
            {
              title: '가이드북 보기',
              link: {
                mobileWebUrl: url,
                webUrl: url,
              },
            },
          ],
        });
      } else {
        // Kakao SDK가 없으면 카카오스토리 공유 페이지로 이동
        window.open(
          `https://story.kakao.com/share?url=${encodedUrl}`,
          '_blank',
          'width=600,height=600'
        );
      }
    } else {
      // Kakao SDK가 없으면 카카오스토리 공유 페이지로 이동
      window.open(
        `https://story.kakao.com/share?url=${encodedUrl}`,
        '_blank',
        'width=600,height=600'
      );
    }

    // @TASK P5-T5.5 - 이벤트 추적
    onShare?.('kakao');
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
    window.open(twitterUrl, '_blank', 'width=600,height=600');

    // @TASK P5-T5.5 - 이벤트 추적
    onShare?.('twitter');
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    window.open(facebookUrl, '_blank', 'width=600,height=600');

    // @TASK P5-T5.5 - 이벤트 추적
    onShare?.('facebook');
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-gray-900">SNS 공유</Label>

      <div className="grid grid-cols-3 gap-2">
        {/* 카카오톡 */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleKakaoShare}
          className="flex-col h-auto py-3 gap-2"
        >
          <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-gray-900" />
          </div>
          <span className="text-xs">카카오톡</span>
        </Button>

        {/* 트위터 */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleTwitterShare}
          className="flex-col h-auto py-3 gap-2"
        >
          <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center">
            <Twitter className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs">트위터</span>
        </Button>

        {/* 페이스북 */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleFacebookShare}
          className="flex-col h-auto py-3 gap-2"
        >
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <Facebook className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs">페이스북</span>
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        SNS 버튼을 클릭하여 가이드북을 공유해보세요
      </p>
    </div>
  );
}
