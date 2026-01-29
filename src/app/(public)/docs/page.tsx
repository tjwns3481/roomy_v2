// @TASK P7-T7.3 - 가이드 문서 페이지
import Link from 'next/link';
import { BookOpen, ArrowRight, FileText, Play, Zap, Settings, Share2, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: '가이드 문서 | Roomy',
  description: 'Roomy 사용법을 단계별로 안내합니다.',
};

const guides = [
  {
    icon: Play,
    title: '시작하기',
    description: '계정 생성부터 첫 가이드북 발행까지',
    items: [
      { title: '회원가입 및 로그인', href: '#signup' },
      { title: '대시보드 둘러보기', href: '#dashboard' },
      { title: '첫 가이드북 만들기', href: '#first-guidebook' },
    ],
  },
  {
    icon: Zap,
    title: 'AI 기능 활용',
    description: 'AI로 가이드북 자동 생성하기',
    items: [
      { title: 'AI 생성 기능 소개', href: '#ai-intro' },
      { title: '에어비앤비 URL로 자동 생성', href: '#ai-airbnb' },
      { title: '생성된 콘텐츠 수정하기', href: '#ai-edit' },
    ],
  },
  {
    icon: FileText,
    title: '콘텐츠 편집',
    description: '가이드북 내용 작성 및 편집',
    items: [
      { title: '블록 추가 및 삭제', href: '#blocks' },
      { title: '이미지 업로드', href: '#images' },
      { title: '체크인/체크아웃 정보', href: '#checkin' },
      { title: '주변 시설 안내', href: '#amenities' },
    ],
  },
  {
    icon: Settings,
    title: '설정',
    description: '테마, 색상, 글꼴 커스터마이징',
    items: [
      { title: '테마 선택', href: '#theme' },
      { title: '색상 변경', href: '#colors' },
      { title: '비밀번호 보호', href: '#password' },
    ],
  },
  {
    icon: Share2,
    title: '공유하기',
    description: 'QR 코드, 링크, SNS 공유',
    items: [
      { title: 'QR 코드 생성 및 다운로드', href: '#qr' },
      { title: '공유 링크 생성', href: '#share-link' },
      { title: 'SNS 공유', href: '#social' },
    ],
  },
  {
    icon: BarChart,
    title: '통계',
    description: '조회수, 공유 통계 확인',
    items: [
      { title: '조회수 확인', href: '#views' },
      { title: '공유 통계', href: '#share-stats' },
      { title: '기간별 분석', href: '#period' },
    ],
  },
];

export default function DocsPage() {
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
            가이드 문서
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Roomy 사용법을 단계별로 안내합니다.
            쉽고 빠르게 전문적인 가이드북을 만들어보세요.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* 가이드 카테고리 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide) => {
            const Icon = guide.icon;
            return (
              <Card key={guide.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-2">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>{guide.title}</CardTitle>
                  <CardDescription>{guide.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {guide.items.map((item) => (
                      <li key={item.title}>
                        <a
                          href={item.href}
                          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <ArrowRight className="w-4 h-4" />
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 빠른 시작 가이드 */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">빠른 시작 가이드</h2>

          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="space-y-8">
              {/* 단계 1 */}
              <div id="signup" className="flex gap-6">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">회원가입</h3>
                  <p className="text-gray-600">
                    이메일 주소로 간편하게 가입하세요. Google 계정으로도 빠르게 시작할 수 있습니다.
                  </p>
                </div>
              </div>

              {/* 단계 2 */}
              <div id="first-guidebook" className="flex gap-6">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">가이드북 만들기</h3>
                  <p className="text-gray-600">
                    대시보드에서 &quot;새 가이드북 만들기&quot;를 클릭하고 숙소 이름을 입력하세요.
                    AI가 자동으로 가이드북을 생성해드립니다.
                  </p>
                </div>
              </div>

              {/* 단계 3 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">내용 수정</h3>
                  <p className="text-gray-600">
                    에디터에서 숙소 정보, 체크인 방법, 주변 시설 등을 수정하세요.
                    드래그 앤 드롭으로 블록 순서를 변경할 수 있습니다.
                  </p>
                </div>
              </div>

              {/* 단계 4 */}
              <div id="qr" className="flex gap-6">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">QR 코드 공유</h3>
                  <p className="text-gray-600">
                    공유 버튼을 클릭하여 QR 코드를 다운로드하세요.
                    숙소에 비치하면 게스트가 스마트폰으로 쉽게 가이드북에 접근할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">더 궁금한 점이 있으신가요?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/support">고객센터 문의</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/demo">데모 체험하기</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
