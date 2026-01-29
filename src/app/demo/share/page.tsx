// @TASK P5-T5.3 - 공유 모달 데모 페이지
// @SPEC docs/planning/06-tasks.md#p5-t53

'use client';

import { useState } from 'react';
import { ShareModal } from '@/components/share';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ShareModalDemoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGuidebook, setSelectedGuidebook] = useState<
    'full' | 'short' | 'no-short'
  >('full');

  const guidebooks = {
    full: {
      id: '1',
      title: '강남 아파트 게스트 가이드북',
      slug: 'gangnam-apt',
      shortCode: 'ABC123',
    },
    short: {
      id: '2',
      title: '제주도 펜션',
      slug: 'jeju-pension',
      shortCode: 'XYZ789',
    },
    'no-short': {
      id: '3',
      title: '부산 해운대 숙소',
      slug: 'busan-haeundae',
      shortCode: undefined,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            공유 모달 컴포넌트 데모
          </h1>
          <p className="text-gray-600 mt-2">
            P5-T5.3: 링크 복사, QR 코드, SNS 공유 기능을 포함한 공유 모달
          </p>
        </div>

        {/* 상태 선택 */}
        <Card>
          <CardHeader>
            <CardTitle>가이드북 선택</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={selectedGuidebook === 'full' ? 'default' : 'outline'}
                onClick={() => setSelectedGuidebook('full')}
              >
                전체 URL + 단축 URL
              </Button>
              <Button
                variant={selectedGuidebook === 'short' ? 'default' : 'outline'}
                onClick={() => setSelectedGuidebook('short')}
              >
                다른 가이드북
              </Button>
              <Button
                variant={
                  selectedGuidebook === 'no-short' ? 'default' : 'outline'
                }
                onClick={() => setSelectedGuidebook('no-short')}
              >
                단축 URL 없음
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 공유 버튼 */}
        <Card>
          <CardHeader>
            <CardTitle>공유 모달 열기</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsModalOpen(true)} size="lg">
              공유하기
            </Button>
          </CardContent>
        </Card>

        {/* 현재 상태 */}
        <Card>
          <CardHeader>
            <CardTitle>현재 가이드북 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
              {JSON.stringify(guidebooks[selectedGuidebook], null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* 기능 설명 */}
        <Card>
          <CardHeader>
            <CardTitle>기능 설명</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                1. 링크 복사 섹션
              </h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>전체 URL 복사 버튼</li>
                <li>단축 URL 복사 버튼 (있을 경우)</li>
                <li>복사 성공 시 토스트 알림</li>
                <li>입력 필드 클릭 시 자동 전체 선택</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                2. QR 코드 섹션
              </h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>QR 코드 실시간 미리보기</li>
                <li>크기 선택 (작음/중간/큼)</li>
                <li>PNG 다운로드</li>
                <li>SVG 다운로드</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                3. SNS 공유 섹션
              </h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>카카오톡 공유 (Kakao SDK 또는 카카오스토리)</li>
                <li>트위터 공유</li>
                <li>페이스북 공유</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 체크리스트 */}
        <Card>
          <CardHeader>
            <CardTitle>완료 기준 체크리스트</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>ShareModal 컴포넌트</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>링크 복사 기능</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>QR 코드 표시 및 다운로드</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>SNS 공유 버튼 (카카오, 트위터, 페이스북)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>복사 성공 토스트</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* 공유 모달 */}
      <ShareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        guidebook={guidebooks[selectedGuidebook]}
      />
    </div>
  );
}
