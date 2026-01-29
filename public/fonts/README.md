# Pretendard 폰트 설치 안내

## CDN 방식 (현재 사용 중)

`globals.css`에서 CDN으로 로드됩니다:
```css
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css");
```

## 로컬 폰트 파일 (선택사항)

로컬 폰트를 사용하려면:

1. [Pretendard GitHub](https://github.com/orioncactus/pretendard/releases) 에서 최신 버전 다운로드
2. `PretendardVariable.woff2` 파일을 이 폴더에 복사
3. `layout.tsx`의 localFont 경로가 자동으로 폴백으로 작동합니다

현재는 CDN만으로 충분히 작동합니다!
