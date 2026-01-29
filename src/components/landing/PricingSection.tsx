// @TASK P7-T7.3 - 랜딩 페이지 플랜 비교 섹션
// @SPEC docs/planning/06-tasks.md#P7-T7.3

'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: 0,
    description: '개인 호스트에게 적합',
    features: [
      '가이드북 1개',
      'AI 생성 3회/월',
      '기본 블록 (히어로, 공지사항 등)',
      'QR 코드 생성',
      'Roomy 워터마크',
    ],
    cta: '무료로 시작하기',
    href: '/signup',
  },
  {
    name: 'Pro',
    price: 29000,
    description: '전문 호스트를 위한',
    features: [
      '가이드북 5개',
      'AI 생성 30회/월',
      '모든 블록 사용 가능',
      '워터마크 제거',
      'QR 코드 커스터마이징',
      '우선 고객 지원',
    ],
    cta: '14일 무료 체험',
    href: '/signup?plan=pro',
    popular: true,
  },
  {
    name: 'Business',
    price: 99000,
    description: '숙박 사업자를 위한',
    features: [
      '무제한 가이드북',
      '무제한 AI 생성',
      '커스텀 도메인',
      '워터마크 제거',
      'API 액세스',
      '전담 고객 지원',
      '화이트라벨 옵션',
    ],
    cta: '문의하기',
    href: '/contact',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function PricingSection() {
  return (
    <section className="w-full py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
            당신에게 맞는 플랜을
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              선택하세요
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            모든 플랜은 14일 무료 체험이 가능합니다
          </p>
        </motion.div>

        {/* 플랜 카드 */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={item}
              className={`relative bg-white border-2 rounded-2xl p-8 transition-all ${
                plan.popular
                  ? 'border-blue-500 shadow-xl scale-105'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
              }`}
            >
              {/* 인기 배지 */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-2 px-4 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-full shadow-lg">
                    <Sparkles className="w-4 h-4" />
                    인기
                  </div>
                </div>
              )}

              {/* 플랜 이름 */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </div>

              {/* 가격 */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-2">
                  {plan.price === 0 ? (
                    <span className="text-4xl font-bold text-gray-900">무료</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-gray-900">
                        ₩{(plan.price / 1000).toFixed(0)}K
                      </span>
                      <span className="text-gray-600">/월</span>
                    </>
                  )}
                </div>
                {plan.price > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    연간 결제 시 월 ₩{Math.round(plan.price / 12).toLocaleString()}
                  </p>
                )}
              </div>

              {/* 기능 목록 */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA 버튼 */}
              <Link
                href={plan.href}
                className={`block w-full text-center px-6 py-3 rounded-lg font-semibold transition-all ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* 추가 정보 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600">
            더 많은 기능이 필요하신가요?{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-semibold">
              맞춤형 플랜 문의하기
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
