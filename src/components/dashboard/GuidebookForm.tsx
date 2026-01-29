// @TASK P4-T4.3 - 가이드북 기본 정보 폼
// @SPEC docs/planning/03-user-flow.md#가이드북-생성-플로우

'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Theme } from '@/types/guidebook';

interface GuidebookFormProps {
  onSubmit: (data: GuidebookFormData) => void;
  isLoading?: boolean;
  onCancel?: () => void;
}

export interface GuidebookFormData {
  title: string;
  slug: string;
  theme: Theme;
}

const THEMES: { value: Theme; label: string; color: string }[] = [
  { value: 'modern', label: '모던', color: '#2563EB' },
  { value: 'cozy', label: '따뜻한', color: '#D97706' },
  { value: 'minimal', label: '미니멀', color: '#374151' },
  { value: 'nature', label: '자연', color: '#059669' },
  { value: 'luxury', label: '럭셔리', color: '#7C3AED' },
];

export function GuidebookForm({ onSubmit, isLoading, onCancel }: GuidebookFormProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [theme, setTheme] = useState<Theme>('modern');
  const [slugError, setSlugError] = useState('');
  const [titleError, setTitleError] = useState('');

  /**
   * 제목 변경 시 자동으로 슬러그 생성
   */
  const handleTitleChange = (value: string) => {
    setTitle(value);
    setTitleError('');

    // 자동 슬러그 생성 (한글 → 로마자 변환)
    const autoSlug = value
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // 특수문자 제거
      .replace(/[\s_]+/g, '-') // 공백을 하이픈으로
      .replace(/^-+|-+$/g, ''); // 앞뒤 하이픈 제거

    setSlug(autoSlug);
  };

  /**
   * 슬러그 유효성 검사
   */
  const validateSlug = (value: string) => {
    if (value.length < 3) {
      return '슬러그는 최소 3자 이상이어야 합니다';
    }
    if (value.length > 50) {
      return '슬러그는 최대 50자까지 가능합니다';
    }
    if (!/^[a-z0-9-]+$/.test(value)) {
      return '영문 소문자, 숫자, 하이픈만 사용할 수 있습니다';
    }
    return '';
  };

  const handleSlugChange = (value: string) => {
    setSlug(value);
    const error = validateSlug(value);
    setSlugError(error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 최종 검증
    if (!title.trim()) {
      setTitleError('숙소 이름을 입력해주세요');
      return;
    }

    const error = validateSlug(slug);
    if (error) {
      setSlugError(error);
      return;
    }

    onSubmit({ title, slug, theme });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 숙소 이름 */}
      <div>
        <Label htmlFor="title" className="text-sm font-medium text-gray-900">
          숙소 이름 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="예: 강남역 아파트"
          className="mt-1.5"
          disabled={isLoading}
          aria-invalid={!!titleError}
          aria-describedby={titleError ? 'title-error' : undefined}
        />
        {titleError && (
          <p id="title-error" className="mt-1.5 text-sm text-red-600" role="alert">
            {titleError}
          </p>
        )}
      </div>

      {/* URL 슬러그 */}
      <div>
        <Label htmlFor="slug" className="text-sm font-medium text-gray-900">
          URL 슬러그 <span className="text-red-500">*</span>
        </Label>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-sm text-gray-500 whitespace-nowrap">roomy.app/g/</span>
          <Input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="gangnam-apt"
            className="flex-1"
            disabled={isLoading}
            aria-invalid={!!slugError}
            aria-describedby="slug-help slug-error"
          />
        </div>
        <p id="slug-help" className="mt-1.5 text-sm text-gray-500">
          ⚠️ 영문 소문자, 숫자, 하이픈만 사용
        </p>
        {slugError && (
          <p id="slug-error" className="mt-1.5 text-sm text-red-600" role="alert">
            {slugError}
          </p>
        )}
      </div>

      {/* 테마 선택 */}
      <div>
        <Label className="text-sm font-medium text-gray-900 mb-3 block">테마 선택</Label>
        <div className="grid grid-cols-5 gap-3">
          {THEMES.map((themeOption) => (
            <button
              key={themeOption.value}
              type="button"
              onClick={() => setTheme(themeOption.value)}
              disabled={isLoading}
              className={`
                relative p-4 rounded-lg border-2 transition-all
                ${
                  theme === themeOption.value
                    ? 'border-primary bg-primary-light'
                    : 'border-gray-200 hover:border-gray-300'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              aria-pressed={theme === themeOption.value}
            >
              <div
                className="w-full h-12 rounded mb-2"
                style={{ backgroundColor: themeOption.color }}
                aria-hidden="true"
              />
              <span className="text-xs font-medium text-gray-900">
                {themeOption.label}
              </span>
              {theme === themeOption.value && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            취소
          </Button>
        )}
        <Button type="submit" disabled={isLoading || !title || !slug || !!slugError}>
          {isLoading ? '생성 중...' : '다음: 콘텐츠 생성 방식'}
        </Button>
      </div>
    </form>
  );
}
