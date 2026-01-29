// @TASK P7-T7.3 - 데모 페이지
'use client';

import Link from 'next/link';
import { ArrowRight, Play, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const demoGuidebooks = [
  {
    title: '제주 힐링 스테이',
    description: '제주도 해안가에 위치한 프라이빗 풀빌라',
    category: '풀빌라',
    url: '/g/demo-jeju-healing',
  },
  {
    title: '서울 한옥 게스트하우스',
    description: '북촌 한옥마을 인근의 전통 한옥 숙소',
    category: '한옥',
    url: '/g/demo-seoul-hanok',
  },
  {
    title: '부산 오션뷰 아파트',
    description: '해운대 바다가 보이는 고층 아파트',
    category: '아파트',
    url: '/g/demo-busan-ocean',
  },
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <BookOpen className="w-5 h-5" />
            <span>Roomy</span>
          </Link>
        </div>
      </div>

      {/* 히어로 */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-6">
            <Play className="w-4 h-4" />
            <span className="text-sm font-medium">라이브 데모</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Roomy 가이드북 체험하기
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
            실제 호스트들이 사용하는 가이드북을 직접 체험해보세요.
            모바일에서 게스트가 보는 그대로 확인할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 데모 가이드북 */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">데모 가이드북</h2>
          <p className="text-gray-600">클릭해서 실제 가이드북을 체험해보세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {demoGuidebooks.map((demo) => (
            <Card key={demo.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-sm text-blue-600 font-medium mb-2">{demo.category}</div>
                <CardTitle>{demo.title}</CardTitle>
                <CardDescription>{demo.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={demo.url}>
                    체험하기
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center bg-gray-100 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            나만의 가이드북 만들기
          </h3>
          <p className="text-gray-600 mb-6">
            무료로 시작하고, AI가 자동으로 만들어드립니다.
          </p>
          <Button asChild size="lg">
            <Link href="/signup">
              무료로 시작하기
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
