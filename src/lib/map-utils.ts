// @TASK P2-T2.4 - 지도 유틸리티 함수
// @SPEC docs/planning/06-tasks.md#P2-T2.4

/**
 * 좌표/주소를 외부 지도 앱/웹으로 연결하는 링크 생성
 */

export interface MapLinkOptions {
  lat?: number;
  lng?: number;
  address?: string;
}

/**
 * 카카오맵 링크 생성
 * - 모바일: kakaomap:// 딥링크
 * - 웹: https://map.kakao.com/link/map/
 */
export function getKakaoMapLink(options: MapLinkOptions): string {
  const { lat, lng, address } = options;

  // 좌표가 있으면 좌표 기반
  if (lat && lng) {
    // 모바일 딥링크 (앱 설치 시 자동 열림)
    if (isMobile()) {
      return `kakaomap://look?p=${lat},${lng}`;
    }
    // 웹 링크
    const name = encodeURIComponent(address || '위치');
    return `https://map.kakao.com/link/map/${name},${lat},${lng}`;
  }

  // 주소만 있으면 검색 링크
  if (address) {
    const query = encodeURIComponent(address);
    return `https://map.kakao.com/link/search/${query}`;
  }

  return '#';
}

/**
 * 네이버 지도 링크 생성
 * - 모바일: nmap:// 딥링크
 * - 웹: https://map.naver.com/
 */
export function getNaverMapLink(options: MapLinkOptions): string {
  const { lat, lng, address } = options;

  // 좌표가 있으면 좌표 기반
  if (lat && lng) {
    // 모바일 딥링크
    if (isMobile()) {
      const name = encodeURIComponent(address || '위치');
      return `nmap://place?lat=${lat}&lng=${lng}&name=${name}&appname=roomy`;
    }
    // 웹 링크
    return `https://map.naver.com/p/?c=${lng},${lat},15,0,0,0,dh&isCorrectAnswer=true`;
  }

  // 주소만 있으면 검색 링크
  if (address) {
    const query = encodeURIComponent(address);
    return `https://map.naver.com/p/search/${query}`;
  }

  return '#';
}

/**
 * 구글 맵 링크 생성 (폴백)
 * - 모바일/데스크톱 모두 웹 링크
 */
export function getGoogleMapLink(options: MapLinkOptions): string {
  const { lat, lng, address } = options;

  // 좌표 우선
  if (lat && lng) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }

  // 주소 검색
  if (address) {
    const query = encodeURIComponent(address);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  return '#';
}

/**
 * 모바일 여부 확인
 */
function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * 주소 클립보드 복사
 */
export async function copyAddressToClipboard(address: string): Promise<boolean> {
  if (!navigator.clipboard) {
    // 폴백: execCommand 사용 (구형 브라우저)
    const textArea = document.createElement('textarea');
    textArea.value = address;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }

  try {
    await navigator.clipboard.writeText(address);
    return true;
  } catch (err) {
    return false;
  }
}
