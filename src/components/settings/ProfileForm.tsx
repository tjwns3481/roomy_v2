// @TASK P4-T4.6 - 프로필 설정 폼
// @SPEC docs/planning/06-tasks.md#P4-T4.6

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';

interface ProfileFormProps {
  initialData: {
    display_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const { setProfile, profile } = useAuthStore();
  const [displayName, setDisplayName] = useState(initialData.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatar_url || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일 검증
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드할 수 있습니다');
      return;
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('파일 크기는 5MB 이하여야 합니다');
      return;
    }

    setIsUploading(true);

    try {
      // FormData로 이미지 업로드
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'avatar');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '업로드에 실패했습니다');
      }

      const data = await response.json();
      setAvatarUrl(data.url);
      toast.success('프로필 사진이 업로드되었습니다');
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error(error instanceof Error ? error.message : '업로드에 실패했습니다');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 이름 검증
    if (displayName.trim().length < 2) {
      toast.error('이름은 최소 2자 이상이어야 합니다');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          display_name: displayName.trim(),
          avatar_url: avatarUrl || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '프로필 업데이트에 실패했습니다');
      }

      const updatedProfile = await response.json();

      // Store 업데이트
      if (profile) {
        setProfile({
          ...profile,
          display_name: updatedProfile.display_name,
          avatar_url: updatedProfile.avatar_url,
        });
      }

      toast.success('프로필이 업데이트되었습니다');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error instanceof Error ? error.message : '프로필 업데이트에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>프로필 설정</CardTitle>
        <CardDescription>회원님의 프로필 정보를 관리하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 프로필 사진 */}
          <div className="space-y-2">
            <Label>프로필 사진</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={displayName || '프로필 사진'} />
                ) : (
                  <AvatarFallback className="text-lg">{getInitials(displayName)}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col gap-2">
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" disabled={isUploading} asChild>
                    <span>{isUploading ? '업로드 중...' : '사진 변경'}</span>
                  </Button>
                </Label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
                <p className="text-xs text-muted-foreground">JPG, PNG 최대 5MB</p>
              </div>
            </div>
          </div>

          {/* 이름 */}
          <div className="space-y-2">
            <Label htmlFor="display_name">이름</Label>
            <Input
              id="display_name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="홍길동"
              required
              minLength={2}
            />
          </div>

          {/* 이메일 (읽기 전용) */}
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <div className="relative">
              <Input id="email" type="email" value={initialData.email} disabled className="pr-20" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600 font-medium">
                확인됨
              </span>
            </div>
            <p className="text-xs text-muted-foreground">이메일은 변경할 수 없습니다</p>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading || isUploading}>
              {isLoading ? '저장 중...' : '변경사항 저장'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
