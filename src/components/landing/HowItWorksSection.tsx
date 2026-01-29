// @TASK P7-T7.3 - 랜딩 페이지 작동 방식 섹션
// @SPEC docs/planning/06-tasks.md#P7-T7.3

'use client';

import { motion } from 'framer-motion';
import { Link, Sparkles, Share2, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Link,
    title: 'URL 입력',
    description: '에어비앤비 숙소 URL을 입력하세요',
    detail: '숙소 링크만 있으면 준비 완료',
  },
  {
    number: '02',
    icon: Sparkles,
    title: 'AI 생성',
    description: 'AI가 숙소 정보를 분석합니다',
    detail: '약 30초 내에 자동 생성',
  },
  {
    number: '03',
    icon: Share2,
    title: '공유',
    description: 'QR 코드로 게스트에게 전달하세요',
    detail: '앱 설치 없이 바로 사용',
  },
];

export function HowItWorksSection() {
  return (
    <section className="w-full py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
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
            간단한 3단계로
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              가이드북 완성
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            복잡한 작업 없이 누구나 쉽게 만들 수 있습니다
          </p>
        </motion.div>

        {/* 단계 */}
        <div className="relative">
          {/* 연결선 (데스크톱) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-4 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="relative"
                >
                  {/* 카드 */}
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-blue-300 hover:shadow-xl transition-all group">
                    {/* 숫자 배지 */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {step.number}
                      </span>
                    </div>

                    {/* 아이콘 */}
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl mb-6 group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>

                    {/* 제목 */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>

                    {/* 설명 */}
                    <p className="text-gray-600 mb-2 font-medium">
                      {step.description}
                    </p>

                    {/* 세부 정보 */}
                    <p className="text-sm text-gray-500">
                      {step.detail}
                    </p>
                  </div>

                  {/* 화살표 (데스크톱) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 z-20">
                      <ArrowRight className="w-8 h-8 text-blue-400" />
                    </div>
                  )}

                  {/* 화살표 (모바일) */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden flex justify-center my-4">
                      <ArrowRight className="w-8 h-8 text-blue-400 rotate-90" />
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
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <a
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 group"
          >
            지금 바로 시작하기
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <p className="mt-4 text-sm text-gray-500">
            신용카드 등록 없이 무료로 시작
          </p>
        </motion.div>
      </div>
    </section>
  );
}
