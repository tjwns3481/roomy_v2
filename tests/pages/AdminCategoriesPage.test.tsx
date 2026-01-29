/**
 * P4-T4.5: Admin Categories Page Tests
 *
 * Tests for the admin categories management page
 * - Category tree view with hierarchy visualization
 * - Drag and drop reordering
 * - Create/Edit/Delete categories
 * - Active/Inactive toggle
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CategoryTree from '@/components/admin/category-tree';
import CategoryForm from '@/components/admin/category-form';

// Mock ResizeObserver
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

// Mock categories data with tree structure
const mockCategories = [
  {
    id: '1',
    parent_id: null,
    name: '디지털 상품',
    slug: 'digital',
    description: '다운로드 가능한 디지털 콘텐츠',
    image_url: null,
    sort_order: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    children: [
      {
        id: '2',
        parent_id: '1',
        name: 'E-Book',
        slug: 'digital/ebook',
        description: '전자책 및 PDF',
        image_url: null,
        sort_order: 1,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        children: [],
      },
    ],
  },
];

describe('AdminCategoriesPage', () => {
  describe('Component Structure', () => {
    it('should render category tree component', () => {
      const { container } = render(
        <CategoryTree categories={mockCategories} />
      );

      expect(container).toBeTruthy();
    });

    it('should display category names in tree', () => {
      render(<CategoryTree categories={mockCategories} />);

      expect(screen.getByText('디지털 상품')).toBeInTheDocument();
      expect(screen.getByText('E-Book')).toBeInTheDocument();
    });

    it('should show active/inactive badges', () => {
      render(<CategoryTree categories={mockCategories} />);

      const badges = screen.getAllByText(/활성/i);
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('Category Form', () => {
    it('should render form fields', () => {
      const mockSubmit = vi.fn();
      const mockCancel = vi.fn();

      render(
        <CategoryForm
          onSubmit={mockSubmit}
          onCancel={mockCancel}
        />
      );

      expect(screen.getByLabelText(/카테고리명/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/슬러그/i)).toBeInTheDocument();
    });

    it('should have submit and cancel buttons', () => {
      const mockSubmit = vi.fn();
      const mockCancel = vi.fn();

      render(
        <CategoryForm
          onSubmit={mockSubmit}
          onCancel={mockCancel}
        />
      );

      expect(screen.getByText('등록')).toBeInTheDocument();
      expect(screen.getByText('취소')).toBeInTheDocument();
    });
  });

  describe('Category Actions', () => {
    it('should render action buttons for each category', () => {
      const { container } = render(
        <CategoryTree categories={mockCategories} />
      );

      // Each category should have action buttons
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have active toggle switches', () => {
      const { container } = render(
        <CategoryTree categories={mockCategories} />
      );

      // Should have switch components
      const switches = container.querySelectorAll('[role="switch"]');
      expect(switches.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have tree role', () => {
      render(<CategoryTree categories={mockCategories} />);

      expect(screen.getByRole('tree')).toBeInTheDocument();
    });

    it('should have accessible buttons with labels', () => {
      render(<CategoryTree categories={mockCategories} />);

      expect(screen.getAllByLabelText(/수정/i).length).toBeGreaterThan(0);
      expect(screen.getAllByLabelText(/삭제/i).length).toBeGreaterThan(0);
    });
  });
});
