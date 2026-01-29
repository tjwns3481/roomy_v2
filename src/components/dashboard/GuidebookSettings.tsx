// @TASK P4-T4.4 - 가이드북 기본 설정 컴포넌트
// @SPEC docs/planning/06-tasks.md#p4-t44

'use client';

import { useState } from 'react';
import { Guidebook, Theme } from '@/types/guidebook';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GuidebookSettingsProps {
  guidebook: Guidebook;
}

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: 'modern', label: '모던' },
  { value: 'cozy', label: '따뜻한' },
  { value: 'minimal', label: '미니멀' },
  { value: 'nature', label: '자연' },
  { value: 'luxury', label: '럭셔리' },
];

export function GuidebookSettings({ guidebook }: GuidebookSettingsProps) {
  const [title, setTitle] = useState(guidebook.title);
  const [slug, setSlug] = useState(guidebook.slug);
  const [theme, setTheme] = useState<Theme>(guidebook.theme);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSlugChange = (value: string) => {
    // slug는 소문자, 숫자, 하이픈만 허용
    const sanitized = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-');
    setSlug(sanitized);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setMessage({ type: 'error', text: '제목을 입력해주세요' });
      return;
    }

    if (!slug.trim()) {
      setMessage({ type: 'error', text: 'URL 슬러그를 입력해주세요' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const supabase = createClient();

      // slug 중복 확인 (자신 제외)
      const { data: existingGuidebook } = await supabase
        .from('guidebooks')
        .select('id')
        .eq('slug', slug)
        .neq('id', guidebook.id)
        .single();

      if (existingGuidebook) {
        setMessage({
          type: 'error',
          text: '이미 사용 중인 URL입니다. 다른 URL을 선택해주세요.',
        });
        setIsSaving(false);
        return;
      }

      // 업데이트
      const { error } = await supabase
        .from('guidebooks')
        .update({
          title,
          slug,
          theme,
          updated_at: new Date().toISOString(),
        })
        .eq('id', guidebook.id);

      if (error) throw error;

      setMessage({ type: 'success', text: '변경사항이 저장되었습니다' });

      // 2초 후 메시지 제거
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error('Save error:', error);
      setMessage({
        type: 'error',
        text: '저장 중 오류가 발생했습니다. 다시 시도해주세요.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">기본 정보</h2>

      <div className="space-y-4">
        {/* 숙소 이름 */}
        <div>
          <Label htmlFor="title">숙소 이름</Label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 강남역 아파트"
            className="mt-1"
          />
        </div>

        {/* URL 슬러그 */}
        <div>
          <Label htmlFor="slug">URL 슬러그</Label>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-gray-500">roomy.app/g/</span>
            <Input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="gangnam-apt"
              className="flex-1"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            영문 소문자, 숫자, 하이픈만 사용 가능합니다
          </p>
        </div>

        {/* 테마 선택 */}
        <div>
          <Label htmlFor="theme">테마</Label>
          <Select value={theme} onValueChange={(value) => setTheme(value as Theme)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THEME_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 메시지 */}
        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 저장 버튼 */}
        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? '저장 중...' : '변경사항 저장'}
          </Button>
        </div>
      </div>
    </div>
  );
}
