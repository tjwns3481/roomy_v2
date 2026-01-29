/**
 * @TASK P8-R6 - AI Chatbot RAG 로직
 * @SPEC specs/domain/resources.yaml#chatbot_log
 *
 * 가이드북 콘텐츠 기반 RAG (Retrieval Augmented Generation)
 * - GPT-4o-mini 사용
 * - 가이드북 블록 콘텐츠를 컨텍스트로 활용
 * - 플랜별 사용량 제한 (Free: 50회/월, Pro: 500회/월, Business: 무제한)
 */

import OpenAI from 'openai';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';

// ============================================
// Types
// ============================================

export interface ChatbotContext {
  guidebookId: string;
  guidebookTitle: string;
  blocks: Array<{
    type: string;
    title: string;
    content: any;
  }>;
}

export interface ChatbotRequest {
  guidebookId: string;
  sessionId: string;
  question: string;
}

export interface ChatbotResponse {
  answer: string;
  sources: string[];
  model: string;
  tokensUsed?: number;
}

export interface ChatbotLimitInfo {
  canChat: boolean;
  usedThisMonth: number;
  limitThisMonth: number;
  remaining: number;
  plan: string;
}

// ============================================
// OpenAI Client
// ============================================

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export function hasOpenAIKey(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

// ============================================
// 플랜별 제한 설정
// ============================================

export const CHATBOT_LIMITS: Record<string, number> = {
  free: 50,
  pro: 500,
  business: 999999, // 무제한
};

// ============================================
// 가이드북 콘텍스트 가져오기
// ============================================

/**
 * 가이드북의 블록 콘텐츠를 RAG 컨텍스트로 변환
 */
export async function getGuidebookContext(
  guidebookId: string
): Promise<ChatbotContext | null> {
  const supabase = await createServerClient();

  // 1. 가이드북 정보 조회
  const { data: guidebook, error: guidebookError } = await supabase
    .from('guidebooks')
    .select('id, title, status')
    .eq('id', guidebookId)
    .single();

  if (guidebookError || !guidebook) {
    console.error('[Chatbot] Guidebook not found:', guidebookId);
    return null;
  }

  // 2. 블록 콘텐츠 조회
  const { data: blocks, error: blocksError } = await supabase
    .from('blocks')
    .select('type, title, content, is_visible')
    .eq('guidebook_id', guidebookId)
    .eq('is_visible', true)
    .order('order', { ascending: true });

  if (blocksError) {
    console.error('[Chatbot] Error fetching blocks:', blocksError);
    return null;
  }

  return {
    guidebookId,
    guidebookTitle: guidebook.title,
    blocks: blocks || [],
  };
}

/**
 * 블록 콘텐츠를 텍스트로 변환 (RAG용)
 */
export function formatContextForRAG(context: ChatbotContext): string {
  const lines = [
    `# ${context.guidebookTitle}`,
    '',
    '다음은 숙소 가이드북의 정보입니다:',
    '',
  ];

  for (const block of context.blocks) {
    lines.push(`## ${block.title}`);

    // 블록 타입별로 콘텐츠 포맷팅
    if (block.type === 'quickInfo' && block.content) {
      if (block.content.checkin) lines.push(`- 체크인: ${block.content.checkin}`);
      if (block.content.checkout) lines.push(`- 체크아웃: ${block.content.checkout}`);
      if (block.content.contact) lines.push(`- 연락처: ${block.content.contact}`);
      if (block.content.address) lines.push(`- 주소: ${block.content.address}`);
      if (block.content.wifi) lines.push(`- Wi-Fi: ${block.content.wifi}`);
    } else if (block.type === 'amenities' && block.content?.items) {
      lines.push('편의시설:');
      for (const item of block.content.items) {
        lines.push(`- ${item.name}${item.description ? ': ' + item.description : ''}`);
      }
    } else if (block.type === 'rules' && block.content?.rules) {
      lines.push('숙소 이용규칙:');
      for (const rule of block.content.rules) {
        lines.push(`- ${rule}`);
      }
    } else if (block.type === 'notice' && block.content?.text) {
      lines.push(block.content.text);
    } else if (block.type === 'hero' && block.content?.description) {
      lines.push(block.content.description);
    } else if (block.type === 'custom' && block.content?.text) {
      lines.push(block.content.text);
    }

    lines.push('');
  }

  return lines.join('\n');
}

// ============================================
// AI 챗봇 응답 생성
// ============================================

/**
 * GPT-4o-mini를 사용한 챗봇 응답 생성
 */
export async function generateChatbotResponse(
  request: ChatbotRequest
): Promise<ChatbotResponse> {
  // 1. OpenAI 클라이언트 확인
  if (!hasOpenAIKey()) {
    // Mock 응답 (개발 환경용)
    console.warn('[Chatbot] OpenAI API key not configured, returning mock response');
    return {
      answer: `[Mock Response] 질문: "${request.question}"\n\n죄송합니다. AI 서비스가 현재 설정되지 않았습니다. 호스트에게 직접 문의해 주세요.`,
      sources: ['mock'],
      model: 'mock',
      tokensUsed: 0,
    };
  }

  // 2. 가이드북 콘텍스트 가져오기
  const context = await getGuidebookContext(request.guidebookId);
  if (!context) {
    throw new Error('Guidebook not found or not accessible');
  }

  // 3. RAG 프롬프트 구성
  const systemPrompt = `당신은 친절한 숙소 안내 챗봇입니다.
게스트가 숙소에 대해 궁금한 점을 물어보면, 제공된 가이드북 정보를 바탕으로 정확하고 친절하게 답변해주세요.

답변 가이드라인:
- 가이드북에 명시된 정보를 우선적으로 참조하세요
- 정보가 없는 경우 "가이드북에 해당 정보가 없습니다. 호스트에게 직접 문의해 주세요."라고 안내하세요
- 간결하고 명확하게 답변하세요 (2-3문장 권장)
- 한국어로 답변하세요
- 존댓말을 사용하세요`;

  const userPrompt = `[가이드북 정보]
${formatContextForRAG(context)}

[게스트 질문]
${request.question}`;

  // 4. OpenAI API 호출
  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const answer = completion.choices[0]?.message?.content || '답변을 생성할 수 없습니다.';
    const tokensUsed = completion.usage?.total_tokens || 0;

    // 5. 답변에 사용된 소스 블록 추출 (간단히 모든 블록 제목 반환)
    const sources = context.blocks.map((block) => block.title);

    return {
      answer,
      sources,
      model: completion.model,
      tokensUsed,
    };
  } catch (error) {
    console.error('[Chatbot] OpenAI API error:', error);
    throw new Error('Failed to generate AI response');
  }
}

// ============================================
// 챗봇 사용량 제한 체크
// ============================================

/**
 * 챗봇 사용량 제한 체크 (플랜별)
 */
export async function checkChatbotLimit(userId?: string): Promise<ChatbotLimitInfo> {
  // 비인증 사용자는 제한 없음 (게스트용)
  if (!userId) {
    return {
      canChat: true,
      usedThisMonth: 0,
      limitThisMonth: 999999,
      remaining: 999999,
      plan: 'guest',
    };
  }

  const supabase = await createServerClient();

  // 1. 사용자 플랜 조회
  const { data: user } = await supabase
    .from('users')
    .select('plan')
    .eq('id', userId)
    .single();

  const plan = user?.plan || 'free';
  const limit = CHATBOT_LIMITS[plan] || CHATBOT_LIMITS.free;

  // 2. 이번 달 사용량 조회
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('chatbot_logs')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', startOfMonth.toISOString());

  if (error) {
    console.error('[Chatbot] Error checking limit:', error);
    return {
      canChat: false,
      usedThisMonth: 0,
      limitThisMonth: limit,
      remaining: limit,
      plan,
    };
  }

  const used = count || 0;
  const remaining = Math.max(0, limit - used);

  return {
    canChat: used < limit,
    usedThisMonth: used,
    limitThisMonth: limit,
    remaining,
    plan,
  };
}

/**
 * 챗봇 사용량 기록
 */
export async function recordChatbotUsage(params: {
  guidebookId: string;
  sessionId: string;
  question: string;
  answer: string;
}): Promise<string> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('chatbot_logs')
    .insert({
      guidebook_id: params.guidebookId,
      session_id: params.sessionId,
      question: params.question,
      answer: params.answer,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[Chatbot] Error recording usage:', error);
    throw new Error('Failed to record chatbot usage');
  }

  return data.id;
}
