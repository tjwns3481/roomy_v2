// @TASK P8-S13-T1: Upsell 아이템 폼 컴포넌트
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUpsellItemSchema, CreateUpsellItemInput } from '@/lib/validations/upsell';
import { UpsellItem } from '@/types/upsell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Upload, Loader2 } from 'lucide-react';

interface UpsellItemFormProps {
  guidebookId: string;
  item?: UpsellItem | null;
  onSuccess: (item: UpsellItem) => void;
  onCancel: () => void;
}

export function UpsellItemForm({
  guidebookId,
  item,
  onSuccess,
  onCancel,
}: UpsellItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    item?.image_url || null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateUpsellItemInput>({
    resolver: zodResolver(createUpsellItemSchema),
    defaultValues: {
      name: item?.name || '',
      description: item?.description || '',
      price: item?.price || 0,
      image_url: item?.image_url || '',
      is_active: item?.is_active ?? true,
      sort_order: item?.sort_order || 0,
    },
  });

  const isActive = watch('is_active');

  const onSubmit = async (data: CreateUpsellItemInput) => {
    setIsSubmitting(true);

    try {
      const url = item
        ? `/api/guidebooks/${guidebookId}/upsell/items/${item.id}`
        : `/api/guidebooks/${guidebookId}/upsell/items`;

      const method = item ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || '저장에 실패했습니다');
      }

      const result = await response.json();
      toast.success(item ? '아이템이 수정되었습니다' : '아이템이 추가되었습니다');
      onSuccess(result.item);
    } catch (error) {
      console.error('Upsell item save error:', error);
      toast.error(
        error instanceof Error ? error.message : '저장 중 오류가 발생했습니다'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 미리보기
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // TODO: Supabase Storage 업로드 구현
    // 현재는 미리보기만 지원
    toast.info('이미지 업로드 기능은 곧 추가됩니다');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 상품명 */}
      <div className="space-y-2">
        <Label htmlFor="name">
          상품명 <span className="text-error">*</span>
        </Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="예: 조식 서비스"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-small text-error">{errors.name.message}</p>
        )}
      </div>

      {/* 설명 */}
      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="상품에 대한 자세한 설명을 입력하세요"
          rows={3}
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="text-small text-error">{errors.description.message}</p>
        )}
      </div>

      {/* 가격 */}
      <div className="space-y-2">
        <Label htmlFor="price">
          가격 (원) <span className="text-error">*</span>
        </Label>
        <Input
          id="price"
          type="number"
          {...register('price', { valueAsNumber: true })}
          placeholder="15000"
          disabled={isSubmitting}
        />
        {errors.price && (
          <p className="text-small text-error">{errors.price.message}</p>
        )}
      </div>

      {/* 이미지 업로드 */}
      <div className="space-y-2">
        <Label htmlFor="image">이미지</Label>
        <div className="flex items-start gap-4">
          {imagePreview && (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
              <img
                src={imagePreview}
                alt="미리보기"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isSubmitting}
              className="cursor-pointer"
            />
            <p className="text-small text-text-secondary mt-1">
              JPG, PNG 형식 지원 (최대 5MB)
            </p>
          </div>
        </div>
      </div>

      {/* 활성화 여부 */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="is_active" className="text-body font-medium">
            활성화
          </Label>
          <p className="text-small text-text-secondary">
            게스트에게 이 아이템을 표시합니다
          </p>
        </div>
        <Switch
          id="is_active"
          checked={isActive}
          onCheckedChange={(checked) => setValue('is_active', checked)}
          disabled={isSubmitting}
        />
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {item ? '수정' : '추가'}
        </Button>
      </div>
    </form>
  );
}
