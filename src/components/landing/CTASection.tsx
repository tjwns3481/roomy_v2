/**
 * @TASK P7-T7.3 + UI-V2 - 랜딩 페이지 CTA 섹션
 * 감성 중심 디자인 - 깔끔한 배경, 대담한 타이포그래피
 */

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

const benefits = [
  '신용카드 등록 불필요',
  '14일 무료 체험',
  '언제든지 해지 가능',
];

export function CTASection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-ink">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 그라데이션 원 */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-coral/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-amber/10 rounded-full blur-3xl" />
        {/* 그리드 패턴 */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        {/* 헤드라인 */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight"
        >
          지금 바로
          <br />
          <span className="bg-gradient-to-r from-coral to-amber bg-clip-text text-transparent">
            시작하세요
          </span>
        </motion.h2>

        {/* 서브 헤드라인 */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 text-xl text-white/70 max-w-xl mx-auto"
        >
          에어비앤비 링크 하나로 5분 만에 전문적인 가이드북을 만들어보세요.
        </motion.p>

        {/* CTA 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/signup"
            aria-label="무료로 가이드북 만들기 - 회원가입"
            className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-ink rounded-full
              font-semibold text-lg shadow-soft-lg hover:shadow-2xl
              hover:scale-105 transition-all duration-300 will-change-transform"
          >
            무료로 가이드북 만들기
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 px-8 py-5 text-white font-semibold
              border-2 border-white/30 rounded-full hover:bg-white/10
              transition-all duration-300"
          >
            데모 체험하기
          </Link>
        </motion.div>

        {/* 보증 문구 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-6"
        >
          {benefits.map((benefit) => (
            <div key={benefit} className="flex items-center gap-2 text-white/60">
              <div className="w-5 h-5 rounded-full bg-mint/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-mint" />
              </div>
              <span className="text-sm">{benefit}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
