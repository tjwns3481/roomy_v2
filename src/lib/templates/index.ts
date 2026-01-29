// @TASK P3-T3.4 - 한국 특화 숙소 콘텐츠 템플릿 통합
// @SPEC docs/planning/06-tasks.md#P3-T3.4

/**
 * 한국 특화 숙소 콘텐츠 템플릿
 * - 편의시설, 이용 규칙, 공지사항, 여행 팁
 * - AI 프롬프트 및 블록 에디터에서 활용
 */

// ========================================
// 편의시설 (Amenities)
// ========================================
export {
  KOREAN_AMENITIES,
  KOREAN_AMENITIES_BY_CATEGORY,
  KOREAN_AMENITY_CATEGORY_NAMES,
  KOREAN_UNIQUE_AMENITIES,
  DEFAULT_KOREAN_AMENITIES,
  getAmenitiesDetails,
  type KoreanAmenityItem,
  type KoreanAmenityCategory,
} from './korean-amenities';

// ========================================
// 이용 규칙 (Rules)
// ========================================
export {
  KOREAN_RULES_TEMPLATES,
  KOREAN_RULES_BY_CATEGORY,
  KOREAN_RULE_CATEGORY_NAMES,
  ESSENTIAL_KOREAN_RULES,
  DEFAULT_CHECKOUT_CHECKLIST,
  getRulesDetails,
  type KoreanRuleTemplate,
  type KoreanRuleCategory,
} from './korean-rules';

// ========================================
// 공지사항 (Notices)
// ========================================
export {
  KOREAN_NOTICE_TEMPLATES,
  KOREAN_NOTICES_BY_CATEGORY,
  KOREAN_NOTICE_CATEGORY_NAMES,
  ESSENTIAL_KOREAN_NOTICES,
  getNoticesDetails,
  getNoticesByType,
  type KoreanNoticeTemplate,
  type KoreanNoticeCategory,
} from './korean-notices';

// ========================================
// 여행 팁 (Tips)
// ========================================
export {
  KOREAN_TIPS_TEMPLATES,
  KOREAN_TIPS_BY_CATEGORY,
  KOREAN_TIP_CATEGORY_NAMES,
  ESSENTIAL_KOREAN_TIPS,
  getTipsDetails,
  getTipsByTag,
  getSeasonalTip,
  type KoreanTipTemplate,
  type KoreanTipCategory,
} from './korean-tips';

// ========================================
// AI 프롬프트 빌더 함수
// ========================================

import { KOREAN_AMENITIES, DEFAULT_KOREAN_AMENITIES } from './korean-amenities';
import { KOREAN_RULES_TEMPLATES, ESSENTIAL_KOREAN_RULES } from './korean-rules';
import { KOREAN_NOTICE_TEMPLATES, ESSENTIAL_KOREAN_NOTICES } from './korean-notices';
import { KOREAN_TIPS_TEMPLATES, ESSENTIAL_KOREAN_TIPS, getSeasonalTip } from './korean-tips';

/**
 * AI 프롬프트용 한국 컨텍스트 생성
 * - OpenAI/LLM에 한국 특화 정보를 제공하여 더 정확한 응답 유도
 */
export function buildKoreanContextPrompt(): string {
  const amenityNames = Object.values(KOREAN_AMENITIES)
    .slice(0, 20)
    .map((a) => a.name)
    .join(', ');

  const ruleNames = Object.values(KOREAN_RULES_TEMPLATES)
    .slice(0, 10)
    .map((r) => r.title)
    .join(', ');

  const emergencyNotice = KOREAN_NOTICE_TEMPLATES.emergency;

  const seasonalTip = getSeasonalTip();

  return `
## 한국 숙소 특화 정보

### 주요 편의시설 (Korean Amenities)
${amenityNames}

### 중요 이용 규칙 (House Rules)
${ruleNames}

### 긴급 연락처 (Emergency Contacts)
${emergencyNotice.contacts?.map((c) => `- ${c.nameEn}: ${c.number}`).join('\n') || ''}

### 현재 계절 팁 (Seasonal Tip)
${seasonalTip.titleEn}: ${seasonalTip.contentEn}

### 한국 문화 포인트
- 실내에서 신발을 벗습니다
- 분리수거가 필수입니다
- 층간소음에 주의해야 합니다
- 팁 문화가 없습니다
- 카드 결제가 일반적입니다
`.trim();
}

/**
 * 가이드북용 AI 시스템 프롬프트 생성
 * - 숙소 정보와 함께 사용
 */
export function buildGuidebookSystemPrompt(propertyInfo?: {
  name?: string;
  address?: string;
  amenities?: string[];
  checkIn?: string;
  checkOut?: string;
}): string {
  const koreanContext = buildKoreanContextPrompt();

  let propertyContext = '';
  if (propertyInfo) {
    propertyContext = `
## 현재 숙소 정보
- 숙소명: ${propertyInfo.name || '미지정'}
- 주소: ${propertyInfo.address || '미지정'}
- 체크인: ${propertyInfo.checkIn || '15:00'}
- 체크아웃: ${propertyInfo.checkOut || '11:00'}
- 편의시설: ${propertyInfo.amenities?.join(', ') || '정보 없음'}
`;
  }

  return `
당신은 한국 숙소 가이드북의 AI 어시스턴트입니다.
게스트에게 숙소 이용과 한국 여행에 대한 정보를 친절하게 안내합니다.

${koreanContext}

${propertyContext}

### 응답 규칙
1. 친절하고 도움이 되는 톤으로 답변합니다
2. 한국어와 영어를 모두 지원합니다
3. 안전과 관련된 정보는 명확하게 전달합니다
4. 모르는 정보는 솔직하게 모른다고 답합니다
5. 숙소 호스트에게 직접 문의하도록 안내할 때는 공손하게 합니다
`.trim();
}

/**
 * 블록 에디터용 기본 템플릿 세트 반환
 */
export function getDefaultTemplateSet() {
  return {
    amenities: DEFAULT_KOREAN_AMENITIES.map((id) => ({
      id,
      ...KOREAN_AMENITIES[id],
      available: true,
    })),
    rules: ESSENTIAL_KOREAN_RULES.map((id) => KOREAN_RULES_TEMPLATES[id]),
    notices: ESSENTIAL_KOREAN_NOTICES.map((id) => KOREAN_NOTICE_TEMPLATES[id]),
    tips: ESSENTIAL_KOREAN_TIPS.map((id) => KOREAN_TIPS_TEMPLATES[id]),
  };
}

/**
 * 편의시설 ID 목록을 UI용 데이터로 변환
 */
export function formatAmenitiesForUI(amenityIds: string[]) {
  return amenityIds
    .filter((id) => id in KOREAN_AMENITIES)
    .map((id) => ({
      id,
      name: KOREAN_AMENITIES[id].name,
      nameEn: KOREAN_AMENITIES[id].nameEn,
      icon: KOREAN_AMENITIES[id].icon,
      description: KOREAN_AMENITIES[id].description,
      note: KOREAN_AMENITIES[id].note,
    }));
}

/**
 * 이용 규칙 ID 목록을 UI용 데이터로 변환
 */
export function formatRulesForUI(ruleIds: string[]) {
  return ruleIds
    .filter((id) => id in KOREAN_RULES_TEMPLATES)
    .map((id) => ({
      id,
      title: KOREAN_RULES_TEMPLATES[id].title,
      titleEn: KOREAN_RULES_TEMPLATES[id].titleEn,
      content: KOREAN_RULES_TEMPLATES[id].content,
      contentEn: KOREAN_RULES_TEMPLATES[id].contentEn,
      icon: KOREAN_RULES_TEMPLATES[id].icon,
      isImportant: KOREAN_RULES_TEMPLATES[id].isImportant,
    }));
}

/**
 * 공지사항 ID 목록을 UI용 데이터로 변환
 */
export function formatNoticesForUI(noticeIds: string[]) {
  return noticeIds
    .filter((id) => id in KOREAN_NOTICE_TEMPLATES)
    .map((id) => ({
      id,
      type: KOREAN_NOTICE_TEMPLATES[id].type,
      title: KOREAN_NOTICE_TEMPLATES[id].title,
      titleEn: KOREAN_NOTICE_TEMPLATES[id].titleEn,
      content: KOREAN_NOTICE_TEMPLATES[id].content,
      contentEn: KOREAN_NOTICE_TEMPLATES[id].contentEn,
      icon: KOREAN_NOTICE_TEMPLATES[id].icon,
      contacts: KOREAN_NOTICE_TEMPLATES[id].contacts,
    }));
}

/**
 * 템플릿 통계 정보
 */
export const TEMPLATE_STATS = {
  amenitiesCount: Object.keys(KOREAN_AMENITIES).length,
  rulesCount: Object.keys(KOREAN_RULES_TEMPLATES).length,
  noticesCount: Object.keys(KOREAN_NOTICE_TEMPLATES).length,
  tipsCount: Object.keys(KOREAN_TIPS_TEMPLATES).length,
  get totalCount() {
    return this.amenitiesCount + this.rulesCount + this.noticesCount + this.tipsCount;
  },
} as const;
