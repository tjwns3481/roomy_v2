import { describe, it, expect } from 'vitest';
import {
  categorySchema,
  createCategorySchema,
  updateCategorySchema,
} from '@/types/category';

describe('Category Types', () => {
  describe('categorySchema', () => {
    const validCategory = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      parent_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Test Category',
      slug: 'test-category',
      description: 'This is a test category',
      image_url: 'https://example.com/category.jpg',
      sort_order: 0,
      is_active: true,
      created_at: '2024-01-25T10:00:00Z',
      updated_at: '2024-01-25T10:00:00Z',
    };

    it('should accept valid category', () => {
      expect(categorySchema.parse(validCategory)).toEqual(validCategory);
    });

    it('should accept null parent_id (top-level category)', () => {
      const category = { ...validCategory, parent_id: null };
      expect(categorySchema.parse(category).parent_id).toBeNull();
    });

    it('should accept null description', () => {
      const category = { ...validCategory, description: null };
      expect(categorySchema.parse(category).description).toBeNull();
    });

    it('should accept null image_url', () => {
      const category = { ...validCategory, image_url: null };
      expect(categorySchema.parse(category).image_url).toBeNull();
    });

    it('should reject invalid slug with uppercase', () => {
      expect(() =>
        categorySchema.parse({ ...validCategory, slug: 'Test-Category' })
      ).toThrow();
    });

    it('should reject invalid slug with spaces', () => {
      expect(() =>
        categorySchema.parse({ ...validCategory, slug: 'test category' })
      ).toThrow();
    });

    it('should reject invalid slug with underscores', () => {
      expect(() =>
        categorySchema.parse({ ...validCategory, slug: 'test_category' })
      ).toThrow();
    });

    it('should accept valid slug with hyphens', () => {
      const category = { ...validCategory, slug: 'test-category-123' };
      expect(categorySchema.parse(category).slug).toBe('test-category-123');
    });

    it('should reject empty name', () => {
      expect(() =>
        categorySchema.parse({ ...validCategory, name: '' })
      ).toThrow();
    });

    it('should reject name longer than 100 characters', () => {
      expect(() =>
        categorySchema.parse({ ...validCategory, name: 'a'.repeat(101) })
      ).toThrow();
    });

    it('should reject empty slug', () => {
      expect(() =>
        categorySchema.parse({ ...validCategory, slug: '' })
      ).toThrow();
    });

    it('should reject slug longer than 100 characters', () => {
      expect(() =>
        categorySchema.parse({ ...validCategory, slug: 'a'.repeat(101) })
      ).toThrow();
    });

    it('should reject invalid image_url', () => {
      expect(() =>
        categorySchema.parse({ ...validCategory, image_url: 'not-a-url' })
      ).toThrow();
    });

    it('should reject negative sort_order', () => {
      expect(() =>
        categorySchema.parse({ ...validCategory, sort_order: -1 })
      ).toThrow();
    });

    it('should reject non-integer sort_order', () => {
      expect(() =>
        categorySchema.parse({ ...validCategory, sort_order: 1.5 })
      ).toThrow();
    });
  });

  describe('createCategorySchema', () => {
    it('should omit auto-generated fields', () => {
      const input = {
        parent_id: null,
        name: 'New Category',
        slug: 'new-category',
        description: 'A new category',
        image_url: null,
        sort_order: 0,
        is_active: true,
      };

      const parsed = createCategorySchema.parse(input);
      expect(parsed).toEqual(input);
      expect(parsed).not.toHaveProperty('id');
      expect(parsed).not.toHaveProperty('created_at');
      expect(parsed).not.toHaveProperty('updated_at');
    });

    it('should accept minimal input', () => {
      const input = {
        parent_id: null,
        name: 'Digital',
        slug: 'digital',
        description: null,
        image_url: null,
        sort_order: 0,
        is_active: true,
      };

      expect(createCategorySchema.parse(input)).toEqual(input);
    });
  });

  describe('updateCategorySchema', () => {
    it('should require id field', () => {
      expect(() =>
        updateCategorySchema.parse({ name: 'Updated Name' })
      ).toThrow();
    });

    it('should accept partial updates', () => {
      const input = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Updated Category',
        is_active: false,
      };

      const parsed = updateCategorySchema.parse(input);
      expect(parsed).toEqual(input);
    });

    it('should accept full updates', () => {
      const input = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        parent_id: null,
        name: 'Updated Category',
        slug: 'updated-category',
        description: 'Updated description',
        image_url: 'https://example.com/updated.jpg',
        sort_order: 1,
        is_active: true,
        created_at: '2024-01-25T10:00:00Z',
        updated_at: '2024-01-25T11:00:00Z',
      };

      const parsed = updateCategorySchema.parse(input);
      expect(parsed).toEqual(input);
    });

    it('should validate slug in partial updates', () => {
      expect(() =>
        updateCategorySchema.parse({
          id: '550e8400-e29b-41d4-a716-446655440000',
          slug: 'Invalid_Slug',
        })
      ).toThrow();
    });
  });
});
