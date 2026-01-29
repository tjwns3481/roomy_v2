/**
 * @TASK P7-T7.10 프로젝트 문서화 및 사용자 온보딩
 *
 * Help Page (/help)
 * - FAQ (자주 묻는 질문)
 * - 사용 가이드
 * - 기술 지원 정보
 * - 커뮤니티 링크
 */

'use client';

import { useState } from 'react';
import { ChevronDown, Mail, MessageSquare, FileText, Users } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface FAQItem {
  category: string;
  items: Array<{
    question: string;
    answer: string;
  }>;
}

const faqData: FAQItem[] = [
  {
    category: '시작하기',
    items: [
      {
        question: '가이드북을 어떻게 만드나요?',
        answer:
          '대시보드에서 "새 가이드북" 버튼을 클릭한 후, Airbnb 링크를 입력하거나 수동으로 정보를 입력할 수 있습니다. AI로 자동 생성하거나 처음부터 만들 수 있습니다.',
      },
      {
        question: '무료로 몇 개의 가이드북을 만들 수 있나요?',
        answer:
          'Free 플랜에서는 최대 1개의 가이드북을 만들 수 있습니다. Pro 플랜은 5개, Business 플랜은 무제한입니다. 언제든 플랜을 업그레이드할 수 있습니다.',
      },
      {
        question: '게스트에게 가이드북을 어떻게 공유하나요?',
        answer:
          '가이드북 상세 페이지에서 QR 코드를 생성할 수 있습니다. 게스트가 QR 코드를 스캔하거나 공유 링크(예: roomy.com/g/my-guidebook)를 클릭하면 가이드북을 볼 수 있습니다.',
      },
    ],
  },
  {
    category: '에디터 & 블록',
    items: [
      {
        question: '사용 가능한 블록 타입은 무엇인가요?',
        answer:
          '7가지 블록 타입을 지원합니다: 히어로(헤더 이미지), 갤러리, 맵, 편의시설, 공지사항, 규칙, 퀵 인포. 각 블록은 맞춤형 에디터로 편집할 수 있습니다.',
      },
      {
        question: '블록 순서를 변경할 수 있나요?',
        answer:
          '네! 에디터의 블록 목록 왼쪽에 있는 드래그 핸들(≡)을 사용하여 블록을 위아래로 이동할 수 있습니다.',
      },
      {
        question: '이미지 크기 제한이 있나요?',
        answer:
          '개당 최대 10MB의 이미지를 업로드할 수 있습니다. 권장되는 크기는 히어로 블록 1200x600px, 갤러리 800x600px입니다.',
      },
    ],
  },
  {
    category: 'AI 기능',
    items: [
      {
        question: 'AI로 가이드북을 생성할 수 있나요?',
        answer:
          '네! Airbnb 링크를 입력하면 AI가 자동으로 가이드북의 기본 구조와 내용을 생성합니다. 생성 후 원하는 대로 커스터마이징할 수 있습니다.',
      },
      {
        question: 'AI 생성에 한계가 있나요?',
        answer:
          'Free 플랜은 월 3회, Pro 플랜은 월 30회, Business 플랜은 무제한입니다. 한계에 도달하면 플랜을 업그레이드하세요.',
      },
      {
        question: '게스트용 AI 챗봇이란?',
        answer:
          '게스트가 가이드북을 보다가 질문할 수 있는 AI 챗봇입니다. 체크인, 편의시설 사용법, 지역 정보 등의 질문에 자동으로 답변합니다.',
      },
    ],
  },
  {
    category: '플랜 & 결제',
    items: [
      {
        question: '플랜을 변경할 수 있나요?',
        answer:
          '네! 설정 > 구독에서 언제든 플랜을 업그레이드할 수 있습니다. 요금은 일할 계산으로 청구됩니다.',
      },
      {
        question: '환불 정책은 무엇인가요?',
        answer:
          '7일 이내 환불 보장 정책을 제공합니다. 질문이 있으면 support@roomy.com으로 연락하세요.',
      },
      {
        question: '어떤 결제 수단을 지원하나요?',
        answer:
          '신용카드(Visa, Mastercard), 국내 카드, 토스페이, 계좌이체 등 다양한 수단을 지원합니다.',
      },
    ],
  },
  {
    category: '통계 & 분석',
    items: [
      {
        question: '어떤 통계를 볼 수 있나요?',
        answer:
          '일일 조회수, 클릭 위치 분석, 사용자 기기 정보, 지역별 조회 등을 확인할 수 있습니다.',
      },
      {
        question: '통계 데이터는 언제까지 보관되나요?',
        answer:
          '최대 1년간 보관됩니다. 더 오래 보관이 필요하면 다운로드하여 따로 저장하세요.',
      },
    ],
  },
  {
    category: '트러블슈팅',
    items: [
      {
        question: '가이드북이 게스트 뷰어에 표시되지 않아요.',
        answer:
          '먼저 가이드북이 "공개" 상태인지 확인하세요. 가이드북 상세 페이지에서 상태를 확인할 수 있습니다. 문제가 지속되면 고객센터에 문의하세요.',
      },
      {
        question: '이미지가 업로드되지 않습니다.',
        answer:
          '파일 크기(10MB 이하)와 형식(JPG, PNG, WebP)을 확인하세요. 여전히 문제가 있으면 브라우저 캐시를 삭제하고 다시 시도하세요.',
      },
      {
        question: '블록이 저장되지 않습니다.',
        answer:
          '네트워크 연결을 확인하고, 브라우저 개발자도구(F12) 콘솔에서 오류 메시지를 확인하세요. 도움이 필요하면 오류 메시지를 포함하여 support@roomy.com으로 보내주세요.',
      },
    ],
  },
];

interface ResourceLink {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  target?: string;
}

const resources: ResourceLink[] = [
  {
    title: 'README',
    description: 'Roomy 프로젝트 소개 및 설치 가이드',
    icon: <FileText className="h-5 w-5" />,
    href: '/docs/README.md',
  },
  {
    title: 'API 문서',
    description: '개발자용 API 문서 및 엔드포인트',
    icon: <FileText className="h-5 w-5" />,
    href: '/api/docs',
  },
  {
    title: 'GitHub 저장소',
    description: '소스 코드 및 이슈 추적',
    icon: <Users className="h-5 w-5" />,
    href: 'https://github.com/your-repo/roomy',
    target: '_blank',
  },
];

export default function HelpPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* 헤더 */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            도움말 센터
          </h1>
          <p className="text-lg text-gray-600">
            Roomy 사용 방법과 자주 묻는 질문을 찾아보세요
          </p>
        </div>

        {/* 빠른 연락 */}
        <div className="mb-16 grid gap-4 md:grid-cols-3">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Mail className="mx-auto mb-4 h-8 w-8 text-blue-500" />
            <h3 className="mb-2 font-semibold text-gray-900">이메일 지원</h3>
            <p className="text-sm text-gray-600 mb-4">
              support@roomy.example.com으로 문의하세요
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => (window.location.href = 'mailto:support@roomy.example.com')}
            >
              이메일 보내기
            </Button>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <MessageSquare className="mx-auto mb-4 h-8 w-8 text-green-500" />
            <h3 className="mb-2 font-semibold text-gray-900">실시간 채팅</h3>
            <p className="text-sm text-gray-600 mb-4">
              채팅 아이콘을 클릭하면 즉시 문의할 수 있습니다
            </p>
            <Button variant="outline" size="sm">
              채팅 시작
            </Button>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Users className="mx-auto mb-4 h-8 w-8 text-purple-500" />
            <h3 className="mb-2 font-semibold text-gray-900">커뮤니티</h3>
            <p className="text-sm text-gray-600 mb-4">
              다른 호스트들과 팁을 공유하세요
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://community.roomy.example.com', '_blank')}
            >
              커뮤니티 방문
            </Button>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">자주 묻는 질문</h2>

          <div className="space-y-6">
            {faqData.map((category) => (
              <div key={category.category} className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  {category.category}
                </h3>

                <Accordion type="single" collapsible className="space-y-2">
                  {category.items.map((item, index) => (
                    <AccordionItem key={index} value={`${category.category}-${index}`}>
                      <AccordionTrigger className="text-left text-base font-medium hover:text-blue-600">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 pt-2">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>

        {/* 리소스 */}
        <div className="mb-16">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">추가 리소스</h2>

          <div className="grid gap-6 md:grid-cols-3">
            {resources.map((resource) => (
              <a
                key={resource.title}
                href={resource.href}
                target={resource.target}
                rel={resource.target ? 'noopener noreferrer' : undefined}
                className="group rounded-lg border border-gray-200 bg-white p-6 transition-all hover:shadow-lg"
              >
                <div className="mb-4 text-blue-500 group-hover:text-blue-600">
                  {resource.icon}
                </div>
                <h3 className="mb-2 font-semibold text-gray-900 group-hover:text-blue-600">
                  {resource.title}
                </h3>
                <p className="text-sm text-gray-600">{resource.description}</p>
              </a>
            ))}
          </div>
        </div>

        {/* 피드백 */}
        <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">피드백을 보내주세요</h2>
          <p className="mb-6 text-gray-600">
            Roomy를 개선하는 데 도움을 주세요. 기능 요청, 버그 리포트, 또는 일반 피드백을 보내주세요.
          </p>
          <Button
            size="lg"
            onClick={() => (window.location.href = 'mailto:feedback@roomy.example.com')}
          >
            피드백 보내기
          </Button>
        </div>
      </div>
    </div>
  );
}
