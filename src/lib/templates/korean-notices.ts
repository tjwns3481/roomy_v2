// @TASK P3-T3.4 - 한국 특화 공지사항 템플릿
// @SPEC docs/planning/06-tasks.md#P3-T3.4

/**
 * 공지사항 템플릿 타입
 */
export interface KoreanNoticeTemplate {
  id: string;
  type: 'info' | 'warning' | 'tip' | 'success';
  title: string;
  titleEn: string;
  content: string;
  contentEn: string;
  icon: string;
  contacts?: {
    name: string;
    nameEn: string;
    number: string;
  }[];
  links?: {
    name: string;
    nameEn: string;
    url: string;
  }[];
}

/**
 * 공지사항 카테고리
 */
export type KoreanNoticeCategory =
  | 'emergency'    // 긴급 상황
  | 'transport'    // 교통
  | 'shopping'     // 쇼핑
  | 'food'         // 음식
  | 'culture'      // 문화
  | 'practical';   // 실용 정보

/**
 * 한국 공지사항 템플릿 (15개 이상)
 * - 외국인 게스트에게 유용한 정보 중심
 * - 한국 생활에 필요한 실용 정보 포함
 */
export const KOREAN_NOTICE_TEMPLATES: Record<string, KoreanNoticeTemplate> = {
  // ========================================
  // 긴급 상황 (Emergency)
  // ========================================
  emergency: {
    id: 'emergency',
    type: 'warning',
    title: '긴급 연락처',
    titleEn: 'Emergency Contacts',
    content: '긴급 상황 시 아래 번호로 연락하세요.',
    contentEn: 'In case of emergency, contact the following numbers.',
    icon: 'phone-call',
    contacts: [
      { name: '경찰', nameEn: 'Police', number: '112' },
      { name: '소방/응급', nameEn: 'Fire/Ambulance', number: '119' },
      { name: '외국인 헬프라인', nameEn: 'Foreigner Helpline', number: '1345' },
      { name: '관광 안내', nameEn: 'Tourist Info', number: '1330' },
    ],
  },
  medicalEmergency: {
    id: 'medicalEmergency',
    type: 'warning',
    title: '의료 응급 상황',
    titleEn: 'Medical Emergency',
    content: '응급 상황 시 119로 전화하세요. 영어 통역 서비스를 요청할 수 있습니다.',
    contentEn: 'Call 119 for emergencies. English interpretation is available upon request.',
    icon: 'heart-pulse',
    contacts: [
      { name: '응급실', nameEn: 'Emergency', number: '119' },
      { name: '국제 클리닉 찾기', nameEn: 'Find International Clinic', number: '1339' },
    ],
  },
  naturalDisaster: {
    id: 'naturalDisaster',
    type: 'warning',
    title: '재난 대비 안내',
    titleEn: 'Natural Disaster Guide',
    content: '지진, 태풍 등 재난 발생 시 안전 수칙을 따라주세요. 대피 장소를 미리 확인해두세요.',
    contentEn: 'Follow safety guidelines during earthquakes, typhoons, etc. Know your evacuation routes.',
    icon: 'alert-triangle',
  },

  // ========================================
  // 교통 (Transport)
  // ========================================
  publicTransport: {
    id: 'publicTransport',
    type: 'info',
    title: '대중교통 안내',
    titleEn: 'Public Transportation',
    content: '지하철, 버스는 T-money 카드를 이용하세요. 편의점에서 구매/충전 가능합니다.',
    contentEn: 'Use T-money card for subway and bus. Available at convenience stores.',
    icon: 'train',
    links: [
      { name: '네이버 지도', nameEn: 'Naver Map', url: 'https://map.naver.com' },
      { name: '카카오맵', nameEn: 'Kakao Map', url: 'https://map.kakao.com' },
    ],
  },
  taxi: {
    id: 'taxi',
    type: 'tip',
    title: '택시 이용 팁',
    titleEn: 'Taxi Tips',
    content: '카카오택시 앱을 추천합니다. 영어 지원되며 목적지 입력이 편리합니다. 밤에는 심야 요금이 적용됩니다.',
    contentEn: 'Use Kakao Taxi app. English supported, easy destination input. Late-night surcharge applies.',
    icon: 'car',
    links: [
      { name: '카카오택시', nameEn: 'Kakao Taxi', url: 'https://www.kakaomobility.com' },
    ],
  },
  airport: {
    id: 'airport',
    type: 'info',
    title: '공항 교통',
    titleEn: 'Airport Transportation',
    content: '인천공항에서 서울까지 공항철도(AREX), 리무진 버스, 택시를 이용할 수 있습니다.',
    contentEn: 'From Incheon Airport to Seoul: AREX train, limousine bus, or taxi available.',
    icon: 'plane',
  },
  subwayTips: {
    id: 'subwayTips',
    type: 'tip',
    title: '지하철 이용 팁',
    titleEn: 'Subway Tips',
    content: '출퇴근 시간(7-9시, 18-20시)은 매우 혼잡합니다. 여성 전용칸은 첫 번째 칸입니다.',
    contentEn: 'Rush hours (7-9 AM, 6-8 PM) are very crowded. Women-only car is the first car.',
    icon: 'train-front',
  },

  // ========================================
  // 쇼핑 (Shopping)
  // ========================================
  convenienceStore: {
    id: 'convenienceStore',
    type: 'info',
    title: '편의점 안내',
    titleEn: 'Convenience Stores',
    content: 'GS25, CU, 세븐일레븐이 24시간 운영됩니다. ATM, 택배, 공과금 납부 등 다양한 서비스를 제공합니다.',
    contentEn: 'GS25, CU, 7-Eleven open 24/7. ATM, delivery, bill payment services available.',
    icon: 'store',
  },
  mart: {
    id: 'mart',
    type: 'info',
    title: '마트/슈퍼마켓',
    titleEn: 'Supermarkets',
    content: '이마트, 홈플러스, 롯데마트에서 식료품과 생필품을 구매할 수 있습니다. 일요일은 의무 휴무일인 곳이 많습니다.',
    contentEn: 'E-Mart, Homeplus, Lotte Mart for groceries. Many close on Sundays (mandatory rest day).',
    icon: 'shopping-cart',
  },
  delivery: {
    id: 'delivery',
    type: 'tip',
    title: '배달 앱',
    titleEn: 'Delivery Apps',
    content: '배달의민족, 쿠팡이츠로 음식을 주문할 수 있습니다. 영어 지원이 제한적이니 구글 번역 활용을 권장합니다.',
    contentEn: 'Use Baemin or Coupang Eats for food delivery. English support limited - use Google Translate.',
    icon: 'bike',
    links: [
      { name: '배달의민족', nameEn: 'Baedal Minjok', url: 'https://www.baemin.com' },
      { name: '쿠팡이츠', nameEn: 'Coupang Eats', url: 'https://www.coupangeats.com' },
    ],
  },

  // ========================================
  // 음식 (Food)
  // ========================================
  localFood: {
    id: 'localFood',
    type: 'tip',
    title: '한국 음식 추천',
    titleEn: 'Korean Food Recommendations',
    content: '근처 맛집을 찾으려면 네이버 지도나 카카오맵에서 "맛집"을 검색하세요. 별점과 리뷰를 참고하세요.',
    contentEn: 'Search "맛집" (restaurant) on Naver Map or Kakao Map. Check ratings and reviews.',
    icon: 'utensils',
  },
  waterSafety: {
    id: 'waterSafety',
    type: 'info',
    title: '식수 안내',
    titleEn: 'Drinking Water',
    content: '한국 수돗물은 마실 수 있지만, 대부분의 한국인은 정수기 물을 선호합니다. 숙소에 정수기가 있습니다.',
    contentEn: 'Tap water is safe but most Koreans prefer filtered water. Water purifier is available.',
    icon: 'glass-water',
  },
  allergies: {
    id: 'allergies',
    type: 'warning',
    title: '알레르기 주의',
    titleEn: 'Allergy Alert',
    content: '한국 음식에는 간장, 참기름, 고춧가루, 마늘이 많이 사용됩니다. 알레르기가 있으면 미리 확인하세요.',
    contentEn: 'Korean food often contains soy sauce, sesame oil, chili, and garlic. Check for allergies.',
    icon: 'alert-circle',
  },

  // ========================================
  // 문화 (Culture)
  // ========================================
  bowing: {
    id: 'bowing',
    type: 'tip',
    title: '인사 문화',
    titleEn: 'Greeting Culture',
    content: '한국에서는 고개를 숙여 인사합니다. 연장자에게는 양손으로 물건을 드리는 것이 예의입니다.',
    contentEn: 'Koreans bow to greet. Use both hands when giving/receiving from elders - it\'s polite.',
    icon: 'hand-helping',
  },
  shoes: {
    id: 'shoes',
    type: 'info',
    title: '신발 문화',
    titleEn: 'Shoe Culture',
    content: '한국 가정, 일부 식당, 사찰에서는 신발을 벗습니다. 입구에 신발장이 있으면 벗어주세요.',
    contentEn: 'Remove shoes in homes, some restaurants, and temples. If there\'s a shoe rack, take them off.',
    icon: 'footprints',
  },
  tipping: {
    id: 'tipping',
    type: 'info',
    title: '팁 문화',
    titleEn: 'Tipping Culture',
    content: '한국에서는 팁을 주지 않습니다. 서비스료는 가격에 포함되어 있습니다.',
    contentEn: 'Tipping is not customary in Korea. Service charges are included in prices.',
    icon: 'wallet',
  },

  // ========================================
  // 실용 정보 (Practical)
  // ========================================
  wifi: {
    id: 'wifi',
    type: 'info',
    title: 'Wi-Fi 정보',
    titleEn: 'Wi-Fi Information',
    content: '한국은 공공 와이파이가 잘 되어 있습니다. 지하철, 카페, 공공장소에서 무료로 이용 가능합니다.',
    contentEn: 'Korea has excellent public Wi-Fi. Free in subways, cafes, and public spaces.',
    icon: 'wifi',
  },
  electricity: {
    id: 'electricity',
    type: 'info',
    title: '전기/콘센트',
    titleEn: 'Electricity & Outlets',
    content: '한국은 220V, Type C/F 플러그를 사용합니다. 110V 기기는 변압기가 필요합니다.',
    contentEn: 'Korea uses 220V with Type C/F plugs. 110V devices need a voltage converter.',
    icon: 'plug',
  },
  pharmacy: {
    id: 'pharmacy',
    type: 'info',
    title: '약국 이용',
    titleEn: 'Pharmacy',
    content: '약국(약)은 녹색 십자가 표시입니다. 처방전 없이 일반 약품 구매 가능합니다.',
    contentEn: 'Pharmacies have green cross signs. OTC medicines available without prescription.',
    icon: 'pill',
  },
  weather: {
    id: 'weather',
    type: 'tip',
    title: '날씨 정보',
    titleEn: 'Weather Info',
    content: '한국은 사계절이 뚜렷합니다. 여름(6-8월)은 덥고 습하며, 겨울(12-2월)은 춥고 건조합니다.',
    contentEn: 'Korea has four distinct seasons. Summer (Jun-Aug) is hot and humid, winter (Dec-Feb) is cold and dry.',
    icon: 'cloud-sun',
  },
  currency: {
    id: 'currency',
    type: 'info',
    title: '화폐/환전',
    titleEn: 'Currency & Exchange',
    content: '한국 화폐는 원(KRW)입니다. 신용카드가 거의 모든 곳에서 사용 가능합니다. 환전은 은행이나 환전소에서.',
    contentEn: 'Korean currency is Won (KRW). Credit cards accepted almost everywhere. Exchange at banks or exchange booths.',
    icon: 'banknote',
  },
};

/**
 * 카테고리별 공지사항 그룹핑
 */
export const KOREAN_NOTICES_BY_CATEGORY: Record<KoreanNoticeCategory, string[]> = {
  emergency: ['emergency', 'medicalEmergency', 'naturalDisaster'],
  transport: ['publicTransport', 'taxi', 'airport', 'subwayTips'],
  shopping: ['convenienceStore', 'mart', 'delivery'],
  food: ['localFood', 'waterSafety', 'allergies'],
  culture: ['bowing', 'shoes', 'tipping'],
  practical: ['wifi', 'electricity', 'pharmacy', 'weather', 'currency'],
};

/**
 * 카테고리 이름 (한국어/영어)
 */
export const KOREAN_NOTICE_CATEGORY_NAMES: Record<KoreanNoticeCategory, { ko: string; en: string }> = {
  emergency: { ko: '긴급 상황', en: 'Emergency' },
  transport: { ko: '교통', en: 'Transportation' },
  shopping: { ko: '쇼핑', en: 'Shopping' },
  food: { ko: '음식', en: 'Food' },
  culture: { ko: '문화', en: 'Culture' },
  practical: { ko: '실용 정보', en: 'Practical Info' },
};

/**
 * 필수 공지사항 (모든 가이드북에서 표시 권장)
 */
export const ESSENTIAL_KOREAN_NOTICES = [
  'emergency',
  'publicTransport',
  'convenienceStore',
  'wifi',
] as const;

/**
 * 공지사항 ID 배열을 상세 정보로 변환
 */
export function getNoticesDetails(noticeIds: string[]): KoreanNoticeTemplate[] {
  return noticeIds
    .filter((id) => id in KOREAN_NOTICE_TEMPLATES)
    .map((id) => KOREAN_NOTICE_TEMPLATES[id]);
}

/**
 * 타입별 공지사항 필터링
 */
export function getNoticesByType(type: KoreanNoticeTemplate['type']): KoreanNoticeTemplate[] {
  return Object.values(KOREAN_NOTICE_TEMPLATES).filter((notice) => notice.type === type);
}
