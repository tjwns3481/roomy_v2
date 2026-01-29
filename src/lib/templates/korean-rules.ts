// @TASK P3-T3.4 - 한국 특화 이용 규칙 템플릿
// @SPEC docs/planning/06-tasks.md#P3-T3.4

/**
 * 이용 규칙 템플릿 타입
 */
export interface KoreanRuleTemplate {
  id: string;
  title: string;
  titleEn: string;
  content: string;
  contentEn: string;
  icon: string;
  isImportant: boolean;
  subcategories?: {
    name: string;
    nameEn: string;
    note: string;
    noteEn: string;
  }[];
}

/**
 * 이용 규칙 카테고리
 */
export type KoreanRuleCategory =
  | 'noise'      // 소음
  | 'waste'      // 쓰레기
  | 'smoking'    // 흡연
  | 'manners'    // 예절
  | 'checkout'   // 체크아웃
  | 'safety'     // 안전
  | 'others';    // 기타

/**
 * 한국 이용 규칙 템플릿 (15개 이상)
 * - 한국 공동주택에서 중요한 규칙 중심
 * - 외국인 게스트가 알아야 할 사항 포함
 */
export const KOREAN_RULES_TEMPLATES: Record<string, KoreanRuleTemplate> = {
  // ========================================
  // 소음 관련 (Noise)
  // ========================================
  noisePolicy: {
    id: 'noisePolicy',
    title: '층간소음 주의',
    titleEn: 'Floor Noise Policy',
    content: '밤 10시 이후에는 조용히 해주세요. 아파트/빌라는 층간소음에 민감합니다. 뛰거나 큰 소리를 내지 말아주세요.',
    contentEn: 'Please keep quiet after 10 PM. Korean apartments are sensitive to floor noise. Avoid running or making loud noises.',
    icon: 'volume-x',
    isImportant: true,
  },
  quietHours: {
    id: 'quietHours',
    title: '심야 시간 정숙',
    titleEn: 'Quiet Hours',
    content: '밤 10시 ~ 아침 8시는 정숙 시간입니다. TV, 음악, 대화 소리를 낮춰주세요.',
    contentEn: 'Quiet hours are from 10 PM to 8 AM. Please lower TV, music, and conversation volume.',
    icon: 'moon',
    isImportant: true,
  },
  partyProhibited: {
    id: 'partyProhibited',
    title: '파티 금지',
    titleEn: 'No Parties',
    content: '파티나 대규모 모임은 금지되어 있습니다. 예약 인원만 숙박 가능합니다.',
    contentEn: 'Parties and large gatherings are prohibited. Only registered guests may stay.',
    icon: 'users-round',
    isImportant: true,
  },

  // ========================================
  // 쓰레기/분리수거 (Waste)
  // ========================================
  recycling: {
    id: 'recycling',
    title: '분리수거 안내',
    titleEn: 'Recycling Guide',
    content: '한국은 분리수거가 필수입니다. 쓰레기를 올바르게 분리해주세요.',
    contentEn: 'Recycling is mandatory in Korea. Please separate waste properly.',
    icon: 'recycle',
    isImportant: true,
    subcategories: [
      { name: '일반쓰레기', nameEn: 'General Waste', note: '종량제 봉투 사용', noteEn: 'Use designated bags' },
      { name: '음식물쓰레기', nameEn: 'Food Waste', note: '별도 용기에 배출', noteEn: 'Separate container' },
      { name: '플라스틱', nameEn: 'Plastic', note: '라벨 제거 후 분리', noteEn: 'Remove labels' },
      { name: '종이', nameEn: 'Paper', note: '접어서 묶음', noteEn: 'Fold and bundle' },
      { name: '캔/병', nameEn: 'Cans/Bottles', note: '헹궈서 분리', noteEn: 'Rinse before recycling' },
    ],
  },
  foodWaste: {
    id: 'foodWaste',
    title: '음식물 쓰레기',
    titleEn: 'Food Waste Disposal',
    content: '음식물 쓰레기는 별도 용기에 담아 배출해주세요. 국물은 제거하고, 비닐/플라스틱은 넣지 마세요.',
    contentEn: 'Put food waste in separate container. Drain liquids and do not include plastic or vinyl.',
    icon: 'trash-2',
    isImportant: false,
  },
  wasteSchedule: {
    id: 'wasteSchedule',
    title: '쓰레기 배출 시간',
    titleEn: 'Waste Disposal Schedule',
    content: '쓰레기는 정해진 시간(저녁 6시~밤 12시)에 지정 장소에 배출해주세요.',
    contentEn: 'Dispose of waste at designated area during allowed hours (6 PM - 12 AM).',
    icon: 'clock',
    isImportant: false,
  },

  // ========================================
  // 흡연 (Smoking)
  // ========================================
  noSmoking: {
    id: 'noSmoking',
    title: '실내 흡연 금지',
    titleEn: 'No Smoking Indoors',
    content: '실내 흡연은 법으로 금지되어 있습니다. 베란다 또는 지정된 흡연 구역을 이용해주세요.',
    contentEn: 'Indoor smoking is prohibited by law. Use the balcony or designated smoking area.',
    icon: 'cigarette-off',
    isImportant: true,
  },
  smokingArea: {
    id: 'smokingArea',
    title: '흡연 구역 안내',
    titleEn: 'Smoking Area',
    content: '흡연은 건물 외부 지정 구역에서만 가능합니다. 꽁초는 재떨이에 버려주세요.',
    contentEn: 'Smoking allowed only in outdoor designated areas. Dispose cigarette butts in ashtrays.',
    icon: 'cigarette',
    isImportant: false,
  },

  // ========================================
  // 예절/매너 (Manners)
  // ========================================
  shoesOff: {
    id: 'shoesOff',
    title: '실내에서 신발 벗기',
    titleEn: 'Remove Shoes Indoors',
    content: '한국 가정에서는 실내에서 신발을 벗습니다. 현관에서 실내화로 갈아신어 주세요.',
    contentEn: 'Remove shoes at the entrance in Korean homes. Please use indoor slippers provided.',
    icon: 'footprints',
    isImportant: true,
  },
  neighborRespect: {
    id: 'neighborRespect',
    title: '이웃 배려',
    titleEn: 'Respect Neighbors',
    content: '복도나 엘리베이터에서 이웃을 만나면 가볍게 인사해주세요. 한국인들은 이웃 간 예의를 중요시합니다.',
    contentEn: 'Greet neighbors in hallways and elevators. Koreans value neighborly courtesy.',
    icon: 'heart-handshake',
    isImportant: false,
  },
  entranceEtiquette: {
    id: 'entranceEtiquette',
    title: '현관 사용 예절',
    titleEn: 'Entrance Etiquette',
    content: '현관문을 열어놓지 마세요. 닫힘 확인 후 이동해주세요.',
    contentEn: 'Do not leave the entrance door open. Make sure it is closed before leaving.',
    icon: 'door-open',
    isImportant: false,
  },

  // ========================================
  // 체크아웃 (Checkout)
  // ========================================
  checkoutTime: {
    id: 'checkoutTime',
    title: '체크아웃 시간',
    titleEn: 'Checkout Time',
    content: '체크아웃은 오전 11시까지입니다. 늦은 체크아웃은 사전 협의가 필요합니다.',
    contentEn: 'Checkout by 11 AM. Late checkout requires prior arrangement.',
    icon: 'log-out',
    isImportant: true,
  },
  checkoutChecklist: {
    id: 'checkoutChecklist',
    title: '체크아웃 체크리스트',
    titleEn: 'Checkout Checklist',
    content: '체크아웃 전 다음 사항을 확인해주세요: 창문 닫기, 에어컨/난방 끄기, 쓰레기 분리, 사용한 물건 제자리.',
    contentEn: 'Before checkout: Close windows, turn off AC/heating, separate trash, return items.',
    icon: 'clipboard-check',
    isImportant: false,
  },
  keyReturn: {
    id: 'keyReturn',
    title: '열쇠/카드키 반납',
    titleEn: 'Key Return',
    content: '체크아웃 시 열쇠나 카드키를 지정 장소에 반납해주세요.',
    contentEn: 'Return keys or card keys to designated location at checkout.',
    icon: 'key',
    isImportant: false,
  },

  // ========================================
  // 안전 (Safety)
  // ========================================
  fireExit: {
    id: 'fireExit',
    title: '비상 대피로',
    titleEn: 'Emergency Exit',
    content: '비상 대피로 위치를 확인해두세요. 화재 시 엘리베이터 사용을 금지합니다.',
    contentEn: 'Know the emergency exit location. Do not use elevator during fire.',
    icon: 'door-closed',
    isImportant: true,
  },
  gasValve: {
    id: 'gasValve',
    title: '가스 밸브',
    titleEn: 'Gas Valve',
    content: '외출 시 가스 밸브를 잠가주세요. 가스 냄새가 나면 창문을 열고 119에 신고하세요.',
    contentEn: 'Turn off gas valve when leaving. If you smell gas, open windows and call 119.',
    icon: 'flame',
    isImportant: true,
  },
  electricSafety: {
    id: 'electricSafety',
    title: '전기 안전',
    titleEn: 'Electrical Safety',
    content: '사용하지 않는 전자기기는 플러그를 뽑아주세요. 멀티탭 과부하에 주의하세요.',
    contentEn: 'Unplug unused appliances. Avoid overloading power strips.',
    icon: 'zap',
    isImportant: false,
  },
  emergencyContacts: {
    id: 'emergencyContacts',
    title: '긴급 연락처',
    titleEn: 'Emergency Contacts',
    content: '긴급 상황 시: 경찰 112, 소방/응급 119, 외국인 헬프라인 1345',
    contentEn: 'Emergency: Police 112, Fire/Ambulance 119, Foreigner Helpline 1345',
    icon: 'phone',
    isImportant: true,
  },

  // ========================================
  // 기타 (Others)
  // ========================================
  petsPolicy: {
    id: 'petsPolicy',
    title: '반려동물 정책',
    titleEn: 'Pet Policy',
    content: '반려동물 동반은 사전 협의가 필요합니다. 무단 동반 시 추가 요금이 발생합니다.',
    contentEn: 'Pets require prior approval. Unauthorized pets will incur extra charges.',
    icon: 'paw-print',
    isImportant: false,
  },
  additionalGuests: {
    id: 'additionalGuests',
    title: '추가 인원',
    titleEn: 'Additional Guests',
    content: '예약 인원 외 추가 방문객은 금지됩니다. 추가 인원은 호스트에게 미리 알려주세요.',
    contentEn: 'Visitors beyond registered guests are not allowed. Notify host for any additions.',
    icon: 'user-plus',
    isImportant: false,
  },
  photographyPolicy: {
    id: 'photographyPolicy',
    title: '촬영 정책',
    titleEn: 'Photography Policy',
    content: '상업적 촬영은 사전 허가가 필요합니다. 개인 사진은 자유롭게 찍으셔도 됩니다.',
    contentEn: 'Commercial photography requires permission. Personal photos are welcome.',
    icon: 'camera',
    isImportant: false,
  },
};

/**
 * 카테고리별 규칙 그룹핑
 */
export const KOREAN_RULES_BY_CATEGORY: Record<KoreanRuleCategory, string[]> = {
  noise: ['noisePolicy', 'quietHours', 'partyProhibited'],
  waste: ['recycling', 'foodWaste', 'wasteSchedule'],
  smoking: ['noSmoking', 'smokingArea'],
  manners: ['shoesOff', 'neighborRespect', 'entranceEtiquette'],
  checkout: ['checkoutTime', 'checkoutChecklist', 'keyReturn'],
  safety: ['fireExit', 'gasValve', 'electricSafety', 'emergencyContacts'],
  others: ['petsPolicy', 'additionalGuests', 'photographyPolicy'],
};

/**
 * 카테고리 이름 (한국어/영어)
 */
export const KOREAN_RULE_CATEGORY_NAMES: Record<KoreanRuleCategory, { ko: string; en: string }> = {
  noise: { ko: '소음 규칙', en: 'Noise Rules' },
  waste: { ko: '쓰레기/분리수거', en: 'Waste & Recycling' },
  smoking: { ko: '흡연 규칙', en: 'Smoking Rules' },
  manners: { ko: '예절/매너', en: 'Etiquette' },
  checkout: { ko: '체크아웃', en: 'Checkout' },
  safety: { ko: '안전', en: 'Safety' },
  others: { ko: '기타', en: 'Others' },
};

/**
 * 필수 규칙 목록 (모든 숙소에서 표시 권장)
 */
export const ESSENTIAL_KOREAN_RULES = [
  'noisePolicy',
  'recycling',
  'noSmoking',
  'shoesOff',
  'checkoutTime',
  'emergencyContacts',
] as const;

/**
 * 규칙 ID 배열을 상세 정보로 변환
 */
export function getRulesDetails(ruleIds: string[]): KoreanRuleTemplate[] {
  return ruleIds
    .filter((id) => id in KOREAN_RULES_TEMPLATES)
    .map((id) => KOREAN_RULES_TEMPLATES[id]);
}

/**
 * 체크아웃 체크리스트 기본 항목
 */
export const DEFAULT_CHECKOUT_CHECKLIST = [
  { ko: '창문 모두 닫기', en: 'Close all windows' },
  { ko: '에어컨/난방 끄기', en: 'Turn off AC/heating' },
  { ko: '조명 끄기', en: 'Turn off lights' },
  { ko: '쓰레기 분리수거', en: 'Separate and dispose of trash' },
  { ko: '사용한 물건 제자리에', en: 'Return items to original places' },
  { ko: '개인 물품 챙기기', en: 'Take all personal belongings' },
  { ko: '문 잠금 확인', en: 'Lock the door' },
] as const;
