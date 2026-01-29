/**
 * useCart Hook
 *
 * 장바구니 조작 훅 (add, remove, update)
 * - cart-store와 연동
 * - Toast 알림 (sonner 사용)
 */

import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';
import { toast } from 'sonner';

/**
 * useCart Hook
 *
 * @returns 장바구니 상태 및 액션
 */
export function useCart() {
  const store = useCartStore();
  const router = useRouter();

  /**
   * 장바구니에 상품 추가 (Toast 알림 포함)
   * @param productId - 상품 ID
   * @param quantity - 수량 (기본값: 1)
   */
  const addItem = async (productId: string, quantity: number = 1) => {
    const previousError = store.error;

    await store.addItem(productId, quantity);

    // 에러가 발생했는지 확인
    const currentError = useCartStore.getState().error;

    if (currentError && currentError !== previousError) {
      toast.error(currentError);
    } else if (!currentError) {
      toast.success('장바구니에 추가되었습니다', {
        description: '장바구니로 이동하시겠습니까?',
        action: {
          label: '장바구니 보기',
          onClick: () => router.push('/cart'),
        },
        duration: 5000,
      });
    }
  };

  /**
   * 장바구니 아이템 수량 업데이트 (Toast 알림 포함)
   * @param itemId - 장바구니 아이템 ID
   * @param quantity - 수량
   */
  const updateQuantity = async (itemId: string, quantity: number) => {
    const previousError = store.error;

    await store.updateQuantity(itemId, quantity);

    // 에러가 발생했는지 확인
    const currentError = useCartStore.getState().error;

    if (currentError && currentError !== previousError) {
      toast.error(currentError);
    }
  };

  /**
   * 장바구니에서 아이템 제거 (Toast 알림 포함)
   * @param itemId - 장바구니 아이템 ID
   */
  const removeItem = async (itemId: string) => {
    const previousError = store.error;

    await store.removeItem(itemId);

    // 에러가 발생했는지 확인
    const currentError = useCartStore.getState().error;

    if (currentError && currentError !== previousError) {
      toast.error(currentError);
    } else if (!currentError) {
      toast.success('장바구니에서 제거되었습니다');
    }
  };

  /**
   * 장바구니 비우기
   */
  const clearCart = async () => {
    store.clearCart();
  };

  // itemCount 계산
  const itemCount = store.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: store.items,
    total: store.total,
    itemCount,
    isLoading: store.isLoading,
    error: store.error,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
