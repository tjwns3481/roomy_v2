'use client';

/**
 * useProducts Hook
 * 상품 목록 및 상세 데이터 페칭 (SWR 기반)
 */

import useSWR from 'swr';
import type {
  Product,
  ProductWithAll,
} from '@/types/product';
import type {
  ProductsParams,
  ProductsResponse,
  Pagination,
} from '@/types/products';

// Fetcher 함수
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
};

// URL 생성 헬퍼
function buildProductsUrl(params?: ProductsParams): string {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params?.category) searchParams.set('category', params.category);
  if (params?.sort) searchParams.set('sort', params.sort);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.status) searchParams.set('status', params.status);

  const query = searchParams.toString();
  return `/api/products${query ? `?${query}` : ''}`;
}

/**
 * 상품 목록 조회 훅
 */
export function useProducts(params?: ProductsParams) {
  const url = buildProductsUrl(params);

  const { data, error, isLoading, mutate } = useSWR<{ products: Product[], pagination: Pagination }>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  );

  const defaultPagination: Pagination = {
    total: 0,
    page: params?.page || 1,
    pageSize: params?.pageSize || 10,
    totalPages: 0,
  };

  return {
    products: data?.products || [],
    pagination: data?.pagination || defaultPagination,
    isLoading,
    error: error || null,
    mutate,
  };
}

/**
 * 상품 상세 조회 훅
 */
export function useProduct(slug: string) {
  const shouldFetch = Boolean(slug);
  const url = shouldFetch ? `/api/products/${slug}` : null;

  const { data, error, isLoading, mutate } = useSWR<{ product: ProductWithAll }>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  return {
    product: data?.product || null,
    isLoading: shouldFetch ? isLoading : false,
    error: error || null,
    mutate,
  };
}
