// @TASK P7-T7.3 - 랜딩 페이지 히어로 섹션
// @SPEC docs/planning/06-tasks.md#P7-T7.3

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-b overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-3xl">
          {/* 배지 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full text-sm font-medium text-blue-700 mb-6 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI 기반 자동 생성</span>
          </motion.div>

          {/* 메인 헤드라인 */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight"
          >
            에어비앤비 링크 하나로
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              게스트 가이드북을 자동 생성하세요
            </span>
          </motion.h1>

          {/* 서브 헤드라인 */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-gray-700 leading-relaxed"
          >
            AI가 숙소 정보를 분석하여 모바일 친화적인 가이드북을 만들어드립니다.
            <br />
            더 이상 수동으로 정보를 입력할 필요가 없습니다.
          </motion.p>

          {/* CTA 버튼 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 group"
            >
              무료로 시작하기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all hover:scale-105"
            >
              데모 보기
            </Link>
          </motion.div>

          {/* 소셜 프루프 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex items-center gap-6 text-sm text-gray-600"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-white"
                  />
                ))}
              </div>
              <span className="font-medium">100+ 호스트가 사용 중</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★★★★★</span>
              <span className="font-medium">4.9/5.0</span>
            </div>
          </motion.div>
        </div>

        {/* 우측 이미지 (모바일 목업) */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-80"
        >
          <div className="relative">
            {/* 모바일 프레임 */}
            <div className="bg-gray-900 rounded-[3rem] p-4 shadow-2xl">
              <div className="bg-white rounded-[2.5rem] overflow-hidden aspect-[9/19]">
                {/* 스크린샷 플레이스홀더 */}
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <div className="text-center p-6">
                    <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <p className="text-sm font-semibold text-gray-700">
                      게스트 가이드북
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      모바일 최적화 뷰어
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* 플로팅 배지 */}
            <div className="absolute -top-4 -right-4 bg-white rounded-xl p-3 shadow-lg border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-gray-700">
                  실시간 업데이트
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
