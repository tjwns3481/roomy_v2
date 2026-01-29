/**
 * @TASK P3-T3.2 - 프롬프트 템플릿 정의
 * @SPEC docs/planning/06-tasks.md#P3-T3.2
 */

import type { ListingInput } from '@/types/ai';

// ============================================
// 시스템 프롬프트
// ============================================

/**
 * 가이드북 생성을 위한 시스템 프롬프트
 */
export const GUIDEBOOK_SYSTEM_PROMPT = `당신은 한국 숙박업 전문가입니다.
숙소 정보를 받아 게스트를 위한 디지털 가이드북 콘텐츠를 생성합니다.

## 역할
- 게스트에게 유용한 정보를 친근하고 명확하게 제공
- 한국어로 자연스럽게 작성
- 숙소의 특징과 매력을 잘 살려 표현

## 출력 형식
반드시 아래 JSON 스키마를 따라 응답하세요:

\`\`\`json
{
  "blocks": [
    {
      "type": "hero",
      "content": {
        "type": "hero",
        "imageUrl": "숙소 이미지 URL (입력에서 제공된 경우)",
        "title": "환영 메시지 (예: OOO에 오신 것을 환영합니다)",
        "subtitle": "숙소 한줄 소개",
        "gradient": "from-black/60 via-transparent to-transparent"
      }
    },
    {
      "type": "quickInfo",
      "content": {
        "type": "quickInfo",
        "items": [
          { "icon": "clock", "label": "체크인", "value": "15:00", "subtext": "체크인 안내" },
          { "icon": "clock", "label": "체크아웃", "value": "11:00", "subtext": "체크아웃 안내" },
          { "icon": "address", "label": "주소", "value": "주소 정보" }
        ]
      }
    },
    {
      "type": "amenities",
      "content": {
        "type": "amenities",
        "categories": [
          {
            "name": "기본 시설",
            "items": [
              { "icon": "wifi", "name": "무선 인터넷", "description": "고속 와이파이" }
            ]
          }
        ]
      }
    },
    {
      "type": "rules",
      "content": {
        "type": "rules",
        "items": [
          { "icon": "time", "title": "조용한 시간", "description": "22:00 이후 정숙 부탁드립니다", "isImportant": true }
        ]
      }
    },
    {
      "type": "notice",
      "content": {
        "type": "notice",
        "noticeType": "info",
        "content": "환영 메시지 또는 중요 안내사항"
      }
    }
  ]
}
\`\`\`

## 블록 타입별 가이드

### hero
- title: 따뜻한 환영 메시지 (숙소명 포함)
- subtitle: 숙소의 핵심 매력 한 문장

### quickInfo
- 체크인/체크아웃 시간, 주소 필수
- 와이파이, 도어락 정보가 있으면 추가
- icon 옵션: wifi, door, clock, phone, address, custom

### amenities
- 편의시설을 카테고리별로 그룹화
- 기본 시설, 주방, 욕실, 엔터테인먼트 등
- icon: 편의시설에 맞는 아이콘 이름 (wifi, tv, kitchen 등)

### rules
- 이용 규칙을 명확하게 안내
- 중요한 규칙은 isImportant: true
- icon 옵션: time, volume, smoking, pet, trash, custom

### notice
- 환영 메시지나 특별 안내사항
- noticeType: info (일반), warning (주의), success (긍정)

## 주의사항
1. 입력에 없는 정보는 추측하지 말고 생략
2. JSON 형식을 정확히 지키세요
3. 한국어로 자연스럽게 작성
4. 코드 블록(\`\`\`)은 응답에 포함하지 마세요, 순수 JSON만 반환`;

// ============================================
// 사용자 프롬프트 빌더
// ============================================

/**
 * 숙소 정보를 기반으로 사용자 프롬프트 생성
 */
export function buildUserPrompt(listingInfo: ListingInput): string {
  const parts: string[] = ['아래 숙소 정보를 바탕으로 가이드북 블록을 생성해주세요.', '', '## 숙소 정보'];

  // 필수 정보
  parts.push(`- **제목**: ${listingInfo.title}`);
  parts.push(`- **설명**: ${listingInfo.description}`);
  parts.push(`- **주소**: ${listingInfo.address}`);

  // 선택 정보
  if (listingInfo.propertyType) {
    parts.push(`- **숙소 유형**: ${listingInfo.propertyType}`);
  }

  if (listingInfo.hostName) {
    parts.push(`- **호스트**: ${listingInfo.hostName}`);
  }

  if (listingInfo.checkIn) {
    parts.push(`- **체크인 시간**: ${listingInfo.checkIn}`);
  }

  if (listingInfo.checkOut) {
    parts.push(`- **체크아웃 시간**: ${listingInfo.checkOut}`);
  }

  if (listingInfo.imageUrl) {
    parts.push(`- **대표 이미지**: ${listingInfo.imageUrl}`);
  }

  // 편의시설
  if (listingInfo.amenities.length > 0) {
    parts.push('');
    parts.push('## 편의시설');
    parts.push(listingInfo.amenities.map((a) => `- ${a}`).join('\n'));
  }

  // 숙소 규칙
  if (listingInfo.houseRules && listingInfo.houseRules.length > 0) {
    parts.push('');
    parts.push('## 숙소 규칙');
    parts.push(listingInfo.houseRules.map((r) => `- ${r}`).join('\n'));
  }

  parts.push('');
  parts.push('위 정보를 바탕으로 hero, quickInfo, amenities, rules, notice 블록을 생성해주세요.');
  parts.push('JSON 형식으로만 응답하고, 코드 블록은 사용하지 마세요.');

  return parts.join('\n');
}

// ============================================
// 헬퍼 함수
// ============================================

/**
 * 프롬프트 토큰 수 대략적 추정 (4자 = 1토큰)
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * 입력 데이터 검증
 */
export function validateListingInput(input: ListingInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.title || input.title.trim().length === 0) {
    errors.push('숙소 제목은 필수입니다');
  }

  if (!input.description || input.description.trim().length === 0) {
    errors.push('숙소 설명은 필수입니다');
  }

  if (!input.address || input.address.trim().length === 0) {
    errors.push('주소는 필수입니다');
  }

  if (!Array.isArray(input.amenities)) {
    errors.push('편의시설은 배열이어야 합니다');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
