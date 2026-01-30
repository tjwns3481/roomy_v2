// @TASK P8-S2-T3 - Upsell 요청 모달 (AirBnB 스타일)
// @SPEC specs/shared/components.yaml#upsell_widget

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import type { UpsellItem } from '@/types/upsell';
import { toastMessages } from '@/lib/toast-messages';

// 요청 폼 스키마
const requestFormSchema = z.object({
  guest_name: z.string().min(1, '이름은 필수입니다').max(50, '이름은 50자 이하여야 합니다'),
  guest_contact: z
    .string()
    .min(1, '연락처는 필수입니다')
    .max(50, '연락처는 50자 이하여야 합니다'),
  message: z.string().max(500, '메시지는 500자 이하여야 합니다').optional(),
});

type RequestFormData = z.infer<typeof requestFormSchema>;

interface UpsellRequestModalProps {
  item: UpsellItem;
  guidebookId: string;
  onClose: () => void;
}

/**
 * Upsell 요청 모달
 * - 상품 상세 정보 표시
 * - 요청 폼 (이름, 연락처, 메시지)
 * - 요청 완료 확인
 */
export function UpsellRequestModal({
  item,
  guidebookId,
  onClose,
}: UpsellRequestModalProps) {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestFormSchema),
  });

  // 가격 포맷
  const formattedPrice = `₩${item.price.toLocaleString('ko-KR')}`;

  // 요청 제출
  const onSubmit = async (data: RequestFormData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch('/api/upsell/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          upsell_item_id: item.id,
          guest_name: data.guest_name,
          guest_contact: data.guest_contact,
          message: data.message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || '요청 중 오류가 발생했습니다');
      }

      setIsSuccess(true);
      toast.success(toastMessages.upsell.requestSuccess);
    } catch (error) {
      console.error('Upsell request error:', error);
      toast.error(
        error instanceof Error ? error.message : toastMessages.upsell.requestError
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-airbnb-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 id="modal-title" className="text-h3 font-semibold text-text-primary">
            {isSuccess ? '요청 완료' : showForm ? '요청하기' : item.name}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* 성공 화면 */}
        {isSuccess ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-success"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-h3 font-semibold text-text-primary mb-2">
              요청이 완료되었습니다
            </h3>
            <p className="text-body text-text-secondary mb-6">
              호스트가 확인 후 곧 연락드리겠습니다.
            </p>
            <button
              onClick={onClose}
              className="w-full px-6 py-3.5 bg-primary text-white rounded-lg font-semibold
                hover:bg-primary-dark active:scale-[0.98] transition-all duration-200
                shadow-airbnb-md hover:shadow-airbnb-lg"
            >
              확인
            </button>
          </div>
        ) : showForm ? (
          /* 요청 폼 */
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="space-y-4">
              {/* 이름 */}
              <div>
                <label
                  htmlFor="guest_name"
                  className="block text-sm font-semibold text-text-primary mb-2"
                >
                  이름 <span className="text-error">*</span>
                </label>
                <input
                  id="guest_name"
                  type="text"
                  {...register('guest_name')}
                  className="w-full px-4 py-3 border border-border rounded-lg
                    focus:outline-none focus:border-text-primary focus:ring-1 focus:ring-text-primary
                    placeholder:text-tertiary transition-colors"
                  placeholder="홍길동"
                  disabled={isSubmitting}
                />
                {errors.guest_name && (
                  <p className="text-sm text-error mt-1">{errors.guest_name.message}</p>
                )}
              </div>

              {/* 연락처 */}
              <div>
                <label
                  htmlFor="guest_contact"
                  className="block text-sm font-semibold text-text-primary mb-2"
                >
                  연락처 <span className="text-error">*</span>
                </label>
                <input
                  id="guest_contact"
                  type="text"
                  {...register('guest_contact')}
                  className="w-full px-4 py-3 border border-border rounded-lg
                    focus:outline-none focus:border-text-primary focus:ring-1 focus:ring-text-primary
                    placeholder:text-tertiary transition-colors"
                  placeholder="010-1234-5678"
                  disabled={isSubmitting}
                />
                {errors.guest_contact && (
                  <p className="text-sm text-error mt-1">
                    {errors.guest_contact.message}
                  </p>
                )}
              </div>

              {/* 메시지 (선택) */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold text-text-primary mb-2"
                >
                  메시지 (선택)
                </label>
                <textarea
                  id="message"
                  {...register('message')}
                  rows={4}
                  className="w-full px-4 py-3 border border-border rounded-lg
                    focus:outline-none focus:border-text-primary focus:ring-1 focus:ring-text-primary
                    placeholder:text-tertiary transition-colors resize-none"
                  placeholder="추가로 전달하실 내용이 있으시면 작성해주세요"
                  disabled={isSubmitting}
                />
                {errors.message && (
                  <p className="text-sm text-error mt-1">{errors.message.message}</p>
                )}
              </div>
            </div>

            {/* 버튼 */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-6 py-3.5 bg-white text-text-primary rounded-lg font-semibold
                  border border-text-primary hover:bg-surface transition-colors"
                disabled={isSubmitting}
              >
                뒤로
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3.5 bg-primary text-white rounded-lg font-semibold
                  hover:bg-primary-dark active:scale-[0.98] transition-all duration-200
                  shadow-airbnb-md hover:shadow-airbnb-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? '제출 중...' : '제출'}
              </button>
            </div>
          </form>
        ) : (
          /* 상품 상세 */
          <div className="p-6">
            {/* 이미지 */}
            {item.image_url && (
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4">
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 512px"
                />
              </div>
            )}

            {/* 설명 */}
            {item.description && (
              <p className="text-body text-text-secondary mb-4">{item.description}</p>
            )}

            {/* 가격 */}
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-h2 font-bold text-text-primary">
                {formattedPrice}
              </span>
            </div>

            {/* 요청하기 버튼 */}
            <button
              onClick={() => setShowForm(true)}
              className="w-full px-6 py-3.5 bg-primary text-white rounded-lg font-semibold
                hover:bg-primary-dark active:scale-[0.98] transition-all duration-200
                shadow-airbnb-md hover:shadow-airbnb-lg"
            >
              요청하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
