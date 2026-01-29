// @TASK P7-T7.3 - 블로그 페이지
import Link from 'next/link';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: '블로그 | Roomy',
  description: '숙박 호스팅 팁, 게스트 경험 개선 방법, Roomy 업데이트 소식을 확인하세요.',
};

const blogPosts = [
  {
    title: '게스트 만족도를 높이는 가이드북 작성 팁 5가지',
    description: '숙박 게스트가 정말 필요로 하는 정보는 무엇일까요? 수년간의 호스팅 경험을 바탕으로 정리한 핵심 팁을 공개합니다.',
    category: '호스팅 팁',
    date: '2024년 1월 15일',
    readTime: '5분',
    slug: 'guest-guidebook-tips',
  },
  {
    title: 'AI로 가이드북 만들기: 단계별 가이드',
    description: 'Roomy의 AI 기능을 활용해 5분 만에 전문적인 가이드북을 만드는 방법을 알아봅니다.',
    category: '튜토리얼',
    date: '2024년 1월 10일',
    readTime: '7분',
    slug: 'ai-guidebook-tutorial',
  },
  {
    title: 'QR 코드로 체크인 경험 향상시키기',
    description: '게스트가 도착하자마자 모든 정보에 접근할 수 있도록 QR 코드를 활용하는 방법을 소개합니다.',
    category: '기능 활용',
    date: '2024년 1월 5일',
    readTime: '4분',
    slug: 'qr-code-checkin',
  },
  {
    title: '2024년 Roomy 로드맵 공개',
    description: '올해 Roomy에 추가될 새로운 기능들을 미리 만나보세요. 다국어 지원, 분석 대시보드 등 많은 업데이트가 예정되어 있습니다.',
    category: '소식',
    date: '2024년 1월 1일',
    readTime: '6분',
    slug: '2024-roadmap',
  },
];

export default function BlogPage() {
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
      <div className="bg-white py-16 border-b">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Roomy 블로그
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            호스팅 팁, 기능 활용 가이드, 그리고 Roomy의 최신 소식을 확인하세요.
          </p>
        </div>
      </div>

      {/* 블로그 목록 */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-6">
          {blogPosts.map((post) => (
            <Card key={post.slug} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">{post.category}</span>
                  <span>{post.date}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.readTime}
                  </span>
                </div>
                <CardTitle className="text-xl">{post.title}</CardTitle>
                <CardDescription className="text-base">{post.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 p-0">
                  자세히 읽기
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 뉴스레터 */}
        <div className="mt-16 text-center bg-blue-600 text-white rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-4">
            최신 소식을 받아보세요
          </h3>
          <p className="text-blue-100 mb-6">
            새로운 기능과 호스팅 팁을 이메일로 받아보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="이메일 주소"
              className="flex-1 px-4 py-2 rounded-lg text-gray-900 placeholder-gray-500"
            />
            <Button variant="secondary">구독하기</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
