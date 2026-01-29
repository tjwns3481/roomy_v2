// @TASK P8-S12-T1 - 리뷰 설정 테스트
// @SPEC P8 Screen 12 - Review Settings

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

describe('Review Settings', () => {
  let supabase: SupabaseClient;
  let testUserId: string;
  let testGuidebookId: string;

  beforeAll(async () => {
    supabase = createClient(supabaseUrl, supabaseKey);

    // 테스트 사용자 생성
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `review-test-${Date.now()}@test.com`,
      password: 'testpassword123',
    });

    if (authError) throw authError;
    testUserId = authData.user!.id;

    // 테스트 가이드북 생성
    const { data: guidebookData, error: guidebookError } = await supabase
      .from('guidebooks')
      .insert({
        user_id: testUserId,
        title: 'Test Guidebook for Review',
        slug: `test-review-${Date.now()}`,
        status: 'published',
        theme: 'modern',
        primary_color: '#2563EB',
        secondary_color: '#F97316',
      })
      .select()
      .single();

    if (guidebookError) throw guidebookError;
    testGuidebookId = guidebookData.id;
  });

  afterAll(async () => {
    // 정리
    if (testGuidebookId) {
      await supabase.from('guidebooks').delete().eq('id', testGuidebookId);
    }
    if (testUserId) {
      await supabase.auth.admin.deleteUser(testUserId);
    }
  });

  it('should create review settings', async () => {
    const { data, error } = await supabase
      .from('review_settings')
      .insert({
        guidebook_id: testGuidebookId,
        is_enabled: true,
        airbnb_review_url: 'https://www.airbnb.com/review/123',
        show_timing: 'checkout_day',
        popup_title: 'Test Title',
        popup_message: 'Test Message',
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.is_enabled).toBe(true);
    expect(data?.airbnb_review_url).toBe('https://www.airbnb.com/review/123');
  });

  it('should update review settings', async () => {
    const { data, error } = await supabase
      .from('review_settings')
      .update({
        naver_place_url: 'https://place.naver.com/test',
      })
      .eq('guidebook_id', testGuidebookId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data?.naver_place_url).toBe('https://place.naver.com/test');
  });

  it('should track popup shown', async () => {
    // 초기 통계
    const { data: before } = await supabase
      .from('review_settings')
      .select('total_shown')
      .eq('guidebook_id', testGuidebookId)
      .single();

    // RPC 호출
    const { error } = await supabase.rpc('track_review_popup_shown', {
      p_guidebook_id: testGuidebookId,
    });

    expect(error).toBeNull();

    // 통계 증가 확인
    const { data: after } = await supabase
      .from('review_settings')
      .select('total_shown')
      .eq('guidebook_id', testGuidebookId)
      .single();

    expect(after?.total_shown).toBe((before?.total_shown || 0) + 1);
  });

  it('should track review click', async () => {
    // 초기 통계
    const { data: before } = await supabase
      .from('review_settings')
      .select('total_clicked')
      .eq('guidebook_id', testGuidebookId)
      .single();

    // RPC 호출
    const { error } = await supabase.rpc('track_review_click', {
      p_guidebook_id: testGuidebookId,
      p_platform: 'airbnb',
      p_user_agent: 'test-agent',
      p_ip_hash: 'test-hash',
    });

    expect(error).toBeNull();

    // 통계 증가 확인
    const { data: after } = await supabase
      .from('review_settings')
      .select('total_clicked')
      .eq('guidebook_id', testGuidebookId)
      .single();

    expect(after?.total_clicked).toBe((before?.total_clicked || 0) + 1);

    // 로그 생성 확인
    const { data: logs } = await supabase
      .from('review_click_logs')
      .select('*')
      .eq('guidebook_id', testGuidebookId)
      .eq('platform', 'airbnb');

    expect(logs).toBeDefined();
    expect(logs!.length).toBeGreaterThan(0);
  });

  it('should calculate click rate correctly', async () => {
    const { data: settings } = await supabase
      .from('review_settings')
      .select('total_shown, total_clicked')
      .eq('guidebook_id', testGuidebookId)
      .single();

    expect(settings).toBeDefined();

    const clickRate =
      settings!.total_shown > 0
        ? (settings!.total_clicked / settings!.total_shown) * 100
        : 0;

    expect(clickRate).toBeGreaterThanOrEqual(0);
    expect(clickRate).toBeLessThanOrEqual(100);
  });

  it('should enforce unique guidebook_id constraint', async () => {
    const { error } = await supabase.from('review_settings').insert({
      guidebook_id: testGuidebookId,
      is_enabled: false,
    });

    expect(error).toBeDefined();
    expect(error?.code).toBe('23505'); // Unique violation
  });
});
