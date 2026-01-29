// @TASK P8-S11-T1: 브랜딩 에디터 메인 컴포넌트
// @SPEC specs/screens/editor-branding.yaml

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Branding, BrandingUpdateInput } from '@/lib/validations/branding';
import ColorPicker from './ColorPicker';
import FontSelector from './FontSelector';
import ImageUpload from './ImageUpload';
import { Sparkles, Lock } from 'lucide-react';

interface BrandingEditorProps {
  guidebookId: string;
  guidebookTitle: string;
  guidebookSlug: string;
  userPlan: 'free' | 'pro' | 'business';
  initialBranding: Branding | null;
}

const DEFAULT_BRANDING: BrandingUpdateInput = {
  logo_url: null,
  favicon_url: null,
  primary_color: '#FF385C',
  secondary_color: '#00A699',
  font_preset: 'pretendard',
  custom_css: null,
};

export default function BrandingEditor({
  guidebookId,
  guidebookTitle,
  guidebookSlug,
  userPlan,
  initialBranding,
}: BrandingEditorProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<BrandingUpdateInput>(
    initialBranding
      ? {
          logo_url: initialBranding.logo_url,
          favicon_url: initialBranding.favicon_url,
          primary_color: initialBranding.primary_color,
          secondary_color: initialBranding.secondary_color,
          font_preset: initialBranding.font_preset,
          custom_css: initialBranding.custom_css,
        }
      : DEFAULT_BRANDING
  );
  const [isSaving, setIsSaving] = useState(false);

  // Free 플랜 게이트
  if (userPlan === 'free') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-lg shadow-airbnb-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-h2 mb-3">커스텀 브랜딩은 Pro 플랜부터</CardTitle>
            <CardDescription className="text-body-lg text-text-secondary">
              나만의 로고와 색상으로 브랜드를 강화하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pt-2">
            <Button
              onClick={() => router.push('/settings/billing')}
              size="lg"
              className="w-full bg-primary hover:bg-primary-dark"
            >
              Pro로 업그레이드
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/guidebooks/${guidebookId}/branding`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || '저장 실패');
      }

      toast.success('브랜딩 설정이 저장되었습니다');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '저장 중 오류가 발생했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
      {/* 왼쪽: 설정 폼 */}
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-h2 font-bold text-text-primary mb-2">브랜딩 설정</h1>
          <p className="text-body-lg text-text-secondary">
            {guidebookTitle}의 브랜드 아이덴티티를 커스터마이징하세요
          </p>
        </div>

        {/* 로고 섹션 */}
        <Card className="shadow-airbnb-sm hover:shadow-airbnb-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-h4 text-text-primary">로고</CardTitle>
            <CardDescription className="text-body-sm text-text-secondary">
              가이드북 헤더에 표시될 로고와 파비콘을 업로드하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ImageUpload
              label="로고"
              value={formData.logo_url || ''}
              onChange={(url) => setFormData({ ...formData, logo_url: url })}
              guidebookId={guidebookId}
              aspectRatio="auto"
              maxSizeMB={2}
            />
            <ImageUpload
              label="파비콘"
              value={formData.favicon_url || ''}
              onChange={(url) => setFormData({ ...formData, favicon_url: url })}
              guidebookId={guidebookId}
              aspectRatio="1:1"
              maxSizeMB={1}
            />
          </CardContent>
        </Card>

        {/* 색상 섹션 */}
        <Card className="shadow-airbnb-sm hover:shadow-airbnb-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-h4 text-text-primary">색상</CardTitle>
            <CardDescription className="text-body-sm text-text-secondary">
              브랜드 색상을 선택하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ColorPicker
              label="주 색상"
              value={formData.primary_color || '#FF385C'}
              onChange={(color) => setFormData({ ...formData, primary_color: color })}
            />
            <ColorPicker
              label="보조 색상"
              value={formData.secondary_color || '#00A699'}
              onChange={(color) => setFormData({ ...formData, secondary_color: color })}
            />
          </CardContent>
        </Card>

        {/* 글꼴 섹션 */}
        <Card className="shadow-airbnb-sm hover:shadow-airbnb-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-h4 text-text-primary">글꼴</CardTitle>
            <CardDescription className="text-body-sm text-text-secondary">
              가이드북에 사용할 글꼴을 선택하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FontSelector
              value={formData.font_preset || 'pretendard'}
              onChange={(font) => setFormData({ ...formData, font_preset: font })}
            />
          </CardContent>
        </Card>

        {/* 고급 섹션 (Business 전용) */}
        <Card className={`shadow-airbnb-sm transition-all ${userPlan !== 'business' ? 'opacity-60' : 'hover:shadow-airbnb-md'}`}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-h4 text-text-primary">고급 (Business)</CardTitle>
              {userPlan !== 'business' && <Lock className="w-4 h-4 text-text-tertiary" />}
            </div>
            <CardDescription className="text-body-sm text-text-secondary">
              커스텀 CSS로 세밀한 스타일링을 적용하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userPlan === 'business' ? (
              <textarea
                className="w-full h-48 p-4 font-mono text-sm border rounded-lg resize-none"
                placeholder="/* 커스텀 CSS 입력 (최대 10KB) */"
                value={formData.custom_css || ''}
                onChange={(e) => setFormData({ ...formData, custom_css: e.target.value })}
                maxLength={10000}
              />
            ) : (
              <Alert>
                <AlertDescription>
                  Business 플랜으로 업그레이드하면 커스텀 CSS를 사용할 수 있습니다.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* 저장 버튼 */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-primary hover:bg-primary-dark shadow-airbnb-sm hover:shadow-airbnb-md transition-all"
          >
            {isSaving ? '저장 중...' : '변경사항 저장'}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="border-2 hover:bg-surface"
          >
            취소
          </Button>
        </div>
      </div>

      {/* 오른쪽: 미리보기 */}
      <div className="lg:sticky lg:top-8 h-fit">
        <Card className="shadow-airbnb-lg">
          <CardHeader>
            <CardTitle className="text-h4 text-text-primary">미리보기</CardTitle>
            <CardDescription className="text-body-sm text-text-secondary">
              실시간으로 변경사항을 확인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-border rounded-airbnb overflow-hidden shadow-airbnb-md">
              {/* 모바일 프레임 시뮬레이션 */}
              <div
                className="p-4"
                style={{
                  backgroundColor: formData.primary_color || '#FF385C',
                  fontFamily: getFontFamily(formData.font_preset || 'pretendard'),
                }}
              >
                {formData.logo_url ? (
                  <img src={formData.logo_url} alt="Logo" className="h-8 object-contain" />
                ) : (
                  <div className="text-white font-bold text-lg">{guidebookTitle}</div>
                )}
              </div>
              <div className="p-6 bg-white">
                <h2
                  className="text-xl font-bold mb-2"
                  style={{
                    color: formData.primary_color || '#FF385C',
                    fontFamily: getFontFamily(formData.font_preset || 'pretendard'),
                  }}
                >
                  환영합니다!
                </h2>
                <p
                  className="text-neutral-600"
                  style={{ fontFamily: getFontFamily(formData.font_preset || 'pretendard') }}
                >
                  이곳은 브랜딩 미리보기입니다. 왼쪽에서 설정을 변경하면 실시간으로 반영됩니다.
                </p>
                <button
                  className="mt-4 px-6 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: formData.secondary_color || '#00A699' }}
                >
                  액션 버튼
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getFontFamily(preset: string): string {
  const fonts: Record<string, string> = {
    pretendard: 'Pretendard, sans-serif',
    noto_sans: '"Noto Sans KR", sans-serif',
    nanum_gothic: '"Nanum Gothic", sans-serif',
    gmarket_sans: '"GMarket Sans", sans-serif',
    spoqa_han_sans: '"Spoqa Han Sans", sans-serif',
  };
  return fonts[preset] || fonts.pretendard;
}
