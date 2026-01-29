# Code Patterns

> 프로젝트에서 반복 사용되는 코드 패턴

## Supabase 클라이언트

### 서버 컴포넌트용

```typescript
// src/lib/supabase/server.ts
import { createServerClient as _createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerClient() {
  const cookieStore = cookies();
  return _createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch { /* 서버 컴포넌트에서 호출 시 무시 */ }
        },
      },
    }
  );
}
```

### 브라우저용

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

## API Route 패턴

```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase.from('table').select('*');

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: { code: 'ERROR', message: '에러 메시지' } },
      { status: 500 }
    );
  }
}
```

## Zustand 스토어 패턴

```typescript
// src/stores/cart-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartState {
  items: CartItem[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (productId) => set((state) => ({
        items: [...state.items, { productId, quantity: 1 }],
      })),
      removeItem: (productId) => set((state) => ({
        items: state.items.filter((item) => item.productId !== productId),
      })),
    }),
    { name: 'cart-storage' }
  )
);
```

## 컴포넌트 패턴

### 서버 컴포넌트 (기본)

```tsx
// src/app/(shop)/products/page.tsx
import { createServerClient } from '@/lib/supabase/server';
import { ProductGrid } from '@/components/products/product-grid';

export default async function ProductsPage() {
  const supabase = createServerClient();
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active');

  return <ProductGrid products={products ?? []} />;
}
```

### 클라이언트 컴포넌트 (상호작용 필요 시)

```tsx
// src/components/cart/add-to-cart-button.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function AddToCartButton({ productId }: { productId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    // ...
    setIsLoading(false);
  };

  return (
    <Button onClick={handleClick} disabled={isLoading}>
      {isLoading ? '추가 중...' : '장바구니 담기'}
    </Button>
  );
}
```
