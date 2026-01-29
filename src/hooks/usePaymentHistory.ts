/**
 * @TASK P6-T6.3 - 결제 내역 훅
 * @SPEC docs/planning/06-tasks.md#P6-T6.3
 *
 * 결제 내역 조회를 위한 클라이언트 훅
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PaymentHistory, PaymentStatus } from '@/types/subscription';

// ============================================================
// 타입 정의
// ============================================================

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

interface PaymentSummary {
  totalPayments: number;
  totalAmount: number;
  currency: string;
}

interface PaymentHistoryData {
  payments: PaymentHistory[];
  pagination: Pagination;
  summary: PaymentSummary;
}

interface UsePaymentHistoryOptions {
  page?: number;
  limit?: number;
}

interface UsePaymentHistoryReturn {
  // 데이터
  payments: PaymentHistory[];
  pagination: Pagination | null;
  summary: PaymentSummary | null;

  // 상태
  isLoading: boolean;
  error: Error | null;

  // 헬퍼
  getStatusLabel: (status: PaymentStatus) => string;
  getStatusColor: (status: PaymentStatus) => string;
  formatAmount: (amount: number) => string;
  formatDate: (date: string) => string;

  // 액션
  refetch: () => Promise<void>;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

// ============================================================
// 훅 구현
// ============================================================

export function usePaymentHistory(
  options: UsePaymentHistoryOptions = {}
): UsePaymentHistoryReturn {
  const [data, setData] = useState<PaymentHistoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(options.page ?? 1);
  const [limit] = useState(options.limit ?? 10);

  // 결제 내역 조회
  const fetchPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`/api/subscriptions/payments?${params}`);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('로그인이 필요합니다');
        }
        throw new Error('결제 내역을 불러오는데 실패했습니다');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch payment history:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  // 상태 레이블
  const getStatusLabel = useCallback((status: PaymentStatus): string => {
    const labels: Record<PaymentStatus, string> = {
      pending: '처리 중',
      succeeded: '결제 완료',
      failed: '결제 실패',
      refunded: '환불됨',
    };
    return labels[status] ?? status;
  }, []);

  // 상태 색상
  const getStatusColor = useCallback((status: PaymentStatus): string => {
    const colors: Record<PaymentStatus, string> = {
      pending: 'text-yellow-600 bg-yellow-100',
      succeeded: 'text-green-600 bg-green-100',
      failed: 'text-red-600 bg-red-100',
      refunded: 'text-gray-600 bg-gray-100',
    };
    return colors[status] ?? 'text-gray-600 bg-gray-100';
  }, []);

  // 금액 포맷
  const formatAmount = useCallback((amount: number): string => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  }, []);

  // 날짜 포맷
  const formatDate = useCallback((date: string): string => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  }, []);

  // 페이지 이동
  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const nextPage = useCallback(() => {
    if (data?.pagination?.hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [data?.pagination?.hasMore]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  }, [page]);

  // 페이지 변경 시 데이터 재조회
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    // 데이터
    payments: data?.payments ?? [],
    pagination: data?.pagination ?? null,
    summary: data?.summary ?? null,

    // 상태
    isLoading,
    error,

    // 헬퍼
    getStatusLabel,
    getStatusColor,
    formatAmount,
    formatDate,

    // 액션
    refetch: fetchPayments,
    goToPage,
    nextPage,
    prevPage,
  };
}

export default usePaymentHistory;
