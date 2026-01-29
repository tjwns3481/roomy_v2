import { describe, it, expect } from 'vitest';
import {
  tagSchema,
  productTagSchema,
  createTagSchema,
  updateTagSchema,
} from '@/types/tag';

describe('Tag Types', () => {
  describe('tagSchema', () => {
    const validTag = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Test Tag',
      slug: 'test-tag',
    };

    it('should accept valid tag', () => {
      expect(tagSchema.parse(validTag)).toEqual(validTag);
    });

    it('should reject invalid slug with uppercase', () => {
      expect(() =>
        tagSchema.parse({ ...validTag, slug: 'Test-Tag' })
      ).toThrow();
    });

    it('should reject invalid slug with spaces', () => {
      expect(() =>
        tagSchema.parse({ ...validTag, slug: 'test tag' })
      ).toThrow();
    });

    it('should reject invalid slug with underscores', () => {
      expect(() =>
        tagSchema.parse({ ...validTag, slug: 'test_tag' })
      ).toThrow();
    });

    it('should accept valid slug with hyphens and numbers', () => {
      const tag = { ...validTag, slug: 'test-tag-123' };
      expect(tagSchema.parse(tag).slug).toBe('test-tag-123');
    });

    it('should reject empty name', () => {
      expect(() => tagSchema.parse({ ...validTag, name: '' })).toThrow();
    });

    it('should reject name longer than 50 characters', () => {
      expect(() =>
        tagSchema.parse({ ...validTag, name: 'a'.repeat(51) })
      ).toThrow();
    });

    it('should reject empty slug', () => {
      expect(() => tagSchema.parse({ ...validTag, slug: '' })).toThrow();
    });

    it('should reject slug longer than 100 characters', () => {
      expect(() =>
        tagSchema.parse({ ...validTag, slug: 'a'.repeat(101) })
      ).toThrow();
    });

    it('should reject invalid id format', () => {
      expect(() =>
        tagSchema.parse({ ...validTag, id: 'not-a-uuid' })
      ).toThrow();
    });
  });

  describe('productTagSchema', () => {
    const validProductTag = {
      product_id: '550e8400-e29b-41d4-a716-446655440000',
      tag_id: '550e8400-e29b-41d4-a716-446655440001',
    };

    it('should accept valid product tag', () => {
      expect(productTagSchema.parse(validProductTag)).toEqual(validProductTag);
    });

    it('should reject invalid product_id', () => {
      expect(() =>
        productTagSchema.parse({ ...validProductTag, product_id: 'not-a-uuid' })
      ).toThrow();
    });

    it('should reject invalid tag_id', () => {
      expect(() =>
        productTagSchema.parse({ ...validProductTag, tag_id: 'not-a-uuid' })
      ).toThrow();
    });

    it('should reject missing product_id', () => {
      expect(() =>
        productTagSchema.parse({ tag_id: validProductTag.tag_id })
      ).toThrow();
    });

    it('should reject missing tag_id', () => {
      expect(() =>
        productTagSchema.parse({ product_id: validProductTag.product_id })
      ).toThrow();
    });
  });

  describe('createTagSchema', () => {
    it('should omit id field', () => {
      const input = {
        name: 'New Tag',
        slug: 'new-tag',
      };

      const parsed = createTagSchema.parse(input);
      expect(parsed).toEqual(input);
      expect(parsed).not.toHaveProperty('id');
    });

    it('should validate slug format', () => {
      expect(() =>
        createTagSchema.parse({ name: 'Invalid', slug: 'Invalid_Tag' })
      ).toThrow();
    });

    it('should accept valid input', () => {
      const input = {
        name: 'Next.js',
        slug: 'nextjs',
      };

      expect(createTagSchema.parse(input)).toEqual(input);
    });
  });

  describe('updateTagSchema', () => {
    it('should require id field', () => {
      expect(() =>
        updateTagSchema.parse({ name: 'Updated Tag' })
      ).toThrow();
    });

    it('should accept partial updates', () => {
      const input = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Updated Tag',
      };

      const parsed = updateTagSchema.parse(input);
      expect(parsed).toEqual(input);
    });

    it('should accept full updates', () => {
      const input = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Updated Tag',
        slug: 'updated-tag',
      };

      const parsed = updateTagSchema.parse(input);
      expect(parsed).toEqual(input);
    });

    it('should validate slug in partial updates', () => {
      expect(() =>
        updateTagSchema.parse({
          id: '550e8400-e29b-41d4-a716-446655440000',
          slug: 'Invalid_Slug',
        })
      ).toThrow();
    });

    it('should validate name length in partial updates', () => {
      expect(() =>
        updateTagSchema.parse({
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'a'.repeat(51),
        })
      ).toThrow();
    });
  });
});
