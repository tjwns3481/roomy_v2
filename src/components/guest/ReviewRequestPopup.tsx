// @TASK TouchStay-Comparison - 리뷰 요청 팝업 (Touch Stay 핵심 기능: 5-Star Review Pop-Up)
'use client';

import { useState, useEffect } from 'react';
import { Star, X, ExternalLink, ThumbsUp, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ReviewRequestPopupProps {
  guidebookTitle: string;
  airbnbUrl?: string;
  googleMapsUrl?: string;
  showAfterSeconds?: number; // When to show the popup
  themeColor?: string;
}

export function ReviewRequestPopup({
  guidebookTitle,
  airbnbUrl,
  googleMapsUrl,
  showAfterSeconds = 120, // Default: show after 2 minutes
  themeColor = '#3B82F6',
}: ReviewRequestPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [step, setStep] = useState<'rating' | 'positive' | 'negative'>('rating');
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Check if already shown in this session
    const hasShown = sessionStorage.getItem(`review-popup-${guidebookTitle}`);
    if (hasShown) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
      sessionStorage.setItem(`review-popup-${guidebookTitle}`, 'true');
    }, showAfterSeconds * 1000);

    return () => clearTimeout(timer);
  }, [guidebookTitle, showAfterSeconds]);

  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating);
    // Route based on rating (Touch Stay pattern)
    if (rating >= 4) {
      setStep('positive');
    } else {
      setStep('negative');
    }
  };

  const handleFeedbackSubmit = async () => {
    // Send feedback to API
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guidebookTitle,
          rating: selectedRating,
          feedback,
        }),
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
    setSubmitted(true);
  };

  if (!isVisible || submitted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md animate-in fade-in zoom-in duration-300">
        <CardContent className="p-6">
          {/* Close Button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>

          {step === 'rating' && (
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${themeColor}20` }}
              >
                <ThumbsUp className="w-8 h-8" style={{ color: themeColor }} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                숙소는 만족스러우셨나요?
              </h2>
              <p className="text-gray-600 mb-6">
                소중한 의견을 들려주세요
              </p>

              {/* Star Rating */}
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRatingSelect(rating)}
                    onMouseEnter={() => setHoveredRating(rating)}
                    onMouseLeave={() => setHoveredRating(null)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        (hoveredRating !== null ? rating <= hoveredRating : false)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsVisible(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                나중에 할게요
              </button>
            </div>
          )}

          {step === 'positive' && (
            <div className="text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                감사합니다!
              </h2>
              <p className="text-gray-600 mb-6">
                좋은 경험을 하셨다니 기쁩니다.
                <br />
                리뷰를 남겨주시면 큰 도움이 됩니다!
              </p>

              <div className="space-y-3">
                {airbnbUrl && (
                  <Button
                    className="w-full"
                    style={{ backgroundColor: '#FF5A5F' }}
                    onClick={() => window.open(airbnbUrl, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    에어비앤비에서 리뷰 남기기
                  </Button>
                )}
                {googleMapsUrl && (
                  <Button
                    className="w-full"
                    onClick={() => window.open(googleMapsUrl, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Google에서 리뷰 남기기
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsVisible(false)}
                >
                  다음에 할게요
                </Button>
              </div>
            </div>
          )}

          {step === 'negative' && (
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${themeColor}20` }}
              >
                <MessageSquare className="w-8 h-8" style={{ color: themeColor }} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                소중한 의견을 들려주세요
              </h2>
              <p className="text-gray-600 mb-6">
                어떤 점이 불편하셨나요?
                <br />
                호스트가 직접 확인하고 개선하겠습니다.
              </p>

              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="불편했던 점이나 개선 사항을 알려주세요..."
                className="w-full p-3 border rounded-lg mb-4 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsVisible(false)}
                >
                  취소
                </Button>
                <Button
                  className="flex-1"
                  style={{ backgroundColor: themeColor }}
                  onClick={handleFeedbackSubmit}
                  disabled={!feedback.trim()}
                >
                  전송하기
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
