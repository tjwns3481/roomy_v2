/**
 * @TASK P8-R5 - 알림톡 발송 API
 *
 * POST /api/notifications/alimtalk/send
 * Body: {
 *   guidebookId: string,
 *   templateCode: string,
 *   recipientPhone: string,
 *   recipientName?: string,
 *   templateParams: Record<string, string>
 * }
 * Response: { success: true, messageId: string } | { error: {...} }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import {
  sendAlimtalk,
  validateTemplate,
  isValidPhoneNumber,
  buildTemplateMessage,
  ALIMTALK_TEMPLATES,
} from '@/lib/kakao/alimtalk';
import { z } from 'zod';

// ============================================
// Validation Schema
// ============================================

const SendAlimtalkSchema = z.object({
  guidebookId: z.string().uuid(),
  templateCode: z.string().min(1),
  recipientPhone: z.string().min(10),
  recipientName: z.string().optional(),
  templateParams: z.record(z.string()),
});

type SendAlimtalkRequest = z.infer<typeof SendAlimtalkSchema>;

// ============================================
// POST Handler
// ============================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const adminClient = createAdminClient();

    // 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '로그인이 필요합니다.',
          },
        },
        { status: 401 }
      );
    }

    // 요청 바디 파싱
    const body: SendAlimtalkRequest = await request.json();

    // 유효성 검증
    const validation = SendAlimtalkSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '잘못된 요청입니다.',
            details: validation.error.errors.map((e) => e.message).join(', '),
          },
        },
        { status: 400 }
      );
    }

    const { guidebookId, templateCode, recipientPhone, recipientName, templateParams } =
      validation.data;

    // 1. Business 플랜 체크
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    if (!profile || profile.plan !== 'business') {
      return NextResponse.json(
        {
          error: {
            code: 'PLAN_REQUIRED',
            message: '알림톡 발송은 Business 플랜에서만 사용 가능합니다.',
            upgradeUrl: '/settings/billing',
          },
        },
        { status: 402 }
      );
    }

    // 2. 가이드북 소유권 확인
    const { data: guidebook, error: guidebookError } = await supabase
      .from('guidebooks')
      .select('id, title')
      .eq('id', guidebookId)
      .eq('user_id', user.id)
      .single();

    if (guidebookError || !guidebook) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '가이드북을 찾을 수 없습니다.',
          },
        },
        { status: 404 }
      );
    }

    // 3. 전화번호 형식 검증
    if (!isValidPhoneNumber(recipientPhone)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_PHONE',
            message: '유효하지 않은 전화번호 형식입니다. (예: 010-1234-5678)',
          },
        },
        { status: 400 }
      );
    }

    // 4. 템플릿 검증
    const templateValidation = validateTemplate(templateCode, templateParams);
    if (!templateValidation.valid) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_TEMPLATE',
            message: templateValidation.error || '템플릿 검증 실패',
          },
        },
        { status: 400 }
      );
    }

    // 5. 알림톡 발송
    const result = await sendAlimtalk({
      templateCode,
      recipientPhone,
      recipientName,
      templateParams,
      guidebookId,
    });

    // 6. 발송 로그 저장 (RLS 우회를 위해 adminClient 사용)
    const template = Object.values(ALIMTALK_TEMPLATES).find((t) => t.code === templateCode);
    const messageContent = template
      ? buildTemplateMessage(template.name, templateParams)
      : JSON.stringify(templateParams);

    const logData = {
      guidebook_id: guidebookId,
      user_id: user.id,
      template_code: templateCode,
      recipient_phone: recipientPhone,
      recipient_name: recipientName || null,
      status: result.success ? 'sent' : 'failed',
      sent_at: result.success ? new Date().toISOString() : null,
      error_message: result.error?.message || null,
      error_code: result.error?.code || null,
      message_content: messageContent,
      kakao_message_id: result.messageId || null,
      template_params: templateParams,
      cost_krw: result.success ? 8 : 0, // 카카오 알림톡 대략 8원
    };

    const { error: insertError } = await adminClient.from('alimtalk_logs').insert(logData);

    if (insertError) {
      console.error('[Alimtalk] 로그 저장 실패:', insertError);
      // 발송은 성공했으므로 로그 실패는 무시
    }

    // 7. 응답
    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: '알림톡이 발송되었습니다.',
      });
    } else {
      return NextResponse.json(
        {
          error: {
            code: result.error?.code || 'SEND_FAILED',
            message: result.error?.message || '알림톡 발송에 실패했습니다.',
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Alimtalk] API 에러:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 오류가 발생했습니다.',
        },
      },
      { status: 500 }
    );
  }
}

// ============================================
// GET: 사용 가능한 템플릿 목록 조회
// ============================================

export async function GET() {
  return NextResponse.json({
    templates: Object.values(ALIMTALK_TEMPLATES).map((t) => ({
      code: t.code,
      name: t.name,
      variables: t.variables,
      description: t.description,
    })),
  });
}
