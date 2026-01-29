// @TASK P3-T3.4 - 한국 여행 팁 템플릿
// @SPEC docs/planning/06-tasks.md#P3-T3.4

/**
 * 여행 팁 템플릿 타입
 */
export interface KoreanTipTemplate {
  id: string;
  category: KoreanTipCategory;
  title: string;
  titleEn: string;
  content: string;
  contentEn: string;
  icon: string;
  tags: string[];
}

/**
 * 여행 팁 카테고리
 */
export type KoreanTipCategory =
  | 'money'       // 돈/결제
  | 'communication' // 소통
  | 'etiquette'   // 에티켓
  | 'health'      // 건강
  | 'safety'      // 안전
  | 'seasonal'    // 계절별
  | 'local';      // 현지 정보

/**
 * 한국 여행 팁 템플릿 (20개 이상)
 * - 외국인 여행자에게 유용한 팁
 * - 한국 생활 적응에 도움되는 정보
 */
export const KOREAN_TIPS_TEMPLATES: Record<string, KoreanTipTemplate> = {
  // ========================================
  // 돈/결제 (Money)
  // ========================================
  cashlessPayment: {
    id: 'cashlessPayment',
    category: 'money',
    title: '카드 결제가 일상',
    titleEn: 'Card Payment is Common',
    content: '한국은 카드 결제가 매우 발달해 있습니다. 작은 금액도 카드로 결제 가능하며, 현금은 거의 필요 없습니다.',
    contentEn: 'Korea is highly cashless. Even small amounts can be paid by card. Cash is rarely needed.',
    icon: 'credit-card',
    tags: ['payment', 'card', 'cashless'],
  },
  mobilePayment: {
    id: 'mobilePayment',
    category: 'money',
    title: '모바일 결제',
    titleEn: 'Mobile Payment',
    content: '삼성페이, 카카오페이, 네이버페이 등 모바일 결제가 널리 사용됩니다.',
    contentEn: 'Samsung Pay, Kakao Pay, Naver Pay are widely used for mobile payments.',
    icon: 'smartphone',
    tags: ['payment', 'mobile', 'app'],
  },
  atmTips: {
    id: 'atmTips',
    category: 'money',
    title: 'ATM 이용 팁',
    titleEn: 'ATM Tips',
    content: '외국 카드는 "Global ATM" 표시가 있는 기기에서만 사용 가능합니다. 편의점, 은행에서 찾을 수 있습니다.',
    contentEn: 'Foreign cards work only at "Global ATM". Find them at convenience stores and banks.',
    icon: 'landmark',
    tags: ['atm', 'cash', 'bank'],
  },
  taxRefund: {
    id: 'taxRefund',
    category: 'money',
    title: '택스 리펀드',
    titleEn: 'Tax Refund',
    content: '외국인은 3만원 이상 구매 시 부가세 환급을 받을 수 있습니다. "Tax Free" 매장에서 여권을 제시하세요.',
    contentEn: 'Foreigners can get VAT refund on purchases over 30,000 KRW. Show passport at "Tax Free" shops.',
    icon: 'receipt',
    tags: ['tax', 'refund', 'shopping'],
  },

  // ========================================
  // 소통 (Communication)
  // ========================================
  koreanApps: {
    id: 'koreanApps',
    category: 'communication',
    title: '필수 앱',
    titleEn: 'Essential Apps',
    content: '카카오톡(메신저), 네이버 지도(길찾기), 파파고(번역)는 한국에서 필수 앱입니다.',
    contentEn: 'KakaoTalk (messenger), Naver Map (navigation), Papago (translation) are must-have apps in Korea.',
    icon: 'app-window',
    tags: ['app', 'kakao', 'naver'],
  },
  translationTips: {
    id: 'translationTips',
    category: 'communication',
    title: '번역 앱 활용',
    titleEn: 'Translation Apps',
    content: '파파고나 구글 번역으로 메뉴판, 안내문을 촬영하면 즉시 번역됩니다.',
    contentEn: 'Use Papago or Google Translate camera feature to instantly translate menus and signs.',
    icon: 'languages',
    tags: ['translation', 'papago', 'google'],
  },
  basicKorean: {
    id: 'basicKorean',
    category: 'communication',
    title: '기본 한국어',
    titleEn: 'Basic Korean Phrases',
    content: '안녕하세요(Hello), 감사합니다(Thank you), 주세요(Please give me), 얼마예요(How much) 정도만 알아도 유용합니다.',
    contentEn: 'Annyeonghaseyo (Hello), Gamsahamnida (Thank you), Juseyo (Please), Eolmaeyo (How much) are useful.',
    icon: 'message-circle',
    tags: ['korean', 'language', 'phrases'],
  },
  englishSupport: {
    id: 'englishSupport',
    category: 'communication',
    title: '영어 소통',
    titleEn: 'English Communication',
    content: '서울 관광지에서는 영어가 통하지만, 지역으로 가면 제한적입니다. 번역 앱을 준비하세요.',
    contentEn: 'English is common in Seoul tourist areas but limited elsewhere. Prepare translation apps.',
    icon: 'globe',
    tags: ['english', 'communication', 'language'],
  },

  // ========================================
  // 에티켓 (Etiquette)
  // ========================================
  diningEtiquette: {
    id: 'diningEtiquette',
    category: 'etiquette',
    title: '식사 에티켓',
    titleEn: 'Dining Etiquette',
    content: '어른이 먼저 먹기 시작하면 따라 먹습니다. 밥그릇을 들지 않고 먹는 것이 예의입니다.',
    contentEn: 'Wait for elders to start eating. Do not lift rice bowl - it\'s polite to leave it on the table.',
    icon: 'utensils-crossed',
    tags: ['dining', 'etiquette', 'manners'],
  },
  drinkingEtiquette: {
    id: 'drinkingEtiquette',
    category: 'etiquette',
    title: '음주 에티켓',
    titleEn: 'Drinking Etiquette',
    content: '어른 앞에서는 고개를 돌려 마시고, 빈 잔은 채워주는 것이 예의입니다.',
    contentEn: 'Turn away when drinking in front of elders. It\'s polite to refill others\' empty glasses.',
    icon: 'beer',
    tags: ['drinking', 'etiquette', 'manners'],
  },
  ageRespect: {
    id: 'ageRespect',
    category: 'etiquette',
    title: '연장자 공경',
    titleEn: 'Respect for Elders',
    content: '한국에서는 나이가 중요합니다. 연장자에게는 존댓말을 사용하고, 양손으로 물건을 드립니다.',
    contentEn: 'Age matters in Korea. Use formal language with elders and hand things with both hands.',
    icon: 'users',
    tags: ['respect', 'elders', 'age'],
  },
  publicBehavior: {
    id: 'publicBehavior',
    category: 'etiquette',
    title: '공공장소 매너',
    titleEn: 'Public Manners',
    content: '지하철에서 큰 소리로 통화하거나 음식을 먹는 것은 자제해주세요. 노약자석은 비워두세요.',
    contentEn: 'Avoid loud calls and eating on subways. Leave priority seats for those who need them.',
    icon: 'volume-off',
    tags: ['public', 'manners', 'subway'],
  },

  // ========================================
  // 건강 (Health)
  // ========================================
  drinkingWater: {
    id: 'drinkingWater',
    category: 'health',
    title: '물 마시기',
    titleEn: 'Drinking Water',
    content: '수돗물은 안전하지만 맛이 다를 수 있습니다. 편의점에서 생수를 쉽게 구할 수 있습니다.',
    contentEn: 'Tap water is safe but may taste different. Bottled water is available at convenience stores.',
    icon: 'droplet',
    tags: ['water', 'health', 'safety'],
  },
  maskCulture: {
    id: 'maskCulture',
    category: 'health',
    title: '마스크 문화',
    titleEn: 'Mask Culture',
    content: '한국인들은 감기, 미세먼지, 황사 때 마스크를 착용합니다. 편의점, 약국에서 구매 가능합니다.',
    contentEn: 'Koreans wear masks for colds, fine dust, and yellow dust. Buy at convenience stores or pharmacies.',
    icon: 'shield',
    tags: ['mask', 'health', 'dust'],
  },
  healthCare: {
    id: 'healthCare',
    category: 'health',
    title: '의료 서비스',
    titleEn: 'Healthcare',
    content: '한국 의료 서비스는 우수하고 저렴합니다. 국제 클리닉에서는 영어 진료가 가능합니다.',
    contentEn: 'Korean healthcare is excellent and affordable. International clinics offer English services.',
    icon: 'stethoscope',
    tags: ['hospital', 'clinic', 'health'],
  },

  // ========================================
  // 안전 (Safety)
  // ========================================
  nightSafety: {
    id: 'nightSafety',
    category: 'safety',
    title: '야간 안전',
    titleEn: 'Night Safety',
    content: '한국은 밤에도 안전한 나라입니다. 편의점, 식당이 늦게까지 열려 있어 밤에 돌아다녀도 괜찮습니다.',
    contentEn: 'Korea is safe at night. Convenience stores and restaurants stay open late.',
    icon: 'moon-star',
    tags: ['night', 'safety', 'security'],
  },
  scamAwareness: {
    id: 'scamAwareness',
    category: 'safety',
    title: '사기 주의',
    titleEn: 'Scam Awareness',
    content: '바가지 요금은 드물지만, 관광지에서는 가격을 미리 확인하세요. 택시는 미터기 사용을 확인하세요.',
    contentEn: 'Overcharging is rare but check prices at tourist spots. Make sure taxis use the meter.',
    icon: 'shield-alert',
    tags: ['scam', 'safety', 'taxi'],
  },
  valuables: {
    id: 'valuables',
    category: 'safety',
    title: '귀중품 관리',
    titleEn: 'Valuables',
    content: '한국은 안전하지만 귀중품은 항상 잘 챙기세요. 카페에서 자리 맡기용으로 물건을 두는 것이 흔합니다.',
    contentEn: 'Korea is safe but watch valuables. Leaving items to save seats in cafes is common.',
    icon: 'gem',
    tags: ['valuables', 'safety', 'cafe'],
  },

  // ========================================
  // 계절별 (Seasonal)
  // ========================================
  springTips: {
    id: 'springTips',
    category: 'seasonal',
    title: '봄철 팁 (3-5월)',
    titleEn: 'Spring Tips (Mar-May)',
    content: '벚꽃 시즌(4월)은 매우 아름답습니다. 다만 황사/미세먼지가 심할 수 있어 마스크를 챙기세요.',
    contentEn: 'Cherry blossom season (April) is beautiful. Yellow dust/fine dust can be bad - bring masks.',
    icon: 'flower-2',
    tags: ['spring', 'cherry', 'dust'],
  },
  summerTips: {
    id: 'summerTips',
    category: 'seasonal',
    title: '여름철 팁 (6-8월)',
    titleEn: 'Summer Tips (Jun-Aug)',
    content: '장마철(6-7월)과 무더위(7-8월)에 대비하세요. 우산과 선크림은 필수입니다.',
    contentEn: 'Prepare for monsoon (Jun-Jul) and heat (Jul-Aug). Umbrella and sunscreen are essential.',
    icon: 'sun',
    tags: ['summer', 'monsoon', 'heat'],
  },
  fallTips: {
    id: 'fallTips',
    category: 'seasonal',
    title: '가을철 팁 (9-11월)',
    titleEn: 'Fall Tips (Sep-Nov)',
    content: '단풍 시즌(10-11월)이 아름답습니다. 아침저녁 일교차가 크니 겉옷을 챙기세요.',
    contentEn: 'Fall foliage (Oct-Nov) is stunning. Temperature varies greatly - bring layers.',
    icon: 'leaf',
    tags: ['fall', 'foliage', 'weather'],
  },
  winterTips: {
    id: 'winterTips',
    category: 'seasonal',
    title: '겨울철 팁 (12-2월)',
    titleEn: 'Winter Tips (Dec-Feb)',
    content: '겨울은 춥고 건조합니다(-10~5도). 따뜻한 옷과 보습제를 준비하세요. 온돌 난방이 따뜻합니다.',
    contentEn: 'Winter is cold and dry (-10~5°C). Bring warm clothes and moisturizer. Ondol heating is cozy.',
    icon: 'snowflake',
    tags: ['winter', 'cold', 'ondol'],
  },

  // ========================================
  // 현지 정보 (Local)
  // ========================================
  seoulSubway: {
    id: 'seoulSubway',
    category: 'local',
    title: '서울 지하철',
    titleEn: 'Seoul Subway',
    content: '서울 지하철은 깨끗하고 효율적입니다. 영어 안내 방송과 표지판이 있어 이용하기 쉽습니다.',
    contentEn: 'Seoul subway is clean and efficient. English announcements and signs make it easy to use.',
    icon: 'train-track',
    tags: ['seoul', 'subway', 'transport'],
  },
  koreanBBQ: {
    id: 'koreanBBQ',
    category: 'local',
    title: '한국 BBQ 팁',
    titleEn: 'Korean BBQ Tips',
    content: '고기집에서는 직원이 고기를 구워주는 경우도 있습니다. 상추에 싸먹는 쌈 문화를 즐겨보세요.',
    contentEn: 'Staff may grill meat for you at BBQ restaurants. Try "ssam" - wrapping meat in lettuce.',
    icon: 'flame',
    tags: ['bbq', 'food', 'restaurant'],
  },
  busanBeach: {
    id: 'busanBeach',
    category: 'local',
    title: '부산 해변',
    titleEn: 'Busan Beaches',
    content: '부산은 해운대, 광안리 해변이 유명합니다. 여름에는 매우 붐비니 아침 일찍 가세요.',
    contentEn: 'Busan\'s Haeundae and Gwangalli beaches are famous. Visit early in summer to avoid crowds.',
    icon: 'umbrella',
    tags: ['busan', 'beach', 'travel'],
  },
  jejuIsland: {
    id: 'jejuIsland',
    category: 'local',
    title: '제주도 여행',
    titleEn: 'Jeju Island',
    content: '제주도는 국내선으로 1시간 거리입니다. 렌터카 없이는 이동이 어려우니 미리 예약하세요.',
    contentEn: 'Jeju is 1 hour by domestic flight. Rent a car in advance - it\'s hard to get around without one.',
    icon: 'mountain',
    tags: ['jeju', 'island', 'travel'],
  },
};

/**
 * 카테고리별 팁 그룹핑
 */
export const KOREAN_TIPS_BY_CATEGORY: Record<KoreanTipCategory, string[]> = {
  money: ['cashlessPayment', 'mobilePayment', 'atmTips', 'taxRefund'],
  communication: ['koreanApps', 'translationTips', 'basicKorean', 'englishSupport'],
  etiquette: ['diningEtiquette', 'drinkingEtiquette', 'ageRespect', 'publicBehavior'],
  health: ['drinkingWater', 'maskCulture', 'healthCare'],
  safety: ['nightSafety', 'scamAwareness', 'valuables'],
  seasonal: ['springTips', 'summerTips', 'fallTips', 'winterTips'],
  local: ['seoulSubway', 'koreanBBQ', 'busanBeach', 'jejuIsland'],
};

/**
 * 카테고리 이름 (한국어/영어)
 */
export const KOREAN_TIP_CATEGORY_NAMES: Record<KoreanTipCategory, { ko: string; en: string }> = {
  money: { ko: '돈/결제', en: 'Money & Payment' },
  communication: { ko: '소통', en: 'Communication' },
  etiquette: { ko: '에티켓', en: 'Etiquette' },
  health: { ko: '건강', en: 'Health' },
  safety: { ko: '안전', en: 'Safety' },
  seasonal: { ko: '계절별 정보', en: 'Seasonal Info' },
  local: { ko: '현지 정보', en: 'Local Info' },
};

/**
 * 첫 방문 여행자를 위한 필수 팁
 */
export const ESSENTIAL_KOREAN_TIPS = [
  'cashlessPayment',
  'koreanApps',
  'basicKorean',
  'diningEtiquette',
  'nightSafety',
] as const;

/**
 * 팁 ID 배열을 상세 정보로 변환
 */
export function getTipsDetails(tipIds: string[]): KoreanTipTemplate[] {
  return tipIds
    .filter((id) => id in KOREAN_TIPS_TEMPLATES)
    .map((id) => KOREAN_TIPS_TEMPLATES[id]);
}

/**
 * 태그로 팁 검색
 */
export function getTipsByTag(tag: string): KoreanTipTemplate[] {
  return Object.values(KOREAN_TIPS_TEMPLATES).filter((tip) =>
    tip.tags.includes(tag.toLowerCase())
  );
}

/**
 * 현재 계절에 맞는 팁 반환
 */
export function getSeasonalTip(): KoreanTipTemplate {
  const month = new Date().getMonth() + 1; // 1-12

  if (month >= 3 && month <= 5) {
    return KOREAN_TIPS_TEMPLATES.springTips;
  } else if (month >= 6 && month <= 8) {
    return KOREAN_TIPS_TEMPLATES.summerTips;
  } else if (month >= 9 && month <= 11) {
    return KOREAN_TIPS_TEMPLATES.fallTips;
  } else {
    return KOREAN_TIPS_TEMPLATES.winterTips;
  }
}
