// @TASK P1-T1.7 - GalleryEditor 컴포넌트
// @SPEC docs/planning/06-tasks.md#P1-T1.7

'use client';

import { useState, useRef } from 'react';
import { GalleryContent } from '@/types/block';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Image as ImageIcon, Upload, Trash2, MoveUp, MoveDown, Grid3x3, Presentation } from 'lucide-react';

interface GalleryEditorProps {
  content: GalleryContent;
  onChange: (content: GalleryContent) => void;
}

export function GalleryEditor({ content, onChange }: GalleryEditorProps) {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageAlt, setNewImageAlt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLayoutChange = (layout: 'grid' | 'slider') => {
    onChange({
      ...content,
      layout,
    });
  };

  const handleAddImage = () => {
    if (!newImageUrl) {
      return;
    }

    const newImage = {
      id: `image-${Date.now()}`,
      url: newImageUrl,
      alt: newImageAlt || undefined,
      caption: undefined,
    };

    onChange({
      ...content,
      images: [...content.images, newImage],
    });

    // Reset form
    setNewImageUrl('');
    setNewImageAlt('');
  };

  const handleRemoveImage = (imageId: string) => {
    onChange({
      ...content,
      images: content.images.filter((img) => img.id !== imageId),
    });
  };

  const handleMoveImageUp = (index: number) => {
    if (index === 0) return;

    const newImages = [...content.images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];

    onChange({
      ...content,
      images: newImages,
    });
  };

  const handleMoveImageDown = (index: number) => {
    if (index === content.images.length - 1) return;

    const newImages = [...content.images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];

    onChange({
      ...content,
      images: newImages,
    });
  };

  const handleImageAltChange = (imageId: string, value: string) => {
    onChange({
      ...content,
      images: content.images.map((img) =>
        img.id === imageId ? { ...img, alt: value || undefined } : img
      ),
    });
  };

  const handleImageCaptionChange = (imageId: string, value: string) => {
    onChange({
      ...content,
      images: content.images.map((img) =>
        img.id === imageId ? { ...img, caption: value || undefined } : img
      ),
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // 실제 구현에서는 Supabase Storage에 업로드해야 함
    // 지금은 임시로 Data URL 사용
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (event) => {
        const url = event.target?.result as string;
        const newImage = {
          id: `image-${Date.now()}-${i}`,
          url,
          alt: file.name,
          caption: undefined,
        };

        onChange({
          ...content,
          images: [...content.images, newImage],
        });
      };

      reader.readAsDataURL(file);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* 레이아웃 선택 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            레이아웃 설정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="layout">표시 방식</Label>
          <Select value={content.layout} onValueChange={handleLayoutChange}>
            <SelectTrigger id="layout" className="mt-1">
              <SelectValue placeholder="레이아웃 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">
                <div className="flex items-center gap-2">
                  <Grid3x3 className="h-4 w-4" />
                  <span>그리드 (2x2)</span>
                </div>
              </SelectItem>
              <SelectItem value="slider">
                <div className="flex items-center gap-2">
                  <Presentation className="h-4 w-4" />
                  <span>슬라이더 (스와이프)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* 이미지 업로드 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            이미지 업로드
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="fileUpload">파일 선택</Label>
            <input
              ref={fileInputRef}
              id="fileUpload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="mt-1 block w-full text-sm text-muted-foreground
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90
                cursor-pointer"
            />
            <p className="text-sm text-muted-foreground mt-1">
              여러 이미지를 선택할 수 있습니다
            </p>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">또는 URL로 추가</p>
            <div className="space-y-3">
              <div>
                <Label htmlFor="newImageUrl">이미지 URL</Label>
                <Input
                  id="newImageUrl"
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="newImageAlt">대체 텍스트 (선택)</Label>
                <Input
                  id="newImageAlt"
                  type="text"
                  value={newImageAlt}
                  onChange={(e) => setNewImageAlt(e.target.value)}
                  placeholder="거실 전경"
                  className="mt-1"
                />
              </div>

              <Button onClick={handleAddImage} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                URL로 이미지 추가
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 이미지 목록 섹션 */}
      {content.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>이미지 목록 ({content.images.length}개)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {content.images.map((image, index) => (
              <div
                key={image.id}
                className="border rounded-lg p-4 space-y-3 relative"
              >
                {/* 이미지 미리보기 */}
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={image.url}
                      alt={image.alt || '이미지'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <Label htmlFor={`image-alt-${image.id}`}>대체 텍스트</Label>
                      <Input
                        id={`image-alt-${image.id}`}
                        type="text"
                        value={image.alt || ''}
                        onChange={(e) => handleImageAltChange(image.id, e.target.value)}
                        placeholder="거실 전경"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`image-caption-${image.id}`}>캡션 (선택)</Label>
                      <Textarea
                        id={`image-caption-${image.id}`}
                        value={image.caption || ''}
                        onChange={(e) => handleImageCaptionChange(image.id, e.target.value)}
                        placeholder="넓은 거실 공간"
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveImageUp(index)}
                    disabled={index === 0}
                    aria-label="위로 이동"
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveImageDown(index)}
                    disabled={index === content.images.length - 1}
                    aria-label="아래로 이동"
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveImage(image.id)}
                    aria-label="이미지 삭제"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 빈 상태 안내 */}
      {content.images.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6 pb-6 text-center text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">아직 추가된 이미지가 없습니다</p>
            <p className="text-xs mt-1">위에서 이미지를 업로드하거나 URL을 추가하세요</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
