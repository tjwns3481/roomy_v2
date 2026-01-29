// @TASK P7-T7.3 - 고객센터 페이지
import Link from 'next/link';
import { BookOpen, HelpCircle, Mail, MessageCircle, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const metadata = {
  title: '고객센터 | Roomy',
  description: 'Roomy 사용에 관한 도움말과 자주 묻는 질문을 확인하세요.',
};

const faqs = [
  {
    question: '가이드북은 어떻게 만드나요?',
    answer: '로그인 후 대시보드에서 "새 가이드북 만들기"를 클릭하세요. 숙소 이름과 설명만 입력하면 AI가 자동으로 가이드북을 생성해드립니다. 직접 처음부터 만들기를 원하시면 "빈 가이드북으로 시작"을 선택할 수도 있습니다.',
  },
  {
    question: '무료 플랜의 제한은 무엇인가요?',
    answer: '무료 플랜에서는 1개의 가이드북을 만들 수 있으며, 월 3회의 AI 생성 기능을 사용할 수 있습니다. 가이드북 하단에 Roomy 워터마크가 표시됩니다. 더 많은 가이드북이 필요하시면 Pro 또는 Business 플랜을 이용해주세요.',
  },
  {
    question: 'QR 코드는 어떻게 만드나요?',
    answer: '가이드북을 만든 후 "공유" 버튼을 클릭하면 QR 코드를 다운로드할 수 있습니다. PNG, SVG 형식과 인쇄용 PDF를 제공합니다. QR 코드를 숙소에 비치하면 게스트가 쉽게 가이드북에 접근할 수 있습니다.',
  },
  {
    question: '플랜을 변경하려면 어떻게 하나요?',
    answer: '설정 > 요금제 페이지에서 플랜을 업그레이드하거나 변경할 수 있습니다. 업그레이드는 즉시 적용되며, 다운그레이드는 현재 결제 주기가 끝난 후 적용됩니다.',
  },
  {
    question: '가이드북 링크가 만료되나요?',
    answer: '기본적으로 가이드북 링크는 만료되지 않습니다. 다만, 공유 설정에서 만료 기간을 설정할 수 있습니다. 예를 들어, 특정 게스트에게만 일주일간 접근을 허용하고 싶을 때 유용합니다.',
  },
  {
    question: '환불 정책은 어떻게 되나요?',
    answer: '결제 후 7일 이내에 요청하시면 전액 환불해드립니다. 설정 > 요금제에서 구독을 취소하거나, support@roomy.kr로 문의해주세요.',
  },
];

const contactOptions = [
  {
    icon: Mail,
    title: '이메일 문의',
    description: '24시간 내 답변',
    action: 'support@roomy.kr',
    href: 'mailto:support@roomy.kr',
  },
  {
    icon: MessageCircle,
    title: '채팅 상담',
    description: '평일 9-18시',
    action: '채팅 시작하기',
    href: '#chat',
  },
  {
    icon: FileText,
    title: '가이드 문서',
    description: '사용법 안내',
    action: '문서 보기',
    href: '/docs',
  },
];

export default function SupportPage() {
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <HelpCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            무엇을 도와드릴까요?
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            자주 묻는 질문을 확인하시거나, 직접 문의해주세요.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* 문의 방법 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {contactOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Card key={option.title} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-2">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{option.title}</CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <a href={option.href}>
                      {option.action}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">자주 묻는 질문</h2>
          <Accordion type="single" collapsible className="bg-white rounded-xl shadow-sm">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`}>
                <AccordionTrigger className="px-6 text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* CTA */}
        <div className="text-center bg-gray-100 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            찾는 답변이 없나요?
          </h3>
          <p className="text-gray-600 mb-6">
            직접 문의해주시면 빠르게 도와드리겠습니다.
          </p>
          <Button asChild>
            <a href="mailto:support@roomy.kr">
              문의하기
              <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
