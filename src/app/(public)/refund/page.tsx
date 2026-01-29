// @TASK P7-T7.3 - 환불 정책 페이지
import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: '환불 정책 | Roomy',
  description: 'Roomy 서비스의 환불 정책입니다.',
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <BookOpen className="w-5 h-5" />
            <span>Roomy</span>
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">환불 정책</h1>
        <p className="text-gray-500 mb-8">최종 업데이트: 2024년 1월 1일</p>

        <div className="prose prose-gray max-w-none">
          <p className="text-lg">
            Roomy는 고객 만족을 최우선으로 생각합니다.
            서비스에 만족하지 못하신 경우, 아래 정책에 따라 환불을 요청하실 수 있습니다.
          </p>

          <h2>환불 가능 기간</h2>

          <div className="bg-blue-50 p-6 rounded-xl my-6">
            <h3 className="text-lg font-semibold text-blue-900 mt-0">7일 전액 환불 보장</h3>
            <p className="text-blue-800 mb-0">
              결제 후 7일 이내에는 어떤 이유로든 전액 환불이 가능합니다.
              별도의 질문 없이 처리해드립니다.
            </p>
          </div>

          <h2>환불 요청 방법</h2>
          <ol>
            <li>
              <strong>설정 페이지에서 직접 취소</strong>
              <br />
              설정 &gt; 요금제 페이지에서 구독을 취소할 수 있습니다.
            </li>
            <li>
              <strong>이메일 요청</strong>
              <br />
              support@roomy.kr로 환불을 요청해주세요.
              <ul>
                <li>제목: [환불 요청] 회원 이메일</li>
                <li>본문: 환불 사유 (선택사항)</li>
              </ul>
            </li>
          </ol>

          <h2>환불 처리 기간</h2>
          <ul>
            <li>환불 요청 접수 후 <strong>3영업일 이내</strong>에 처리됩니다.</li>
            <li>결제 수단에 따라 실제 환불까지 추가 시간이 소요될 수 있습니다:
              <ul>
                <li>신용카드: 3-7영업일</li>
                <li>체크카드: 3-7영업일</li>
                <li>계좌이체: 1-3영업일</li>
              </ul>
            </li>
          </ul>

          <h2>환불 금액</h2>

          <h3>7일 이내 취소</h3>
          <p>결제 금액 전액을 환불해드립니다.</p>

          <h3>7일 이후 취소</h3>
          <ul>
            <li>이미 이용한 기간에 대한 비용을 제외하고 잔여 금액을 일할 계산하여 환불합니다.</li>
            <li>월간 플랜: 잔여 일수 기준 일할 계산</li>
            <li>연간 플랜: 잔여 월수 기준 월할 계산</li>
          </ul>

          <div className="bg-gray-50 p-6 rounded-xl my-6">
            <h4 className="font-semibold text-gray-900 mt-0">예시</h4>
            <p className="text-gray-700 mb-0">
              연간 플랜(120,000원)을 결제하고 3개월 사용 후 취소하는 경우:
              <br />
              환불 금액 = 120,000원 × (9개월 / 12개월) = 90,000원
            </p>
          </div>

          <h2>환불 불가 사항</h2>
          <ul>
            <li>이미 사용한 AI 생성 크레딧</li>
            <li>서비스 약관 위반으로 인한 계정 정지의 경우</li>
            <li>프로모션 또는 무료 이벤트를 통해 제공된 서비스</li>
          </ul>

          <h2>구독 취소 후 서비스 이용</h2>
          <ul>
            <li>구독 취소 후에도 결제 주기 종료일까지 서비스를 정상 이용할 수 있습니다.</li>
            <li>결제 주기 종료 후에는 무료 플랜으로 자동 전환됩니다.</li>
            <li>기존에 생성한 가이드북은 삭제되지 않으며, 무료 플랜 한도 내에서 계속 이용 가능합니다.</li>
          </ul>

          <h2>문의</h2>
          <p>
            환불 정책에 관한 문의사항이 있으시면 언제든지 연락해주세요.
          </p>
          <ul>
            <li>이메일: support@roomy.kr</li>
            <li>고객센터: 02-1234-5678 (평일 9:00-18:00)</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-12 p-6 bg-gray-50 rounded-xl text-center">
          <p className="text-gray-600 mb-4">환불 요청이 필요하신가요?</p>
          <Button asChild>
            <a href="mailto:support@roomy.kr">
              환불 요청하기
              <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
