/**
 * @TASK P7-T7.3 + UI-V2 - 랜딩 페이지 작동 방식 섹션
 * 감성 중심 디자인 - 가로 스크롤, 미니멀 카드
 */

'use client';

import { motion } from 'framer-motion';
import { Link2, Sparkles, Share2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    number: '01',
    icon: Link2,
    title: 'URL 입력',
    description: '에어비앤비 숙소 URL을 입력하세요',
    detail: '숙소 링크만 있으면 준비 완료',
    accent: 'coral',
  },
  {
    number: '02',
    icon: Sparkles,
    title: 'AI 생성',
    description: 'AI가 숙소 정보를 분석합니다',
    detail: '약 30초 내에 자동 생성',
    accent: 'mint',
  },
  {
    number: '03',
    icon: Share2,
    title: '공유',
    description: 'QR 코드로 게스트에게 전달하세요',
    detail: '앱 설치 없이 바로 사용',
    accent: 'amber',
  },
];

const accentColors = {
  coral: {
    bg: 'bg-coral',
    light: 'bg-coral-light',
    text: 'text-coral',
  },
  mint: {
    bg: 'bg-mint',
    light: 'bg-mint-light',
    text: 'text-mint',
  },
  amber: {
    bg: 'bg-amber',
    light: 'bg-amber-light',
    text: 'text-amber',
  },
};

export function HowItWorksSection() {
  return (
    <section className="py-24 lg:py-32 bg-white overflow-hidden">
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
            How it works
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl font-bold text-ink tracking-tight">
            간단한 3단계로
            <br />
            <span className="bg-gradient-to-r from-coral to-amber bg-clip-text text-transparent">
              가이드북 완성
            </span>
          </h2>
        </motion.div>

        {/* 단계 카드 */}
        <div className="relative">
          {/* 연결선 (데스크톱) - 애니메이션 */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 z-0 overflow-hidden">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="h-full bg-gradient-to-r from-coral via-mint to-amber origin-left"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const colors = accentColors[step.accent as keyof typeof accentColors];

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="relative"
                >
                  {/* 카드 */}
                  <div className="group bg-white border border-cloud rounded-3xl p-8 lg:p-10 hover:shadow-airbnb-sm hover:-translate-y-1 transition-all duration-500">
                    {/* 숫자 배지 */}
                    <div className={`absolute -top-5 left-8 w-10 h-10 ${colors.bg} rounded-full flex items-center justify-center shadow-md`}>
                      <span className="text-white font-bold text-sm">
                        {step.number}
                      </span>
                    </div>

                    {/* 아이콘 */}
                    <div className={`w-14 h-14 ${colors.light} rounded-2xl flex items-center justify-center
                      group-hover:scale-110 transition-transform duration-300 mb-6`}
                    >
                      <Icon className={`w-7 h-7 ${colors.text}`} />
                    </div>

                    {/* 제목 */}
                    <h3 className="text-2xl font-bold text-ink mb-3">
                      {step.title}
                    </h3>

                    {/* 설명 */}
                    <p className="text-stone mb-2">
                      {step.description}
                    </p>

                    {/* 세부 정보 */}
                    <p className="text-sm text-mist">
                      {step.detail}
                    </p>
                  </div>

                  {/* 화살표 (데스크톱) */}
                  {index < steps.length - 1 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.15 }}
                      className="hidden lg:flex absolute top-1/2 -right-6 w-12 h-12 bg-white border-2 border-cloud rounded-full items-center justify-center -translate-y-1/2 z-20 shadow-soft"
                    >
                      <ArrowRight className={`w-5 h-5 ${colors.text}`} />
                    </motion.div>
                  )}

                  {/* 화살표 (모바일) */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden flex justify-center my-4">
                      <div className="w-10 h-10 bg-snow rounded-full flex items-center justify-center">
                        <ArrowRight className="w-5 h-5 text-stone rotate-90" />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-coral text-white rounded-full font-semibold
              shadow-coral hover:shadow-coral-lg hover:bg-coral-dark
              transition-all duration-300"
          >
            지금 바로 시작하기
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-4 text-sm text-mist">
            신용카드 등록 없이 무료로 시작
          </p>
        </motion.div>
      </div>
    </section>
  );
}
