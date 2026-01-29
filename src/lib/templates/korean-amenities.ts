// @TASK P3-T3.4 - 한국 특화 편의시설 템플릿
// @SPEC docs/planning/06-tasks.md#P3-T3.4

/**
 * 한국 특화 편의시설 아이템 타입
 */
export interface KoreanAmenityItem {
  name: string;
  nameEn: string;
  icon: string;
  description?: string;
  note?: string;
  categories?: string[];
}

/**
 * 한국 특화 편의시설 카테고리
 */
export type KoreanAmenityCategory =
  | 'heating'      // 난방/냉방
  | 'bathroom'     // 욕실
  | 'kitchen'      // 주방
  | 'laundry'      // 세탁
  | 'entertainment'// 엔터테인먼트
  | 'convenience'  // 편의시설
  | 'safety'       // 안전
  | 'outdoor';     // 야외/기타

/**
 * 한국 특화 편의시설 목록 (25개 이상)
 * - 한국 숙소에서 흔히 제공되는 시설 중심
 * - 외국인 게스트에게 설명이 필요한 항목 포함
 */
export const KOREAN_AMENITIES: Record<string, KoreanAmenityItem> = {
  // ========================================
  // 난방/냉방 (Heating & Cooling)
  // ========================================
  ondol: {
    name: '온돌',
    nameEn: 'Ondol (Heated Floor)',
    icon: 'flame',
    description: '바닥 난방 시스템으로 겨울에 따뜻합니다',
    note: '한국 전통 난방 방식',
  },
  floorHeating: {
    name: '바닥 난방',
    nameEn: 'Floor Heating',
    icon: 'thermometer',
    description: '전기/보일러 바닥 난방',
  },
  aircon: {
    name: '에어컨',
    nameEn: 'Air Conditioner',
    icon: 'snowflake',
    description: '냉방 기능 제공',
  },
  airPurifier: {
    name: '공기청정기',
    nameEn: 'Air Purifier',
    icon: 'wind',
    description: '미세먼지 제거, 공기 정화',
    note: '필터 교체 주기 확인 필요',
  },
  dehumidifier: {
    name: '제습기',
    nameEn: 'Dehumidifier',
    icon: 'droplet-off',
    description: '습한 날씨에 습기 제거',
  },
  humidifier: {
    name: '가습기',
    nameEn: 'Humidifier',
    icon: 'droplets',
    description: '건조한 날씨에 가습',
  },
  electricFan: {
    name: '선풍기',
    nameEn: 'Electric Fan',
    icon: 'fan',
    description: '보조 냉방 기구',
  },

  // ========================================
  // 욕실 (Bathroom)
  // ========================================
  bidet: {
    name: '비데',
    nameEn: 'Bidet',
    icon: 'droplet',
    description: '전자식 비데 (온수, 건조 기능)',
    note: '버튼 조작법 안내 권장',
  },
  bathTub: {
    name: '욕조',
    nameEn: 'Bathtub',
    icon: 'bath',
    description: '입욕 가능한 욕조',
  },
  rainShower: {
    name: '레인샤워',
    nameEn: 'Rain Shower',
    icon: 'shower-head',
    description: '천장형 레인샤워기',
  },
  hairDryer: {
    name: '헤어드라이어',
    nameEn: 'Hair Dryer',
    icon: 'wind',
    description: '헤어 드라이어 제공',
  },
  toiletries: {
    name: '세면도구',
    nameEn: 'Toiletries',
    icon: 'sparkles',
    description: '칫솔, 치약, 샴푸, 비누 등',
  },

  // ========================================
  // 주방 (Kitchen)
  // ========================================
  riceCooker: {
    name: '전기밥솥',
    nameEn: 'Rice Cooker',
    icon: 'utensils',
    description: '밥 짓기 가능',
    note: '한국 주방 필수품',
  },
  inductionStove: {
    name: '인덕션',
    nameEn: 'Induction Cooktop',
    icon: 'flame',
    description: '전기 인덕션 조리대',
  },
  gasStove: {
    name: '가스레인지',
    nameEn: 'Gas Stove',
    icon: 'flame',
    description: '가스 조리대',
  },
  microwave: {
    name: '전자레인지',
    nameEn: 'Microwave',
    icon: 'zap',
    description: '음식 데우기 가능',
  },
  refrigerator: {
    name: '냉장고',
    nameEn: 'Refrigerator',
    icon: 'refrigerator',
    description: '냉장/냉동 보관',
  },
  kimchiFridge: {
    name: '김치냉장고',
    nameEn: 'Kimchi Refrigerator',
    icon: 'refrigerator',
    description: '김치 전용 냉장고 (발효 식품 보관)',
    note: '한국 특화 가전',
  },
  waterPurifier: {
    name: '정수기',
    nameEn: 'Water Purifier',
    icon: 'glass-water',
    description: '정수/온수/냉수 제공',
  },
  coffeeMachine: {
    name: '커피머신',
    nameEn: 'Coffee Machine',
    icon: 'coffee',
    description: '커피 메이커 또는 캡슐 머신',
  },
  electricKettle: {
    name: '전기포트',
    nameEn: 'Electric Kettle',
    icon: 'cup-soda',
    description: '물 끓이기 가능',
  },

  // ========================================
  // 세탁 (Laundry)
  // ========================================
  washingMachine: {
    name: '세탁기',
    nameEn: 'Washing Machine',
    icon: 'loader',
    description: '세탁 가능',
  },
  dryer: {
    name: '건조기',
    nameEn: 'Dryer',
    icon: 'wind',
    description: '의류 건조기',
  },
  dryingRack: {
    name: '빨래 건조대',
    nameEn: 'Drying Rack',
    icon: 'shirt',
    description: '실내 건조대',
  },
  iron: {
    name: '다리미',
    nameEn: 'Iron',
    icon: 'iron',
    description: '의류 다림질 가능',
  },
  steamIron: {
    name: '스팀다리미',
    nameEn: 'Steam Iron',
    icon: 'wind',
    description: '스팀 다림질 가능',
  },

  // ========================================
  // 엔터테인먼트 (Entertainment)
  // ========================================
  smartTv: {
    name: '스마트TV',
    nameEn: 'Smart TV',
    icon: 'tv',
    description: '인터넷 연결 TV',
    note: '넷플릭스, 유튜브 등 사용 가능',
  },
  netflix: {
    name: '넷플릭스',
    nameEn: 'Netflix',
    icon: 'play-circle',
    description: '넷플릭스 계정 제공',
  },
  bluetoothSpeaker: {
    name: '블루투스 스피커',
    nameEn: 'Bluetooth Speaker',
    icon: 'speaker',
    description: '무선 스피커',
  },
  gameConsole: {
    name: '게임 콘솔',
    nameEn: 'Game Console',
    icon: 'gamepad-2',
    description: 'PS5, Xbox, 닌텐도 등',
  },
  books: {
    name: '도서',
    nameEn: 'Books',
    icon: 'book-open',
    description: '읽을거리 제공',
  },
  boardGames: {
    name: '보드게임',
    nameEn: 'Board Games',
    icon: 'dice-5',
    description: '보드게임 구비',
  },

  // ========================================
  // 편의시설 (Convenience)
  // ========================================
  wifi: {
    name: '와이파이',
    nameEn: 'Wi-Fi',
    icon: 'wifi',
    description: '고속 무선 인터넷',
  },
  parking: {
    name: '주차장',
    nameEn: 'Parking',
    icon: 'parking',
    description: '무료/유료 주차 가능',
  },
  elevator: {
    name: '엘리베이터',
    nameEn: 'Elevator',
    icon: 'move-vertical',
    description: '엘리베이터 이용 가능',
  },
  deliveryBox: {
    name: '택배함',
    nameEn: 'Delivery Box',
    icon: 'package',
    description: '택배 수령 가능',
    note: '한국에서 택배 매우 빠름',
  },
  slippers: {
    name: '실내화',
    nameEn: 'Indoor Slippers',
    icon: 'footprints',
    description: '실내용 슬리퍼 제공',
  },
  luggageStorage: {
    name: '짐 보관',
    nameEn: 'Luggage Storage',
    icon: 'luggage',
    description: '체크인/아웃 전후 짐 보관 가능',
  },
  workspace: {
    name: '업무공간',
    nameEn: 'Workspace',
    icon: 'laptop',
    description: '책상, 의자 등 업무 환경',
  },

  // ========================================
  // 안전 (Safety)
  // ========================================
  fireExtinguisher: {
    name: '소화기',
    nameEn: 'Fire Extinguisher',
    icon: 'flame-kindling',
    description: '화재 대비 소화기',
  },
  smokeDetector: {
    name: '화재경보기',
    nameEn: 'Smoke Detector',
    icon: 'bell-ring',
    description: '연기 감지 경보기',
  },
  firstAidKit: {
    name: '구급상자',
    nameEn: 'First Aid Kit',
    icon: 'heart-pulse',
    description: '응급 처치 키트',
  },
  doorLock: {
    name: '도어락',
    nameEn: 'Digital Door Lock',
    icon: 'lock',
    description: '디지털 도어락 (비밀번호)',
    note: '한국 대부분의 숙소에서 사용',
  },
  cctv: {
    name: 'CCTV',
    nameEn: 'CCTV',
    icon: 'video',
    description: '외부/공용부 CCTV 설치',
    note: '실내 CCTV 없음 (개인정보보호)',
  },

  // ========================================
  // 야외/기타 (Outdoor & Others)
  // ========================================
  balcony: {
    name: '발코니',
    nameEn: 'Balcony',
    icon: 'sun',
    description: '발코니/베란다 공간',
  },
  rooftop: {
    name: '옥상',
    nameEn: 'Rooftop',
    icon: 'building',
    description: '옥상 이용 가능',
  },
  garden: {
    name: '정원',
    nameEn: 'Garden',
    icon: 'flower',
    description: '정원/마당 공간',
  },
  bbqGrill: {
    name: '바베큐 그릴',
    nameEn: 'BBQ Grill',
    icon: 'beef',
    description: 'BBQ 가능',
  },
};

/**
 * 카테고리별 편의시설 그룹핑
 */
export const KOREAN_AMENITIES_BY_CATEGORY: Record<KoreanAmenityCategory, string[]> = {
  heating: ['ondol', 'floorHeating', 'aircon', 'airPurifier', 'dehumidifier', 'humidifier', 'electricFan'],
  bathroom: ['bidet', 'bathTub', 'rainShower', 'hairDryer', 'toiletries'],
  kitchen: ['riceCooker', 'inductionStove', 'gasStove', 'microwave', 'refrigerator', 'kimchiFridge', 'waterPurifier', 'coffeeMachine', 'electricKettle'],
  laundry: ['washingMachine', 'dryer', 'dryingRack', 'iron', 'steamIron'],
  entertainment: ['smartTv', 'netflix', 'bluetoothSpeaker', 'gameConsole', 'books', 'boardGames'],
  convenience: ['wifi', 'parking', 'elevator', 'deliveryBox', 'slippers', 'luggageStorage', 'workspace'],
  safety: ['fireExtinguisher', 'smokeDetector', 'firstAidKit', 'doorLock', 'cctv'],
  outdoor: ['balcony', 'rooftop', 'garden', 'bbqGrill'],
};

/**
 * 카테고리 이름 (한국어/영어)
 */
export const KOREAN_AMENITY_CATEGORY_NAMES: Record<KoreanAmenityCategory, { ko: string; en: string }> = {
  heating: { ko: '난방/냉방', en: 'Heating & Cooling' },
  bathroom: { ko: '욕실', en: 'Bathroom' },
  kitchen: { ko: '주방', en: 'Kitchen' },
  laundry: { ko: '세탁', en: 'Laundry' },
  entertainment: { ko: '엔터테인먼트', en: 'Entertainment' },
  convenience: { ko: '편의시설', en: 'Convenience' },
  safety: { ko: '안전', en: 'Safety' },
  outdoor: { ko: '야외/기타', en: 'Outdoor & Others' },
};

/**
 * 편의시설 ID 배열을 상세 정보로 변환
 */
export function getAmenitiesDetails(amenityIds: string[]): KoreanAmenityItem[] {
  return amenityIds
    .filter((id) => id in KOREAN_AMENITIES)
    .map((id) => KOREAN_AMENITIES[id]);
}

/**
 * 외국인에게 설명이 필요한 한국 특화 시설 목록
 */
export const KOREAN_UNIQUE_AMENITIES = [
  'ondol',
  'bidet',
  'kimchiFridge',
  'doorLock',
  'deliveryBox',
  'riceCooker',
] as const;

/**
 * 기본 편의시설 프리셋 (일반적인 한국 숙소)
 */
export const DEFAULT_KOREAN_AMENITIES = [
  'wifi',
  'aircon',
  'floorHeating',
  'washingMachine',
  'refrigerator',
  'microwave',
  'smartTv',
  'hairDryer',
  'doorLock',
  'elevator',
] as const;
