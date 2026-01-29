// @TASK P8-S13-T1: Upsell 아이템 목록 (드래그앤드롭 지원)
'use client';

import { useState } from 'react';
import { UpsellItem } from '@/types/upsell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Edit2, Trash2, GripVertical, Package } from 'lucide-react';
import { toast } from 'sonner';

interface UpsellItemListProps {
  items: UpsellItem[];
  onEdit: (item: UpsellItem) => void;
  onDelete: (itemId: string) => void;
  onReorder: (items: UpsellItem[]) => void;
  guidebookId: string;
}

export function UpsellItemList({
  items,
  onEdit,
  onDelete,
  onReorder,
  guidebookId,
}: UpsellItemListProps) {
  const [deletingItem, setDeletingItem] = useState<UpsellItem | null>(null);
  const [togglingItem, setTogglingItem] = useState<string | null>(null);

  const handleToggleActive = async (item: UpsellItem) => {
    setTogglingItem(item.id);

    try {
      const response = await fetch(
        `/api/guidebooks/${guidebookId}/upsell/items/${item.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: !item.is_active }),
        }
      );

      if (!response.ok) {
        throw new Error('상태 변경에 실패했습니다');
      }

      const result = await response.json();
      onReorder(
        items.map((i) => (i.id === item.id ? result.item : i))
      );
      toast.success(
        item.is_active ? '아이템이 비활성화되었습니다' : '아이템이 활성화되었습니다'
      );
    } catch (error) {
      console.error('Toggle active error:', error);
      toast.error('상태 변경 중 오류가 발생했습니다');
    } finally {
      setTogglingItem(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;

    try {
      const response = await fetch(
        `/api/guidebooks/${guidebookId}/upsell/items/${deletingItem.id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('삭제에 실패했습니다');
      }

      onDelete(deletingItem.id);
      toast.success('아이템이 삭제되었습니다');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('삭제 중 오류가 발생했습니다');
    } finally {
      setDeletingItem(null);
    }
  };

  // 드래그앤드롭은 간단한 버전으로 구현 (추후 @dnd-kit 추가 가능)
  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];

    // sort_order 업데이트
    const updatedItems = newItems.map((item, idx) => ({
      ...item,
      sort_order: idx,
    }));

    onReorder(updatedItems);

    // API 호출로 순서 저장
    try {
      await fetch(`/api/guidebooks/${guidebookId}/upsell/items/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: updatedItems.map((item) => ({
            id: item.id,
            sort_order: item.sort_order,
          })),
        }),
      });
    } catch (error) {
      console.error('Reorder error:', error);
      toast.error('순서 저장에 실패했습니다');
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === items.length - 1) return;

    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];

    const updatedItems = newItems.map((item, idx) => ({
      ...item,
      sort_order: idx,
    }));

    onReorder(updatedItems);

    try {
      await fetch(`/api/guidebooks/${guidebookId}/upsell/items/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: updatedItems.map((item) => ({
            id: item.id,
            sort_order: item.sort_order,
          })),
        }),
      });
    } catch (error) {
      console.error('Reorder error:', error);
      toast.error('순서 저장에 실패했습니다');
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <Package className="h-12 w-12 mx-auto text-text-secondary mb-4" />
        <h3 className="text-h4 text-text-primary mb-2">
          아이템이 없습니다
        </h3>
        <p className="text-body text-text-secondary">
          추가 서비스나 상품을 등록하여 수익을 늘려보세요
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <Card key={item.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {/* 이미지 */}
                {item.image_url && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border flex-shrink-0">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-h4">
                      {item.name}
                    </CardTitle>
                    <Badge variant={item.is_active ? 'default' : 'secondary'}>
                      {item.is_active ? '활성' : '비활성'}
                    </Badge>
                  </div>
                  <CardDescription className="text-h3 text-primary font-semibold">
                    ₩{item.price.toLocaleString()}
                  </CardDescription>
                  {item.description && (
                    <p className="text-body text-text-secondary mt-2 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex items-center gap-2 ml-4">
                <Switch
                  checked={item.is_active}
                  onCheckedChange={() => handleToggleActive(item)}
                  disabled={togglingItem === item.id}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(item)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeletingItem(item)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* 순서 변경 버튼 */}
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
              >
                ↑ 위로
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMoveDown(index)}
                disabled={index === items.length - 1}
              >
                ↓ 아래로
              </Button>
              <span className="text-small text-text-secondary ml-2">
                순서: {index + 1}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>아이템 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deletingItem?.name}&quot;을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
