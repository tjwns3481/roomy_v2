// @TASK P4-T4.4, P5-T5.3 - 가이드북 공유 설정 컴포넌트 + 공유 모달
// @SPEC docs/planning/06-tasks.md#p4-t44

'use client';

import { useState } from 'react';
import { Guidebook, GuidebookStatus } from '@/types/guidebook';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Copy, QrCode, Check, Share2 } from 'lucide-react';
import { ShareModal } from '@/components/share';
import { toast } from 'sonner';

interface ShareSettingsProps {
  guidebook: Guidebook;
}

export function ShareSettings({ guidebook }: ShareSettingsProps) {
  const [status, setStatus] = useState<GuidebookStatus>(guidebook.status);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://roomy.app'}/g/${guidebook.slug}`;

  const handleStatusChange = async (newStatus: GuidebookStatus) => {
    setStatus(newStatus);
    setIsSaving(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('guidebooks')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', guidebook.id);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: `공개 상태가 "${STATUS_LABELS[newStatus]}"(으)로 변경되었습니다`,
      });

      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error('Status update error:', error);
      setMessage({
        type: 'error',
        text: '상태 변경 중 오류가 발생했습니다',
      });
      setStatus(guidebook.status); // 원래 상태로 복원
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('링크가 복사되었습니다');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('링크 복사에 실패했습니다');
    }
  };

  const handleShareModal = () => {
    setIsShareModalOpen(true);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">공유 설정</h2>

      <div className="space-y-6">
        {/* 공개 상태 */}
        <div>
          <Label className="mb-3 block">공개 상태</Label>
          <RadioGroup
            value={status}
            onValueChange={(value) => handleStatusChange(value as GuidebookStatus)}
            disabled={isSaving}
          >
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <RadioGroupItem value="draft" id="draft" />
              <Label htmlFor="draft" className="flex-1 cursor-pointer">
                <div className="font-medium">초안 (비공개)</div>
                <div className="text-sm text-gray-500">
                  작성 중이며 외부에서 접근할 수 없습니다
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <RadioGroupItem value="published" id="published" />
              <Label htmlFor="published" className="flex-1 cursor-pointer">
                <div className="font-medium">공개</div>
                <div className="text-sm text-gray-500">
                  누구나 링크를 통해 접근할 수 있습니다
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <RadioGroupItem value="archived" id="archived" />
              <Label htmlFor="archived" className="flex-1 cursor-pointer">
                <div className="font-medium">보관 (비공개)</div>
                <div className="text-sm text-gray-500">
                  사용하지 않지만 삭제하지 않고 보관합니다
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* 공유 링크 */}
        {status === 'published' && (
          <div>
            <Label>공유 링크</Label>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-mono overflow-hidden text-ellipsis">
                {shareUrl}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    복사
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareModal}
                className="shrink-0"
              >
                <Share2 className="w-4 h-4 mr-1" />
                공유
              </Button>
            </div>
          </div>
        )}

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
      </div>

      {/* 공유 모달 */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        guidebook={{
          id: guidebook.id,
          title: guidebook.title,
          slug: guidebook.slug,
        }}
      />
    </div>
  );
}

const STATUS_LABELS: Record<GuidebookStatus, string> = {
  draft: '초안',
  published: '공개',
  archived: '보관',
};
