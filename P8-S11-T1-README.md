# P8-S11-T1: 브랜딩 설정 페이지 구현 완료

## 태스크 정보
- **Phase**: 8
- **Screen**: S-11 (브랜딩 설정)
- **상태**: ✅ 완료
- **완료일**: 2026-01-29

## 구현 내용

### 1. 브랜딩 설정 페이지
- **경로**: `/editor/[id]/branding`
- **레이아웃**: 2단 레이아웃 (설정 폼 + 실시간 미리보기)
- **플랜 제한**: Pro 이상만 접근 가능

### 2. 주요 기능

#### 2.1 로고 업로드
- 헤더 로고 업로드 (최대 2MB)
- 파비콘 업로드 (최대 1MB, 1:1 비율)
- 드래그앤드롭 지원
- 이미지 미리보기 및 삭제

#### 2.2 색상 선택
- Primary/Secondary 색상 커스터마이징
- 12개 프리셋 색상 제공
- HEX 색상 직접 입력 (#RRGGBB 형식)
- 실시간 색상 미리보기

#### 2.3 폰트 선택 (5종)
- Pretendard (기본)
- Noto Sans KR
- 나눔고딕
- G마켓 산스
- Spoqa Han Sans

#### 2.4 커스텀 CSS (Business 전용)
- 코드 에디터 (textarea 기반)
- 10KB 제한
- Free/Pro 플랜은 업그레이드 안내 표시

#### 2.5 실시간 미리보기
- 미니 게스트 뷰어 시뮬레이션
- 로고, 색상, 폰트 변경사항 즉시 반영
- 모바일 프레임 스타일

### 3. API 연동
- **GET** `/api/guidebooks/[id]/branding` - 브랜딩 조회
- **PUT** `/api/guidebooks/[id]/branding` - 브랜딩 저장 (Upsert)
- **POST** `/api/upload/branding` - 이미지 업로드 (Storage)

### 4. AirBnB 디자인 시스템 적용
- `shadow-airbnb-*` 그림자 사용
- `rounded-airbnb` 모서리
- `text-h*`, `text-body-*` 타이포그래피
- 따뜻한 색상 팔레트 (#FF385C Primary)
- 호버 인터랙션 (scale, shadow 변화)

## 파일 구조

```
worktree/phase-8-production/
├── src/
│   ├── app/
│   │   ├── (host)/
│   │   │   └── editor/
│   │   │       └── [id]/
│   │   │           └── branding/
│   │   │               └── page.tsx          # 브랜딩 설정 페이지
│   │   └── api/
│   │       └── upload/
│   │           └── branding/
│   │               └── route.ts             # 이미지 업로드 API
│   ├── components/
│   │   └── editor/
│   │       ├── BrandingEditor.tsx          # 메인 에디터 컴포넌트
│   │       ├── ColorPicker.tsx             # 색상 선택 컴포넌트
│   │       ├── FontSelector.tsx            # 폰트 선택 컴포넌트
│   │       └── ImageUpload.tsx             # 이미지 업로드 컴포넌트
│   └── lib/
│       └── validations/
│           └── branding.ts                 # 검증 스키마 (기존)
└── tests/
    └── branding-page.test.tsx              # 페이지 테스트
```

## AC (Acceptance Criteria) 검증

### ✅ AC1: Free 플랜 접근 제한
- Free 플랜 사용자는 업그레이드 안내 오버레이 표시
- Pro로 업그레이드 버튼 제공

### ✅ AC2: Pro+ 플랜 접근
- Pro/Business 플랜 사용자는 브랜딩 폼 접근 가능
- 모든 섹션 정상 렌더링

### ✅ AC3: 브랜딩 없을 때 기본값
- 브랜딩 없으면 기본값으로 초기화
- Primary: #FF385C, Secondary: #00A699
- 폰트: Pretendard

### ✅ AC4: 인증 및 권한 검증
- 미인증 사용자는 리다이렉트
- 다른 사용자의 가이드북은 접근 불가 (RLS)

### ✅ AC5: 저장 성공 시 토스트 알림
- 저장 성공: "브랜딩 설정이 저장되었습니다"
- 저장 실패: 에러 메시지 표시

## 기술적 하이라이트

### 1. 서버 컴포넌트 우선
```tsx
// page.tsx는 서버 컴포넌트
export default async function BrandingPage({ params }: BrandingPageProps) {
  const supabase = createServerClient();
  // 서버에서 데이터 prefetch
  const { data: guidebook } = await supabase
    .from('guidebooks')
    .select('*')
    .eq('id', id)
    .single();

  // 클라이언트 컴포넌트에 전달
  return <BrandingEditor initialBranding={branding} />;
}
```

### 2. 플랜별 기능 제한
```tsx
// Free 플랜: 업그레이드 안내
if (userPlan === 'free') {
  return <UpgradePrompt />;
}

// Business 전용: 커스텀 CSS
{userPlan === 'business' ? (
  <textarea />
) : (
  <Alert>Business 플랜으로 업그레이드</Alert>
)}
```

### 3. Storage 업로드 (RLS 보호)
```tsx
// Storage 경로: {user_id}/{guidebook_id}/branding/{filename}
const filePath = `${user.id}/${guidebookId}/branding/${fileName}`;
await supabase.storage
  .from('guidebook-images')
  .upload(filePath, buffer);
```

### 4. 실시간 미리보기
```tsx
<div style={{
  backgroundColor: formData.primary_color,
  fontFamily: getFontFamily(formData.font_preset),
}}>
  {/* 변경사항 즉시 반영 */}
</div>
```

## 디자인 시스템 적용 예시

### 카드 스타일
```tsx
<Card className="shadow-airbnb-sm hover:shadow-airbnb-md transition-shadow">
  <CardHeader>
    <CardTitle className="text-h4 text-text-primary">로고</CardTitle>
    <CardDescription className="text-body-sm text-text-secondary">
      가이드북 헤더에 표시될 로고와 파비콘을 업로드하세요
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-6">
    {/* 컨텐츠 */}
  </CardContent>
</Card>
```

### 버튼 스타일
```tsx
<Button
  onClick={handleSave}
  className="bg-primary hover:bg-primary-dark shadow-airbnb-sm hover:shadow-airbnb-md transition-all"
>
  변경사항 저장
</Button>
```

## 테스트 결과

### TypeScript 타입 체크
```bash
npx tsc --noEmit
# ✅ No errors
```

### Next.js 빌드
```bash
npm run build
# ✅ Build succeeded
```

### 테스트 커버리지
- ✅ Free 플랜 접근 제한
- ✅ Pro 플랜 브랜딩 폼 접근
- ✅ 브랜딩 없을 때 기본값
- ✅ 인증 및 권한 검증

## 다음 단계

### P8-S12-T1: 리뷰 설정 페이지
- 리뷰 요청 팝업 설정
- AirBnB/Booking.com/구글 리뷰 링크
- 팝업 타이밍 설정 (체크아웃 X시간 후)

### P8-S13-T1: Upsell 설정 페이지
- 상품/서비스 추가 판매
- 이미지 + 제목 + 가격 + 링크
- 게스트 뷰어에 카드 형태로 표시

## Lessons Learned

### 1. 컴포넌트 분리의 중요성
- ColorPicker, FontSelector, ImageUpload를 독립 컴포넌트로 분리
- 재사용성과 테스트 용이성 향상

### 2. 서버 컴포넌트 + 클라이언트 컴포넌트 조합
- 서버 컴포넌트에서 데이터 prefetch
- 클라이언트 컴포넌트에서 인터랙션 처리

### 3. 플랜별 기능 제한 UI
- Free 플랜: 전체 오버레이로 업그레이드 유도
- Pro 플랜: 일부 기능 (커스텀 CSS) 잠금 + 인라인 업그레이드 안내

### 4. 실시간 미리보기의 가치
- 변경사항을 즉시 확인할 수 있어 사용자 경험 크게 향상
- 모바일 프레임 시뮬레이션으로 실제 게스트 뷰 예상 가능

---

**TASK_DONE**: P8-S11-T1 브랜딩 설정 페이지 구현 완료
