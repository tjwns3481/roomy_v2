# P2-T2.3 QuickInfo 카드 데모

## 데모 페이지 접근 방법

### 1. 개발 서버 시작
```bash
npm run dev
```

### 2. 브라우저에서 접속
```
http://localhost:3000/demo/phase-2/t2-3-quick-info
```

### 3. 데모 상태 테스트
- ✅ **전체 정보**: WiFi + 도어락 + 주소 모두 포함
- 📵 **WiFi 없음**: WiFi 섹션 숨김
- 🚪 **도어락 없음**: 도어락 섹션 숨김
- 📝 **최소 정보**: 체크인/체크아웃 + 주소만

### 4. 테스트 항목
1. 복사 버튼 클릭 → 토스트 알림 확인
2. 눈 아이콘 클릭 → 비밀번호 표시/숨김 토글
3. 모바일 화면에서 터치 영역 확인
4. 복사 후 버튼 상태 변경 (Copy → Check)

---

**생성된 파일**:
- `src/hooks/useCopyToClipboard.ts`
- `src/components/guest/blocks/QuickInfoBlock.tsx`
- `src/__tests__/hooks/useCopyToClipboard.test.ts`
- `src/__tests__/components/QuickInfoBlock.test.tsx`
- `src/app/demo/phase-2/t2-3-quick-info/page.tsx`
