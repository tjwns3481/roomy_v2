'use client';

// @TASK P8-S12-T1 - 리뷰 요청 팝업 컴포넌트
// @SPEC P8 Screen 12 - Review Settings

import { useEffect, useState } from 'react';
import { X, Star } from 'lucide-react';
import { ReviewSettings, ReviewPlatform } from '@/types/review';
import { Button } from '@/components/ui/button';

interface ReviewRequestPopupProps {
  guidebookId: string;
  settings: ReviewSettings;
}

export function ReviewRequestPopup({
  guidebookId,
  settings,
}: ReviewRequestPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // 이미 표시했으면 다시 표시하지 않음
    const storageKey = `review-popup-shown-${guidebookId}`;
    const shown = localStorage.getItem(storageKey);

    if (shown) {
      setHasShown(true);
      return;
    }

    // 설정이 활성화되어 있고, 리뷰 링크가 하나라도 있으면 표시
    if (
      settings.is_enabled &&
      (settings.airbnb_review_url ||
        settings.naver_place_url ||
        settings.google_maps_url)
    ) {
      // 3초 후 팝업 표시
      const timer = setTimeout(() => {
        setIsVisible(true);
        trackPopupShown();
        localStorage.setItem(storageKey, 'true');
        setHasShown(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [guidebookId, settings]);

  const trackPopupShown = async () => {
    try {
      await fetch(`/api/review-settings/${guidebookId}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'shown',
        }),
      });
    } catch (error) {
      console.error('Error tracking popup shown:', error);
    }
  };

  const handleReviewClick = async (platform: ReviewPlatform, url: string) => {
    try {
      await fetch(`/api/review-settings/${guidebookId}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          action: 'clicked',
        }),
      });

      // 새 탭에서 리뷰 페이지 열기
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error tracking review click:', error);
      // 에러가 나도 리뷰 페이지는 열어줌
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || hasShown) {
    return null;
  }

  const platforms = [
    {
      name: 'Airbnb',
      platform: 'airbnb' as ReviewPlatform,
      url: settings.airbnb_review_url,
      icon: '🏠',
      color: 'bg-[#FF385C]',
    },
    {
      name: 'Naver',
      platform: 'naver' as ReviewPlatform,
      url: settings.naver_place_url,
      icon: 'N',
      color: 'bg-[#03C75A]',
    },
    {
      name: 'Google',
      platform: 'google' as ReviewPlatform,
      url: settings.google_maps_url,
      icon: 'G',
      color: 'bg-[#4285F4]',
    },
  ].filter((p) => p.url); // URL이 있는 플랫폼만

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-background rounded-2xl shadow-xl max-w-md w-full pointer-events-auto animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 pb-4">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-primary-light rounded-full">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-h3 text-text-primary">
                {settings.popup_title}
              </h2>
            </div>
            <p className="text-body text-text-secondary ml-[52px]">
              {settings.popup_message}
            </p>
          </div>

          {/* Platforms */}
          <div className="px-6 pb-4 space-y-3">
            {platforms.map((platform) => (
              <button
                key={platform.platform}
                onClick={() =>
                  handleReviewClick(platform.platform, platform.url!)
                }
                className={`
                  w-full flex items-center gap-3 p-4 rounded-xl
                  border-2 border-border hover:border-primary
                  transition-all hover:shadow-md
                `}
              >
                <div
                  className={`
                  w-10 h-10 rounded-full ${platform.color}
                  flex items-center justify-center text-white font-bold
                `}
                >
                  {platform.icon}
                </div>
                <span className="text-body font-semibold text-text-primary">
                  {platform.name}에서 리뷰 남기기
                </span>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <Button
              variant="ghost"
              onClick={handleClose}
              className="w-full"
            >
              나중에 할게요
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
