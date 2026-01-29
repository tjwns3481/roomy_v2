'use client';

// @TASK P8-S12-T1 - 리뷰 설정 컴포넌트
// @SPEC P8 Screen 12 - Review Settings

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { showToast } from '@/lib/toast';
import {
  ReviewSettings as ReviewSettingsType,
  ReviewShowTiming,
  UpdateReviewSettingsRequest,
} from '@/types/review';
import { ArrowLeft, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface ReviewSettingsProps {
  guidebookId: string;
}

const TIMING_OPTIONS: { value: ReviewShowTiming; label: string }[] = [
  { value: 'checkout_before', label: '체크아웃 전날' },
  { value: 'checkout_day', label: '체크아웃 당일' },
  { value: 'checkout_after_1d', label: '체크아웃 후 1일' },
  { value: 'checkout_after_2d', label: '체크아웃 후 2일' },
];

export function ReviewSettings({ guidebookId }: ReviewSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Partial<ReviewSettingsType>>({
    is_enabled: false,
    airbnb_review_url: null,
    naver_place_url: null,
    google_maps_url: null,
    show_timing: 'checkout_day',
    popup_title: '즐거운 시간 보내셨나요?',
    popup_message:
      '경험을 공유해주시면 더 많은 분들이 좋은 추억을 만들 수 있어요!',
    total_shown: 0,
    total_clicked: 0,
  });

  useEffect(() => {
    loadSettings();
  }, [guidebookId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/review-settings/${guidebookId}`);

      if (!response.ok) {
        throw new Error('Failed to load settings');
      }

      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error loading review settings:', error);
      showToast.error('리뷰 설정을 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const updateData: UpdateReviewSettingsRequest = {
        is_enabled: settings.is_enabled,
        airbnb_review_url: settings.airbnb_review_url || null,
        naver_place_url: settings.naver_place_url || null,
        google_maps_url: settings.google_maps_url || null,
        show_timing: settings.show_timing,
        popup_title: settings.popup_title,
        popup_message: settings.popup_message,
      };

      const response = await fetch(`/api/review-settings/${guidebookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      const data = await response.json();
      setSettings(data);
      showToast.success('리뷰 설정이 저장되었습니다');
    } catch (error) {
      console.error('Error saving review settings:', error);
      showToast.error('리뷰 설정 저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  const clickRate =
    settings.total_shown && settings.total_shown > 0
      ? ((settings.total_clicked || 0) / settings.total_shown) * 100
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/editor/${guidebookId}`}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            에디터로 돌아가기
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <Star className="w-8 h-8 text-primary" />
            <h1 className="text-h1 text-text-primary">리뷰 설정</h1>
          </div>
          <p className="text-body text-text-secondary">
            게스트에게 리뷰를 요청하고 통계를 확인하세요
          </p>
        </div>

        {/* 통계 카드 */}
        {(settings.total_shown ?? 0) > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-background border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-caption text-text-secondary">
                  팝업 표시
                </span>
              </div>
              <p className="text-h2 text-text-primary">
                {settings.total_shown}회
              </p>
            </div>

            <div className="bg-background border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-primary" />
                <span className="text-caption text-text-secondary">
                  클릭 수
                </span>
              </div>
              <p className="text-h2 text-text-primary">
                {settings.total_clicked}회
              </p>
            </div>

            <div className="bg-background border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-caption text-text-secondary">
                  클릭률
                </span>
              </div>
              <p className="text-h2 text-text-primary">
                {clickRate.toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        {/* 설정 폼 */}
        <div className="space-y-6">
          {/* 활성화 토글 */}
          <div className="bg-background border border-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-h4 text-text-primary mb-1">
                  리뷰 요청 팝업 활성화
                </h3>
                <p className="text-caption text-text-secondary">
                  게스트 가이드북에 리뷰 요청 팝업을 표시합니다
                </p>
              </div>
              <Switch
                checked={settings.is_enabled ?? false}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, is_enabled: checked })
                }
              />
            </div>
          </div>

          {/* 리뷰 링크 설정 */}
          <div className="bg-background border border-border rounded-xl p-6 space-y-4">
            <h3 className="text-h4 text-text-primary">리뷰 링크 설정</h3>
            <p className="text-caption text-text-secondary mb-4">
              각 플랫폼의 리뷰 페이지 링크를 입력하세요
            </p>

            <div className="space-y-4">
              {/* Airbnb */}
              <div>
                <Label htmlFor="airbnb_url" className="flex items-center gap-2">
                  <span className="text-[#FF385C]">🏠</span>
                  Airbnb 리뷰 링크
                </Label>
                <Input
                  id="airbnb_url"
                  type="url"
                  placeholder="https://www.airbnb.co.kr/..."
                  value={settings.airbnb_review_url || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      airbnb_review_url: e.target.value,
                    })
                  }
                  className="mt-2"
                />
              </div>

              {/* Naver */}
              <div>
                <Label htmlFor="naver_url" className="flex items-center gap-2">
                  <span className="text-[#03C75A]">N</span>
                  네이버 플레이스 링크
                </Label>
                <Input
                  id="naver_url"
                  type="url"
                  placeholder="https://place.naver.com/..."
                  value={settings.naver_place_url || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      naver_place_url: e.target.value,
                    })
                  }
                  className="mt-2"
                />
              </div>

              {/* Google */}
              <div>
                <Label htmlFor="google_url" className="flex items-center gap-2">
                  <span className="text-[#4285F4]">G</span>
                  Google Maps 리뷰 링크
                </Label>
                <Input
                  id="google_url"
                  type="url"
                  placeholder="https://goo.gl/maps/..."
                  value={settings.google_maps_url || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      google_maps_url: e.target.value,
                    })
                  }
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* 팝업 타이밍 */}
          <div className="bg-background border border-border rounded-xl p-6">
            <h3 className="text-h4 text-text-primary mb-4">팝업 표시 시점</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TIMING_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setSettings({ ...settings, show_timing: option.value })
                  }
                  className={`
                    px-4 py-3 rounded-lg border-2 transition-all text-left
                    ${
                      settings.show_timing === option.value
                        ? 'border-primary bg-primary-light text-primary'
                        : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 문구 커스터마이징 */}
          <div className="bg-background border border-border rounded-xl p-6 space-y-4">
            <h3 className="text-h4 text-text-primary">팝업 문구 커스터마이징</h3>

            <div>
              <Label htmlFor="popup_title">팝업 제목</Label>
              <Input
                id="popup_title"
                value={settings.popup_title || ''}
                onChange={(e) =>
                  setSettings({ ...settings, popup_title: e.target.value })
                }
                className="mt-2"
                maxLength={50}
              />
            </div>

            <div>
              <Label htmlFor="popup_message">팝업 메시지</Label>
              <Textarea
                id="popup_message"
                value={settings.popup_message || ''}
                onChange={(e) =>
                  setSettings({ ...settings, popup_message: e.target.value })
                }
                className="mt-2"
                rows={3}
                maxLength={200}
              />
              <p className="text-caption text-text-secondary mt-1">
                {(settings.popup_message || '').length}/200
              </p>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={loadSettings}
              disabled={saving}
            >
              취소
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
