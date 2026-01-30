/**
 * @TASK P7-T7.3 + UI-V2 - 랜딩 페이지 플랜 비교 섹션
 * 감성 중심 디자인 - 미니멀 카드, 강조 포인트
 */

'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    description: '개인 호스트에게 적합',
    price: 0,
    priceNumber: '무료',
    features: [
      '가이드북 1개',
      'AI 생성 3회/월',
      '기본 블록 (히어로, 공지사항 등)',
      'QR 코드 생성',
      'Roomy 워터마크',
    ],
    cta: '무료로 시작하기',
    href: '/signup',
    popular: false,
  },
  {
    name: 'Pro',
    description: '전문 호스트를 위한',
    price: 29000,
    priceNumber: '29,000',
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
    description: '숙박 사업자를 위한',
    price: 99000,
    priceNumber: '99,000',
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
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* 섹션 헤더 - 왼쪽 정렬 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-16"
        >
          <span className="text-sm font-semibold text-coral uppercase tracking-widest">
            Pricing
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl font-bold text-ink tracking-tight">
            당신에게 맞는 플랜을
            <br />
            <span className="bg-gradient-to-r from-coral to-amber bg-clip-text text-transparent">
              선택하세요
            </span>
          </h2>
          <p className="mt-6 text-lg text-stone">
            모든 유료 플랜은 14일 무료 체험이 가능합니다.
            신용카드 등록 없이 시작하세요.
          </p>
        </motion.div>

        {/* 플랜 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative bg-white rounded-3xl p-8 lg:p-10 transition-all duration-500
                ${
                  plan.popular
                    ? 'border-2 border-coral shadow-airbnb scale-105 md:scale-110 z-10'
                    : 'border border-cloud hover:border-coral/30 hover:shadow-airbnb-sm hover:-translate-y-1'
                }
              `}
            >
              {/* 인기 배지 */}
              {plan.popular && (
                <div className="absolute -top-4 left-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white text-sm font-semibold rounded-full">
                    <Sparkles className="w-4 h-4" />
                    인기
                  </div>
                </div>
              )}

              {/* 플랜 정보 */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-ink">{plan.name}</h3>
                <p className="mt-2 text-stone">{plan.description}</p>
              </div>

              {/* 가격 */}
              <div className="mb-8 pb-8 border-b border-cloud">
                {plan.price === 0 ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-ink tracking-tight">
                      무료
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-semibold text-charcoal">₩</span>
                      <span className="text-5xl font-bold text-ink tracking-tight">
                        {plan.priceNumber}
                      </span>
                      <span className="text-charcoal font-medium">/월</span>
                    </div>
                    <p className="mt-2 text-sm text-mist">
                      연간 결제 시 2개월 무료 (₩{(plan.price * 10).toLocaleString()}/년)
                    </p>
                  </>
                )}
              </div>

              {/* 기능 목록 */}
              <ul className="space-y-4 mb-10">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center
                      ${plan.popular ? 'bg-ink' : 'bg-mint-light'}`}
                    >
                      <Check className={`w-3 h-3 ${plan.popular ? 'text-white' : 'text-mint'}`} />
                    </div>
                    <span className="text-charcoal">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA 버튼 */}
              <Link
                href={plan.href}
                className={`block w-full py-4 text-center font-semibold rounded-full transition-all duration-300
                  ${
                    plan.popular
                      ? 'bg-coral text-white shadow-coral hover:shadow-coral-lg hover:bg-coral-dark'
                      : 'bg-snow text-ink hover:bg-ink hover:text-white'
                  }
                `}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* 추가 정보 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-stone">
            더 많은 기능이 필요하신가요?{' '}
            <Link href="/contact" className="text-coral font-semibold hover:text-coral-dark transition-colors">
              맞춤형 플랜 문의하기 →
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
