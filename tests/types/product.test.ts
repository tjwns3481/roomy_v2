import { describe, it, expect } from 'vitest';
import {
  productSchema,
  productImageSchema,
  productFileSchema,
  createProductSchema,
  updateProductSchema,
  productTypeSchema,
  productStatusSchema,
  digitalMetadataSchema,
  physicalMetadataSchema,
  serviceMetadataSchema,
} from '@/types/product';

describe('Product Types', () => {
  describe('productTypeSchema', () => {
    it('should accept valid product types', () => {
      expect(productTypeSchema.parse('digital')).toBe('digital');
      expect(productTypeSchema.parse('physical')).toBe('physical');
      expect(productTypeSchema.parse('service')).toBe('service');
    });

    it('should reject invalid product types', () => {
      expect(() => productTypeSchema.parse('invalid')).toThrow();
    });
  });

  describe('productStatusSchema', () => {
    it('should accept valid product statuses', () => {
      expect(productStatusSchema.parse('draft')).toBe('draft');
      expect(productStatusSchema.parse('active')).toBe('active');
      expect(productStatusSchema.parse('archived')).toBe('archived');
      expect(productStatusSchema.parse('hidden')).toBe('hidden');
    });

    it('should reject invalid product statuses', () => {
      expect(() => productStatusSchema.parse('invalid')).toThrow();
    });
  });

  describe('digitalMetadataSchema', () => {
    it('should accept valid digital metadata', () => {
      const metadata = {
        file_format: 'PDF',
        file_size: '15MB',
        preview_url: 'https://example.com/preview.pdf',
      };
      expect(digitalMetadataSchema.parse(metadata)).toEqual(metadata);
    });

    it('should accept empty digital metadata', () => {
      expect(digitalMetadataSchema.parse({})).toEqual({});
    });

    it('should reject invalid preview_url', () => {
      expect(() =>
        digitalMetadataSchema.parse({ preview_url: 'not-a-url' })
      ).toThrow();
    });
  });

  describe('physicalMetadataSchema', () => {
    it('should accept valid physical metadata', () => {
      const metadata = {
        weight: 500,
        stock: 100,
        shipping_fee: 3000,
        sku: 'PROD-001',
      };
      expect(physicalMetadataSchema.parse(metadata)).toEqual(metadata);
    });

    it('should reject negative stock', () => {
      expect(() => physicalMetadataSchema.parse({ stock: -1 })).toThrow();
    });

    it('should reject negative shipping_fee', () => {
      expect(() => physicalMetadataSchema.parse({ shipping_fee: -1 })).toThrow();
    });
  });

  describe('serviceMetadataSchema', () => {
    it('should accept valid service metadata', () => {
      const metadata = {
        duration: 60,
        booking_url: 'https://example.com/booking',
      };
      expect(serviceMetadataSchema.parse(metadata)).toEqual(metadata);
    });

    it('should reject invalid booking_url', () => {
      expect(() =>
        serviceMetadataSchema.parse({ booking_url: 'not-a-url' })
      ).toThrow();
    });
  });

  describe('productSchema', () => {
    const validProduct = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      category_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Test Product',
      slug: 'test-product',
      short_description: 'A test product',
      description: 'This is a detailed description',
      price: 10000,
      discount_price: 8000,
      type: 'digital' as const,
      metadata: { file_format: 'PDF' },
      status: 'active' as const,
      is_featured: true,
      view_count: 100,
      sales_count: 50,
      created_at: '2024-01-25T10:00:00Z',
      updated_at: '2024-01-25T10:00:00Z',
    };

    it('should accept valid product', () => {
      expect(productSchema.parse(validProduct)).toEqual(validProduct);
    });

    it('should accept null category_id', () => {
      const product = { ...validProduct, category_id: null };
      expect(productSchema.parse(product).category_id).toBeNull();
    });

    it('should accept null discount_price', () => {
      const product = { ...validProduct, discount_price: null };
      expect(productSchema.parse(product).discount_price).toBeNull();
    });

    it('should reject invalid slug with uppercase', () => {
      expect(() =>
        productSchema.parse({ ...validProduct, slug: 'Test-Product' })
      ).toThrow();
    });

    it('should reject invalid slug with spaces', () => {
      expect(() =>
        productSchema.parse({ ...validProduct, slug: 'test product' })
      ).toThrow();
    });

    it('should reject invalid slug with special characters', () => {
      expect(() =>
        productSchema.parse({ ...validProduct, slug: 'test_product!' })
      ).toThrow();
    });

    it('should accept valid slug with hyphens', () => {
      const product = { ...validProduct, slug: 'test-product-123' };
      expect(productSchema.parse(product).slug).toBe('test-product-123');
    });

    it('should reject negative price', () => {
      expect(() =>
        productSchema.parse({ ...validProduct, price: -100 })
      ).toThrow();
    });

    it('should reject negative discount_price', () => {
      expect(() =>
        productSchema.parse({ ...validProduct, discount_price: -100 })
      ).toThrow();
    });

    it('should reject non-integer price', () => {
      expect(() =>
        productSchema.parse({ ...validProduct, price: 10000.5 })
      ).toThrow();
    });

    it('should reject empty name', () => {
      expect(() => productSchema.parse({ ...validProduct, name: '' })).toThrow();
    });

    it('should reject name longer than 200 characters', () => {
      expect(() =>
        productSchema.parse({ ...validProduct, name: 'a'.repeat(201) })
      ).toThrow();
    });
  });

  describe('productImageSchema', () => {
    const validImage = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      product_id: '550e8400-e29b-41d4-a716-446655440001',
      url: 'https://example.com/image.jpg',
      alt_text: 'Test image',
      sort_order: 0,
      is_primary: true,
      created_at: '2024-01-25T10:00:00Z',
    };

    it('should accept valid product image', () => {
      expect(productImageSchema.parse(validImage)).toEqual(validImage);
    });

    it('should accept null alt_text', () => {
      const image = { ...validImage, alt_text: null };
      expect(productImageSchema.parse(image).alt_text).toBeNull();
    });

    it('should reject invalid url', () => {
      expect(() =>
        productImageSchema.parse({ ...validImage, url: 'not-a-url' })
      ).toThrow();
    });

    it('should reject negative sort_order', () => {
      expect(() =>
        productImageSchema.parse({ ...validImage, sort_order: -1 })
      ).toThrow();
    });
  });

  describe('productFileSchema', () => {
    const validFile = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      product_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'test.pdf',
      file_path: '/products/test.pdf',
      file_size: 1024000,
      file_type: 'application/pdf',
      version: '1.0',
      download_limit: 5,
      is_preview: false,
      sort_order: 0,
      created_at: '2024-01-25T10:00:00Z',
    };

    it('should accept valid product file', () => {
      expect(productFileSchema.parse(validFile)).toEqual(validFile);
    });

    it('should accept null file_size', () => {
      const file = { ...validFile, file_size: null };
      expect(productFileSchema.parse(file).file_size).toBeNull();
    });

    it('should accept null file_type', () => {
      const file = { ...validFile, file_type: null };
      expect(productFileSchema.parse(file).file_type).toBeNull();
    });

    it('should reject empty name', () => {
      expect(() =>
        productFileSchema.parse({ ...validFile, name: '' })
      ).toThrow();
    });

    it('should reject empty file_path', () => {
      expect(() =>
        productFileSchema.parse({ ...validFile, file_path: '' })
      ).toThrow();
    });

    it('should reject negative download_limit', () => {
      expect(() =>
        productFileSchema.parse({ ...validFile, download_limit: -1 })
      ).toThrow();
    });

    it('should reject negative sort_order', () => {
      expect(() =>
        productFileSchema.parse({ ...validFile, sort_order: -1 })
      ).toThrow();
    });
  });

  describe('createProductSchema', () => {
    it('should omit auto-generated fields', () => {
      const input = {
        category_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Test Product',
        slug: 'test-product',
        short_description: 'A test product',
        description: 'This is a detailed description',
        price: 10000,
        discount_price: null,
        type: 'digital' as const,
        metadata: {},
        status: 'draft' as const,
        is_featured: false,
      };

      const parsed = createProductSchema.parse(input);
      expect(parsed).toEqual(input);
      expect(parsed).not.toHaveProperty('id');
      expect(parsed).not.toHaveProperty('view_count');
      expect(parsed).not.toHaveProperty('sales_count');
      expect(parsed).not.toHaveProperty('created_at');
      expect(parsed).not.toHaveProperty('updated_at');
    });
  });

  describe('updateProductSchema', () => {
    it('should require id field', () => {
      expect(() =>
        updateProductSchema.parse({ name: 'Updated Name' })
      ).toThrow();
    });

    it('should accept partial updates', () => {
      const input = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Updated Name',
        price: 15000,
      };

      const parsed = updateProductSchema.parse(input);
      expect(parsed).toEqual(input);
    });

    it('should accept full updates', () => {
      const input = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        category_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Updated Product',
        slug: 'updated-product',
        short_description: 'Updated description',
        description: 'Updated detailed description',
        price: 15000,
        discount_price: 12000,
        type: 'physical' as const,
        metadata: { weight: 500 },
        status: 'active' as const,
        is_featured: true,
        view_count: 200,
        sales_count: 100,
        created_at: '2024-01-25T10:00:00Z',
        updated_at: '2024-01-25T11:00:00Z',
      };

      const parsed = updateProductSchema.parse(input);
      expect(parsed).toEqual(input);
    });
  });
});
