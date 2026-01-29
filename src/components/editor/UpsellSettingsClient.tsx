// @TASK P8-S13-T1: Upsell 설정 클라이언트 컴포넌트
'use client';

import { useState } from 'react';
import { UpsellItem, UpsellRequest } from '@/types/upsell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';
import { UpsellItemForm } from './UpsellItemForm';
import { UpsellItemList } from './UpsellItemList';
import { UpsellRequestList } from './UpsellRequestList';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface UpsellSettingsClientProps {
  guidebookId: string;
  guidebookTitle: string;
  initialItems: UpsellItem[];
  initialRequests: any[];
  initialStats: {
    pending_requests: number;
    confirmed_requests: number;
    cancelled_requests: number;
  };
}

export function UpsellSettingsClient({
  guidebookId,
  guidebookTitle,
  initialItems,
  initialRequests,
  initialStats,
}: UpsellSettingsClientProps) {
  const [items, setItems] = useState<UpsellItem[]>(initialItems);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UpsellItem | null>(null);

  const handleAddItem = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEditItem = (item: UpsellItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleFormSuccess = (item: UpsellItem) => {
    if (editingItem) {
      // 수정
      setItems(items.map((i) => (i.id === item.id ? item : i)));
    } else {
      // 추가
      setItems([...items, item]);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter((i) => i.id !== itemId));
  };

  const handleReorder = (reorderedItems: UpsellItem[]) => {
    setItems(reorderedItems);
  };

  return (
    <div className="container max-w-6xl py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h2 text-text-primary font-semibold">
              Upsell 설정
            </h1>
            <p className="text-body text-text-secondary mt-1">
              {guidebookTitle}
            </p>
          </div>
          <Button onClick={handleAddItem} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            아이템 추가
          </Button>
        </div>
      </div>

      {/* 탭 */}
      <Tabs defaultValue="items" className="space-y-6">
        <TabsList>
          <TabsTrigger value="items" className="gap-2">
            <Package className="h-4 w-4" />
            아이템 관리
            <span className="ml-1 text-xs text-text-secondary">
              ({items.length})
            </span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2">
            요청 관리
            <span className="ml-1 text-xs text-text-secondary">
              ({initialStats.pending_requests})
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <UpsellItemList
            items={items}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onReorder={handleReorder}
            guidebookId={guidebookId}
          />
        </TabsContent>

        <TabsContent value="requests">
          <UpsellRequestList
            requests={initialRequests}
            stats={initialStats}
            guidebookId={guidebookId}
          />
        </TabsContent>
      </Tabs>

      {/* 아이템 추가/수정 모달 */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? '아이템 수정' : '새 Upsell 아이템'}
            </DialogTitle>
          </DialogHeader>
          <UpsellItemForm
            guidebookId={guidebookId}
            item={editingItem}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
