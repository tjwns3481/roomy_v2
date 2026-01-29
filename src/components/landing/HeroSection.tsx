/**
 * @TASK P7-T7.3 + UI-V2 - 랜딩 페이지 히어로 섹션
 * 감성 중심 디자인 - 대담한 타이포그래피, 비대칭 레이아웃
 */

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-white">
      {/* 배경 - 미니멀한 도형 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 우상단 큰 원 */}
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-coral-light rounded-full opacity-60" />
        {/* 좌하단 작은 원 */}
        <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-snow rounded-full" />
        {/* 플로팅 도형들 */}
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 right-1/4 w-16 h-16 border-2 border-coral/30 rounded-2xl rotate-12"
        />
        <motion.div
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/3 left-1/4 w-8 h-8 bg-mint/20 rounded-full"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* 왼쪽 텍스트 - 8 컬럼 */}
          <div className="lg:col-span-7">
            {/* 배지 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-snow text-charcoal rounded-full text-sm font-medium mb-8"
            >
              <span className="w-2 h-2 bg-mint rounded-full animate-pulse" />
              AI 기반 자동 생성
            </motion.div>

            {/* 메인 헤드라인 - 왼쪽 정렬, 대담한 크기 */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-ink tracking-tight leading-[1.05]"
            >
              에어비앤비 링크로
              <br />
              <span className="bg-gradient-to-r from-coral to-amber bg-clip-text text-transparent">
                5분 만에 가이드북
              </span>
            </motion.h1>

            {/* 서브 헤드라인 */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 text-xl text-stone leading-relaxed max-w-lg"
            >
              AI가 숙소 정보를 분석하여 모바일 친화적인
              디지털 가이드북을 자동으로 만들어드립니다.
            </motion.p>

            {/* CTA 버튼 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-coral text-white rounded-full font-semibold
                  shadow-coral hover:shadow-coral-lg hover:bg-coral-dark
                  transition-all duration-300"
              >
                무료로 시작하기
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/demo"
                className="group inline-flex items-center gap-2 px-8 py-4 text-ink font-semibold
                  hover:text-coral transition-colors duration-300"
              >
                <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center group-hover:bg-coral group-hover:border-coral group-hover:text-white transition-all duration-300">
                  <Play className="w-4 h-4 ml-0.5" />
                </div>
                데모 보기
              </Link>
            </motion.div>

            {/* 소셜 프루프 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 flex items-center gap-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {[
                    'from-coral to-amber',
                    'from-mint to-emerald-400',
                    'from-amber to-orange-400',
                    'from-violet-400 to-purple-400',
                  ].map((gradient, i) => (
                    <div
                      key={i}
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} border-3 border-white shadow-sm`}
                    />
                  ))}
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-ink">100+ 호스트</p>
                  <p className="text-mist">가 사용 중</p>
                </div>
              </div>
              <div className="h-8 w-px bg-cloud" />
              <div className="text-sm">
                <div className="flex items-center gap-1 text-amber font-medium">
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
                <p className="text-mist mt-0.5">평균 4.9점</p>
              </div>
            </motion.div>
          </div>

          {/* 우측 비주얼 - 5 컬럼 */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-5 relative"
          >
            {/* 모바일 목업 */}
            <div className="relative mx-auto w-72 lg:w-80">
              {/* 폰 프레임 */}
              <div className="bg-ink rounded-[3rem] p-3 shadow-soft-lg">
                <div className="bg-white rounded-[2.5rem] overflow-hidden aspect-[9/19]">
                  {/* 앱 화면 */}
                  <div className="w-full h-full bg-gradient-to-b from-coral-light to-white p-6 flex flex-col">
                    {/* 헤더 */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-10 h-10 bg-ink rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-sm">R</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-snow rounded-lg" />
                        <div className="w-8 h-8 bg-snow rounded-lg" />
                      </div>
                    </div>
                    {/* 콘텐츠 스켈레톤 */}
                    <div className="flex-1 space-y-4">
                      <div className="w-3/4 h-4 bg-snow rounded-full" />
                      <div className="w-1/2 h-4 bg-snow rounded-full" />
                      <div className="mt-6 aspect-video bg-snow rounded-2xl" />
                      <div className="space-y-2 mt-4">
                        <div className="w-full h-3 bg-snow rounded-full" />
                        <div className="w-5/6 h-3 bg-snow rounded-full" />
                        <div className="w-4/6 h-3 bg-snow rounded-full" />
                      </div>
                    </div>
                    {/* 하단 버튼 */}
                    <div className="mt-auto pt-4">
                      <div className="w-full h-12 bg-coral rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">AI 챗봇</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 플로팅 카드 - 실시간 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-soft border border-cloud"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-mint rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-ink">실시간 업데이트</span>
                </div>
              </motion.div>

              {/* 플로팅 카드 - QR */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-soft border border-cloud"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-snow rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-ink" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 13h6v6H3v-6zm2 2v2h2v-2H5zm13-2h1v1h-1v-1zm-4 0h1v1h-1v-1zm2 0h1v1h-1v-1zm0 2h1v1h-1v-1zm2 0h1v1h-1v-1zm-2 2h1v1h-1v-1zm2 0h1v1h-1v-1zm0 2h1v1h-1v-1z" />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-ink">QR 코드</p>
                    <p className="text-mist text-xs">간편 공유</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
