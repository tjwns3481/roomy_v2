// @TASK P2-T2.3 - 클립보드 복사 훅
// @TASK P7-T7.7 - 토스트 메시지 상수 사용
// @SPEC docs/planning/06-tasks.md#P2-T2.3

import { useState } from 'react';
import { showToast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/lib/toast-messages';

/**
 * 클립보드에 텍스트를 복사하는 훅
 *
 * @returns {copied: boolean, copy: (text: string) => Promise<void>}
 *
 * @example
 * const { copied, copy } = useCopyToClipboard();
 *
 * <button onClick={() => copy('복사할 텍스트')}>
 *   {copied ? <Check /> : <Copy />}
 * </button>
 */
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      // 성공 토스트 알림
      showToast.success(TOAST_MESSAGES.COPY_SUCCESS, {
        duration: 2000,
      });

      // 2초 후 복사 상태 리셋
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // 복사 실패 시 에러 토스트
      showToast.error(TOAST_MESSAGES.COPY_ERROR);
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return { copied, copy };
}
