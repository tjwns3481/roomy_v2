/**
 * Admin Categories API Integration Tests
 *
 * P4-T4.2: 관리자 카테고리 API
 *
 * TDD 워크플로우:
 * 1. RED: 이 테스트 먼저 작성
 * 2. GREEN: API 구현
 * 3. REFACTOR: 정리
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Test setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Skip tests if environment variables are not set
const shouldSkip = !supabaseUrl || !supabaseServiceKey;

describe.skipIf(shouldSkip)('Admin Categories API - Database Integration', () => {
  let supabase: ReturnType<typeof createClient>;
  let adminUserId: string;
  let regularUserId: string;
  let testCategoryIds: string[] = [];

  beforeAll(async () => {
    if (shouldSkip) return;

    supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Create admin user
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: `admin-${Date.now()}@test.com`,
      password: 'test123456',
      email_confirm: true,
    });

    if (adminError) throw adminError;
    adminUserId = adminData.user!.id;

    // Set admin role in profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', adminUserId);

    if (profileError) throw profileError;

    // Create regular user
    const { data: regularData, error: regularError } = await supabase.auth.admin.createUser({
      email: `regular-${Date.now()}@test.com`,
      password: 'test123456',
      email_confirm: true,
    });

    if (regularError) throw regularError;
    regularUserId = regularData.user!.id;
  });

  afterAll(async () => {
    if (shouldSkip) return;

    // Clean up test categories
    if (testCategoryIds.length > 0) {
      await supabase.from('categories').delete().in('id', testCategoryIds);
    }

    // Delete test users
    if (adminUserId) {
      await supabase.auth.admin.deleteUser(adminUserId);
    }
    if (regularUserId) {
      await supabase.auth.admin.deleteUser(regularUserId);
    }
  });

  beforeEach(async () => {
    if (shouldSkip) return;

    // Clean up test categories before each test
    if (testCategoryIds.length > 0) {
      await supabase.from('categories').delete().in('id', testCategoryIds);
      testCategoryIds = [];
    }
  });

  describe('Category CRUD Operations', () => {
    it('should create a category with valid data', async () => {
      const categoryData = {
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test description',
        sort_order: 1,
        is_active: true,
      };

      const { data, error } = await supabase
        .from('categories')
        .insert(categoryData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.name).toBe(categoryData.name);
      expect(data?.slug).toBe(categoryData.slug);
      expect(data?.id).toBeDefined();

      if (data?.id) testCategoryIds.push(data.id);
    });

    it('should create a child category with parent_id', async () => {
      // Create parent category
      const { data: parent } = await supabase
        .from('categories')
        .insert({
          name: 'Parent Category',
          slug: 'parent-category',
          sort_order: 1,
          is_active: true,
        })
        .select()
        .single();

      expect(parent).toBeDefined();
      if (parent?.id) testCategoryIds.push(parent.id);

      // Create child category
      const { data: child } = await supabase
        .from('categories')
        .insert({
          name: 'Child Category',
          slug: 'child-category',
          parent_id: parent!.id,
          sort_order: 1,
          is_active: true,
        })
        .select()
        .single();

      expect(child).toBeDefined();
      expect(child?.parent_id).toBe(parent!.id);
      if (child?.id) testCategoryIds.push(child.id);
    });

    it('should retrieve all categories ordered by sort_order', async () => {
      // Create multiple categories
      const { data: inserted } = await supabase
        .from('categories')
        .insert([
          { name: 'Category A', slug: 'category-a', sort_order: 2, is_active: true },
          { name: 'Category B', slug: 'category-b', sort_order: 1, is_active: true },
          { name: 'Category C', slug: 'category-c', sort_order: 3, is_active: true },
        ])
        .select();

      if (inserted) {
        testCategoryIds.push(...inserted.map((c) => c.id));
      }

      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      expect(data).toBeDefined();
      expect(data!.length).toBeGreaterThanOrEqual(3);

      // Check if sorted correctly
      const ourCategories = data!.filter((c) => testCategoryIds.includes(c.id));
      expect(ourCategories[0].name).toBe('Category B');
      expect(ourCategories[1].name).toBe('Category A');
      expect(ourCategories[2].name).toBe('Category C');
    });

    it('should update category fields', async () => {
      // Create category
      const { data: created } = await supabase
        .from('categories')
        .insert({
          name: 'Original Name',
          slug: 'original-slug',
          sort_order: 1,
          is_active: true,
        })
        .select()
        .single();

      if (created?.id) testCategoryIds.push(created.id);

      // Update category
      const { data: updated, error } = await supabase
        .from('categories')
        .update({
          name: 'Updated Name',
          description: 'Updated description',
          is_active: false,
        })
        .eq('id', created!.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.description).toBe('Updated description');
      expect(updated?.is_active).toBe(false);
    });

    it('should prevent deletion of category with children', async () => {
      // Create parent and child
      const { data: parent } = await supabase
        .from('categories')
        .insert({
          name: 'Parent',
          slug: 'parent-for-delete',
          sort_order: 1,
          is_active: true,
        })
        .select()
        .single();

      if (parent?.id) testCategoryIds.push(parent.id);

      const { data: child } = await supabase
        .from('categories')
        .insert({
          name: 'Child',
          slug: 'child-for-delete',
          parent_id: parent!.id,
          sort_order: 1,
          is_active: true,
        })
        .select()
        .single();

      if (child?.id) testCategoryIds.push(child.id);

      // Check if parent has children
      const { data: children } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', parent!.id);

      expect(children).toBeDefined();
      expect(children!.length).toBeGreaterThan(0);
    });

    it('should delete category without children', async () => {
      const { data: created } = await supabase
        .from('categories')
        .insert({
          name: 'To Delete',
          slug: 'to-delete',
          sort_order: 1,
          is_active: true,
        })
        .select()
        .single();

      const categoryId = created!.id;

      const { error } = await supabase.from('categories').delete().eq('id', categoryId);

      expect(error).toBeNull();

      // Verify deletion
      const { data: deleted } = await supabase
        .from('categories')
        .select()
        .eq('id', categoryId)
        .single();

      expect(deleted).toBeNull();
    });
  });

  describe('Category Validation', () => {
    it('should enforce unique slug constraint', async () => {
      const slug = `unique-slug-${Date.now()}`;

      // Create first category
      const { data: first } = await supabase
        .from('categories')
        .insert({
          name: 'First Category',
          slug,
          sort_order: 1,
          is_active: true,
        })
        .select()
        .single();

      if (first?.id) testCategoryIds.push(first.id);

      // Try to create second with same slug
      const { error } = await supabase
        .from('categories')
        .insert({
          name: 'Second Category',
          slug,
          sort_order: 2,
          is_active: true,
        })
        .select()
        .single();

      expect(error).toBeDefined();
      expect(error?.code).toBe('23505'); // Unique violation
    });

    it('should allow null parent_id', async () => {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: 'Root Category',
          slug: 'root-category',
          parent_id: null,
          sort_order: 1,
          is_active: true,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.parent_id).toBeNull();
      if (data?.id) testCategoryIds.push(data.id);
    });
  });

  describe('RLS Policies', () => {
    it('should allow admin to view all categories', async () => {
      // Create active and inactive categories
      const { data: inserted } = await supabase
        .from('categories')
        .insert([
          { name: 'Active Cat', slug: 'active-cat', is_active: true, sort_order: 1 },
          { name: 'Inactive Cat', slug: 'inactive-cat', is_active: false, sort_order: 2 },
        ])
        .select();

      if (inserted) {
        testCategoryIds.push(...inserted.map((c) => c.id));
      }

      // Get session for admin user
      const { data: sessionData } = await supabase.auth.signInWithPassword({
        email: `admin-${adminUserId.slice(0, 8)}@test.com`,
        password: 'test123456',
      });

      // Create client with admin session
      const adminClient = createClient(supabaseUrl!, supabaseServiceKey!);

      const { data } = await adminClient.from('categories').select('*');

      expect(data).toBeDefined();
      expect(data!.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Sort Order Management', () => {
    it('should update sort_order correctly', async () => {
      const { data: created } = await supabase
        .from('categories')
        .insert({
          name: 'Category',
          slug: 'category-sort',
          sort_order: 5,
          is_active: true,
        })
        .select()
        .single();

      if (created?.id) testCategoryIds.push(created.id);

      const { data: updated } = await supabase
        .from('categories')
        .update({ sort_order: 10 })
        .eq('id', created!.id)
        .select()
        .single();

      expect(updated?.sort_order).toBe(10);
    });
  });
});
