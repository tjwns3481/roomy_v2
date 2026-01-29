// @TASK P1-T1.6 - RulesEditor 컴포넌트
// @SPEC docs/planning/06-tasks.md#P1-T1.6

'use client';

import { useState } from 'react';
import { RulesContent } from '@/types/block';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  Plus,
  Trash2,
  GripVertical,
  AlertCircle,
  Recycle,
  CheckSquare,
  Home,
  Lightbulb,
} from 'lucide-react';

interface RulesEditorProps {
  content: RulesContent;
  onChange: (content: RulesContent) => void;
}

// 한국 특화 아이콘 옵션
const ICON_OPTIONS = [
  { value: 'alert', label: '⚠️ 주의사항', icon: AlertCircle },
  { value: 'recycle', label: '♻️ 분리수거', icon: Recycle },
  { value: 'check', label: '✅ 체크리스트', icon: CheckSquare },
  { value: 'home', label: '🏠 하우스 룰', icon: Home },
  { value: 'bulb', label: '💡 유용한 팁', icon: Lightbulb },
];

// 한국 특화 기본 템플릿
const DEFAULT_KOREAN_SECTIONS: RulesContent['sections'] = [
  {
    id: 'waste-separation',
    title: '분리수거 안내',
    icon: 'recycle',
    items: [
      '**일반 쓰레기**: 음식물 외 모든 쓰레기 (종량제 봉투 사용)',
      '**음식물 쓰레기**: 물기를 제거한 후 음식물 전용 봉투에 버려주세요',
      '**재활용**: 플라스틱, 종이, 유리, 캔 등 깨끗이 세척 후 분리',
      '**대형 폐기물**: 사전 신고 필요 (관리사무소 문의)',
    ],
  },
  {
    id: 'house-rules',
    title: '하우스 룰',
    icon: 'home',
    items: [
      '**흡연 금지**: 실내 및 베란다 흡연 금지',
      '**소음 주의**: 밤 10시 ~ 오전 8시 조용히 해주세요',
      '**파티 금지**: 허가되지 않은 파티/행사 금지',
      '**반려동물**: 사전 허가 필요',
    ],
  },
];

const DEFAULT_CHECKOUT_CHECKLIST = [
  '설거지 및 정리',
  '쓰레기 분리수거',
  '모든 창문 닫기',
  '에어컨/히터 끄기',
  '현관 비밀번호 확인 후 열쇠 반납',
];

export function RulesEditor({ content, onChange }: RulesEditorProps) {
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'section' | 'item' | 'checklist';
    sectionId?: string;
    itemIndex?: number;
    checklistIndex?: number;
  } | null>(null);

  // 템플릿 적용
  const handleApplyTemplate = () => {
    onChange({
      sections: DEFAULT_KOREAN_SECTIONS,
      checkoutChecklist: DEFAULT_CHECKOUT_CHECKLIST,
    });
  };

  // 섹션 추가
  const handleAddSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: '새 섹션',
      items: [''],
      icon: 'alert',
    };
    onChange({
      ...content,
      sections: [...content.sections, newSection],
    });
  };

  // 섹션 삭제 (확인 다이얼로그)
  const handleDeleteSection = (sectionId: string) => {
    setDeleteTarget({ type: 'section', sectionId });
  };

  const confirmDeleteSection = () => {
    if (deleteTarget?.type === 'section' && deleteTarget.sectionId) {
      onChange({
        ...content,
        sections: content.sections.filter((s) => s.id !== deleteTarget.sectionId),
      });
    }
    setDeleteTarget(null);
  };

  // 섹션 제목 변경
  const handleSectionTitleChange = (sectionId: string, title: string) => {
    onChange({
      ...content,
      sections: content.sections.map((s) =>
        s.id === sectionId ? { ...s, title } : s
      ),
    });
  };

  // 섹션 아이콘 변경
  const handleSectionIconChange = (sectionId: string, icon: string) => {
    onChange({
      ...content,
      sections: content.sections.map((s) =>
        s.id === sectionId ? { ...s, icon } : s
      ),
    });
  };

  // 규칙 항목 추가
  const handleAddItem = (sectionId: string) => {
    onChange({
      ...content,
      sections: content.sections.map((s) =>
        s.id === sectionId ? { ...s, items: [...s.items, ''] } : s
      ),
    });
  };

  // 규칙 항목 변경
  const handleItemChange = (sectionId: string, itemIndex: number, value: string) => {
    onChange({
      ...content,
      sections: content.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map((item, idx) => (idx === itemIndex ? value : item)),
            }
          : s
      ),
    });
  };

  // 규칙 항목 삭제
  const handleDeleteItem = (sectionId: string, itemIndex: number) => {
    setDeleteTarget({ type: 'item', sectionId, itemIndex });
  };

  const confirmDeleteItem = () => {
    if (
      deleteTarget?.type === 'item' &&
      deleteTarget.sectionId &&
      deleteTarget.itemIndex !== undefined
    ) {
      onChange({
        ...content,
        sections: content.sections.map((s) =>
          s.id === deleteTarget.sectionId
            ? {
                ...s,
                items: s.items.filter((_, idx) => idx !== deleteTarget.itemIndex),
              }
            : s
        ),
      });
    }
    setDeleteTarget(null);
  };

  // 체크아웃 체크리스트 추가
  const handleAddChecklistItem = () => {
    onChange({
      ...content,
      checkoutChecklist: [...(content.checkoutChecklist || []), ''],
    });
  };

  // 체크아웃 체크리스트 변경
  const handleChecklistItemChange = (index: number, value: string) => {
    onChange({
      ...content,
      checkoutChecklist: (content.checkoutChecklist || []).map((item, idx) =>
        idx === index ? value : item
      ),
    });
  };

  // 체크아웃 체크리스트 삭제
  const handleDeleteChecklistItem = (index: number) => {
    setDeleteTarget({ type: 'checklist', checklistIndex: index });
  };

  const confirmDeleteChecklistItem = () => {
    if (
      deleteTarget?.type === 'checklist' &&
      deleteTarget.checklistIndex !== undefined
    ) {
      onChange({
        ...content,
        checkoutChecklist: (content.checkoutChecklist || []).filter(
          (_, idx) => idx !== deleteTarget.checklistIndex
        ),
      });
    }
    setDeleteTarget(null);
  };

  return (
    <>
      <div className="space-y-6">
        {/* 템플릿 적용 버튼 */}
        <Card>
          <CardHeader>
            <CardTitle>한국 특화 템플릿</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleApplyTemplate} className="w-full">
              <Lightbulb className="mr-2 h-4 w-4" />
              기본 템플릿 적용 (분리수거 + 하우스 룰)
            </Button>
            <p className="mt-2 text-sm text-muted-foreground">
              분리수거 안내, 하우스 룰, 퇴실 체크리스트가 자동으로 추가됩니다.
            </p>
          </CardContent>
        </Card>

        {/* 섹션 목록 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">규칙 섹션</h3>
            <Button onClick={handleAddSection} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              섹션 추가
            </Button>
          </div>

          {content.sections.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                섹션이 없습니다. 템플릿을 적용하거나 직접 추가해보세요.
              </CardContent>
            </Card>
          ) : (
            content.sections.map((section, sectionIndex) => (
              <Card key={section.id}>
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-3">
                    <GripVertical className="mt-3 h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Select
                          value={section.icon}
                          onValueChange={(value) =>
                            handleSectionIconChange(section.id, value)
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ICON_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          value={section.title}
                          onChange={(e) =>
                            handleSectionTitleChange(section.id, e.target.value)
                          }
                          placeholder="섹션 제목"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSection(section.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start gap-2">
                      <Textarea
                        value={item}
                        onChange={(e) =>
                          handleItemChange(section.id, itemIndex, e.target.value)
                        }
                        placeholder="규칙 항목 (마크다운 지원: **굵게**, *기울임*)"
                        rows={2}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(section.id, itemIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddItem(section.id)}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    항목 추가
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    💡 마크다운 지원: **굵게**, *기울임*, `코드`
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 퇴실 체크리스트 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                퇴실 체크리스트
              </CardTitle>
              <Button onClick={handleAddChecklistItem} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                항목 추가
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {(content.checkoutChecklist || []).length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                체크리스트 항목이 없습니다. 추가해보세요.
              </p>
            ) : (
              (content.checkoutChecklist || []).map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={item}
                    onChange={(e) => handleChecklistItemChange(index, e.target.value)}
                    placeholder="체크리스트 항목"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteChecklistItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === 'section' && '이 섹션과 모든 항목이 삭제됩니다.'}
              {deleteTarget?.type === 'item' && '이 규칙 항목이 삭제됩니다.'}
              {deleteTarget?.type === 'checklist' && '이 체크리스트 항목이 삭제됩니다.'}
              <br />이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget?.type === 'section') confirmDeleteSection();
                else if (deleteTarget?.type === 'item') confirmDeleteItem();
                else if (deleteTarget?.type === 'checklist')
                  confirmDeleteChecklistItem();
              }}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
