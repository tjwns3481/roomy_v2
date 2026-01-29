/**
 * @TASK P7-T7.3 + UI-V2 - 랜딩 페이지 FAQ 섹션
 * 감성 중심 디자인 - 미니멀 아코디언, 깔끔한 타이포그래피
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import Link from 'next/link';

const faqs = [
  {
    question: '무료 플랜으로 무엇을 할 수 있나요?',
    answer:
      '무료 플랜에서는 가이드북 1개를 만들 수 있으며, AI 자동 생성 기능을 월 3회까지 사용할 수 있습니다. 기본 블록(히어로, 공지사항, 지도 등)을 사용하여 가이드북을 구성하고, QR 코드로 게스트에게 공유할 수 있습니다.',
  },
  {
    question: 'AI 생성은 어떻게 작동하나요?',
    answer:
      '에어비앤비 숙소 URL을 입력하면, AI가 해당 페이지의 정보(제목, 설명, 편의시설, 위치 등)를 자동으로 분석하여 가이드북 초안을 생성합니다. 생성된 가이드북은 블록 에디터로 자유롭게 수정할 수 있습니다. 전체 과정은 약 30초 소요됩니다.',
  },
  {
    question: '게스트가 앱을 설치해야 하나요?',
    answer:
      '아니요! 게스트는 QR 코드를 스캔하거나 링크를 클릭하면 웹 브라우저에서 바로 가이드북을 볼 수 있습니다. 별도의 앱 설치나 회원가입이 필요하지 않습니다. 모바일에 최적화되어 있어 어떤 기기에서든 편리하게 이용할 수 있습니다.',
  },
  {
    question: '결제는 어떻게 진행되나요?',
    answer:
      '모든 플랜은 14일 무료 체험이 가능합니다. 체험 기간 동안 언제든지 해지할 수 있으며, 별도 비용은 발생하지 않습니다. 체험 후 계속 사용하시려면 연간 결제로 진행되며, 카드 결제를 통해 자동으로 갱신됩니다.',
  },
  {
    question: 'Pro 플랜과 Business 플랜의 차이는 무엇인가요?',
    answer:
      'Pro 플랜은 개인 호스트나 소규모 사업자에게 적합하며, 최대 5개의 가이드북과 월 30회 AI 생성을 제공합니다. Business 플랜은 다수의 숙소를 운영하는 사업자를 위한 것으로, 무제한 가이드북과 AI 생성, 커스텀 도메인, API 액세스 등 고급 기능을 제공합니다.',
  },
  {
    question: '가이드북을 수정하면 실시간으로 반영되나요?',
    answer:
      '네! 가이드북을 수정하고 저장하면 즉시 게스트 화면에 반영됩니다. 게스트가 가이드북을 보고 있는 중이라도 새로고침하면 최신 내용을 확인할 수 있습니다. 체크인 직전까지도 정보를 업데이트할 수 있어 매우 편리합니다.',
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-cloud last:border-0">
      <button
        onClick={onToggle}
        className="w-full py-6 flex items-start justify-between gap-4 text-left group"
      >
        <span className="text-lg font-semibold text-ink group-hover:text-coral transition-colors duration-300">
          {question}
        </span>
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
            ${isOpen ? 'bg-coral text-white' : 'bg-snow text-stone group-hover:bg-coral-light'}`}
        >
          {isOpen ? (
            <Minus className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-stone leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 lg:py-32 bg-snow">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-coral uppercase tracking-widest">
            FAQ
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl font-bold text-ink tracking-tight">
            자주 묻는 질문
          </h2>
          <p className="mt-4 text-lg text-stone">
            궁금하신 점이 있으신가요?
          </p>
        </motion.div>

        {/* FAQ 목록 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-3xl border border-cloud p-8 lg:p-10"
        >
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </motion.div>

        {/* 추가 문의 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-stone mb-4">
            다른 질문이 있으신가요?
          </p>
          <Link
            href="mailto:support@roomy.kr"
            className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-white rounded-full font-semibold
              hover:bg-charcoal transition-colors duration-300"
          >
            고객센터 문의하기
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
