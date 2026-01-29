/**
 * useProducts Hook Tests
 * TDD: RED → GREEN → REFACTOR
 */

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProducts, useProduct } from '@/hooks/use-products';
import type { Product, ProductWithAll, ProductsResponse } from '@/types/products';
import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

// Mock fetch
global.fetch = vi.fn();

// SWR Provider for testing
const createWrapper = () => {
  return ({ children }: { children: ReactNode }) => (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      {children}
    </SWRConfig>
  );
};

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Test Product 1',
    slug: 'test-product-1',
    description: 'Test description 1',
    price: 10000,
    category_id: 'cat-1',
    images: ['img1.jpg'],
    status: 'active',
    stock: 10,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Test Product 2',
    slug: 'test-product-2',
    description: 'Test description 2',
    price: 20000,
    category_id: 'cat-1',
    images: ['img2.jpg'],
    status: 'active',
    stock: 5,
    created_at: '2025-01-02T00:00:00Z',
    updated_at: '2025-01-02T00:00:00Z',
  },
];

const mockProductWithAll: ProductWithAll = {
  ...mockProducts[0],
  category: {
    id: 'cat-1',
    name: 'Test Category',
    slug: 'test-category',
    created_at: '2025-01-01T00:00:00Z',
  },
  variants: [
    {
      id: 'var-1',
      product_id: '1',
      name: 'Size M',
      price_adjustment: 0,
      stock: 5,
      created_at: '2025-01-01T00:00:00Z',
    },
  ],
};

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('파라미터 없이 상품 목록을 가져와야 함', async () => {
    const mockResponse: ProductsResponse = {
      products: mockProducts,
      pagination: {
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.products).toEqual([]);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.products).toEqual(mockProducts);
    expect(result.current.pagination.total).toBe(2);
    expect(result.current.error).toBeNull();
  });

  it('카테고리 필터로 상품을 가져와야 함', async () => {
    const mockResponse: ProductsResponse = {
      products: [mockProducts[0]],
      pagination: {
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() =>
      useProducts({ category: 'test-category' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.products).toHaveLength(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('category=test-category')
    );
  });

  it('검색어로 상품을 필터링해야 함', async () => {
    const mockResponse: ProductsResponse = {
      products: [mockProducts[0]],
      pagination: {
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() =>
      useProducts({ search: 'Test Product 1' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.products).toHaveLength(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('search=Test+Product+1')
    );
  });

  it('정렬 옵션으로 상품을 정렬해야 함', async () => {
    const mockResponse: ProductsResponse = {
      products: mockProducts,
      pagination: {
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() =>
      useProducts({ sort: 'price_asc' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('sort=price_asc')
    );
  });

  it('페이지네이션을 처리해야 함', async () => {
    const mockResponse: ProductsResponse = {
      products: mockProducts,
      pagination: {
        total: 20,
        page: 2,
        pageSize: 10,
        totalPages: 2,
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useProducts({ page: 2 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.pagination.page).toBe(2);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('page=2')
    );
  });

  it('에러를 처리해야 함', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.products).toEqual([]);
  });

  it('mutate 함수를 제공해야 함', async () => {
    const mockResponse: ProductsResponse = {
      products: mockProducts,
      pagination: {
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      },
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.mutate).toBeDefined();
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('slug로 상품 상세를 가져와야 함', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProductWithAll,
    });

    const { result } = renderHook(() => useProduct('test-product-1'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.product).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.product).toEqual(mockProductWithAll);
    expect(result.current.error).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('test-product-1')
    );
  });

  it('상품을 찾지 못했을 때 에러를 반환해야 함', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('HTTP error! status: 404'));

    const { result } = renderHook(() => useProduct('non-existent-slug'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.product).toBeNull();
    expect(result.current.error).toBeTruthy();
  });

  it('카테고리와 변형 정보를 포함해야 함', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProductWithAll,
    });

    const { result } = renderHook(() => useProduct('test-product-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.product?.category).toBeDefined();
    expect(result.current.product?.variants).toBeDefined();
    expect(result.current.product?.variants).toHaveLength(1);
  });

  it('mutate 함수를 제공해야 함', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockProductWithAll,
    });

    const { result } = renderHook(() => useProduct('test-product-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.mutate).toBeDefined();
    expect(typeof result.current.mutate).toBe('function');
  });

  it('빈 slug일 때 요청하지 않아야 함', () => {
    const { result } = renderHook(() => useProduct(''));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.product).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
