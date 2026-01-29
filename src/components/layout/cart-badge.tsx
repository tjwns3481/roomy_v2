'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/stores/cart-store';

/**
 * CartBadge 컴포넌트
 * - 장바구니 아이콘 + 수량 배지
 * - useCart 훅으로 실시간 수량 반영
 * - 세션 변경 시 장바구니 갱신
 * - 관리자는 장바구니 아이콘 숨김
 */
export function CartBadge() {
  const { items, fetchCart } = useCartStore();
  const { data: session, status } = useSession();

  const isAdmin = session?.user?.role === 'admin';

  // 컴포넌트 마운트 및 세션 변경 시 장바구니 조회
  useEffect(() => {
    // 세션 로딩 중이면 대기
    if (status === 'loading') return;
    // 관리자는 장바구니 조회 안함
    if (isAdmin) return;
    fetchCart();
  }, [fetchCart, session?.user?.id, status, isAdmin]);

  // 관리자는 장바구니 아이콘 숨김
  if (isAdmin) {
    return null;
  }

  // 총 수량 계산
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link
      href="/cart"
      className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-neo-white border-3 border-neo-black shadow-neo-sm hover:bg-neo-blue hover:text-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-neo-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150"
      aria-label="장바구니"
    >
      <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
      {/* 장바구니 개수 배지 */}
      <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center bg-neo-pink text-white border-2 border-neo-black text-xs font-bold rounded-full">
        {itemCount > 99 ? '99+' : itemCount}
      </span>
    </Link>
  );
}
