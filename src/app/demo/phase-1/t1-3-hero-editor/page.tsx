// @TASK P1-T1.3 - HeroEditor 데모 페이지
// @SPEC docs/planning/06-tasks.md#P1-T1.3

'use client';

import { useState } from 'react';
import { HeroEditor, HeroPreview } from '@/components/editor/blocks';
import { HeroContent } from '@/types/block';

const DEMO_STATES = {
  empty: {
    title: '',
    subtitle: '',
  },
  basic: {
    title: '서울 강남 아파트',
    subtitle: '편안한 휴식을 위한 완벽한 공간',
  },
  withImage: {
    title: '제주 오션뷰 펜션',
    subtitle: '바다가 보이는 힐링 공간',
    backgroundImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
  },
  withOverlay: {
    title: '부산 해운대 호텔',
    subtitle: '럭셔리 스테이',
    backgroundImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200',
    overlayColor: '#2563EB',
    overlayOpacity: 40,
  },
  darkOverlay: {
    title: '강릉 카페형 숙소',
    subtitle: '감성 가득한 프라이빗 공간',
    backgroundImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
    overlayColor: '#000000',
    overlayOpacity: 60,
  },
} as const;

export default function HeroEditorDemoPage() {
  const [selectedState, setSelectedState] = useState<keyof typeof DEMO_STATES>('basic');
  const [content, setContent] = useState<HeroContent>(DEMO_STATES[selectedState]);

  const handleStateChange = (state: keyof typeof DEMO_STATES) => {
    setSelectedState(state);
    setContent(DEMO_STATES[state]);
  };

  // 이미지 업로드 시뮬레이션
  const handleImageUpload = async (file: File): Promise<string> => {
    // 실제로는 Supabase Storage에 업로드
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 헤더 */}
        <div className="border-b border-border pb-6">
          <h1 className="text-h1 text-text-primary mb-2">HeroEditor 데모</h1>
          <p className="text-body text-text-secondary">
            히어로 블록 에디터 및 프리뷰 컴포넌트 테스트
          </p>
        </div>

        {/* 상태 선택기 */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-h3 text-text-primary mb-4">데모 상태 선택</h2>
          <div className="flex flex-wrap gap-3">
            {Object.keys(DEMO_STATES).map((state) => (
              <button
                key={state}
                onClick={() => handleStateChange(state as keyof typeof DEMO_STATES)}
                className={`
                  px-4 py-2 rounded-lg font-semibold transition-all
                  ${
                    selectedState === state
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white border-2 border-border text-text-primary hover:bg-primary-light'
                  }
                `}
              >
                {state}
              </button>
            ))}
          </div>
        </div>

        {/* 에디터 + 프리뷰 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 에디터 */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-h3 text-text-primary mb-6">에디터</h2>
            <HeroEditor
              content={content}
              onChange={setContent}
              onImageUpload={handleImageUpload}
            />
          </div>

          {/* 프리뷰 */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-h3 text-text-primary mb-6">프리뷰 (게스트 뷰)</h2>
            <HeroPreview content={content} />
          </div>
        </div>

        {/* 현재 상태 JSON */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-h3 text-text-primary mb-4">현재 상태 (JSON)</h2>
          <pre className="bg-white border border-border rounded-lg p-4 text-sm overflow-x-auto">
            {JSON.stringify(content, null, 2)}
          </pre>
        </div>

        {/* 기능 체크리스트 */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-h3 text-text-primary mb-4">AC 체크리스트</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked readOnly className="w-5 h-5" />
              <span className="text-body">숙소명, 서브타이틀 입력</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked readOnly className="w-5 h-5" />
              <span className="text-body">이미지 드래그앤드롭 업로드</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked readOnly className="w-5 h-5" />
              <span className="text-body">오버레이 색상/투명도 조절</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked readOnly className="w-5 h-5" />
              <span className="text-body">실시간 프리뷰 반영</span>
            </label>
          </div>
        </div>

        {/* 사용 가이드 */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-h3 text-text-primary mb-4">사용 가이드</h2>
          <div className="space-y-3 text-body text-text-secondary">
            <p>
              <strong>1. 상태 선택:</strong> 위의 버튼으로 미리 정의된 상태를 선택할 수 있습니다.
            </p>
            <p>
              <strong>2. 텍스트 입력:</strong> 숙소명(필수)과 서브타이틀(선택)을 입력하세요.
            </p>
            <p>
              <strong>3. 이미지 업로드:</strong> 드래그앤드롭 영역에 이미지를 끌어다 놓거나 클릭하여 파일을 선택하세요.
            </p>
            <p>
              <strong>4. 오버레이 조절:</strong> 색상 선택기와 슬라이더로 배경 이미지 위의 오버레이를 조절하세요.
            </p>
            <p>
              <strong>5. 실시간 반영:</strong> 모든 변경사항이 오른쪽 프리뷰에 즉시 반영됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
