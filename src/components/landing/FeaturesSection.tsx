/**
 * @TASK P7-T7.3 + UI-V2 - 랜딩 페이지 기능 소개 섹션
 * 감성 중심 디자인 - 미니멀 카드, 비대칭 그리드
 */

'use client';

import { motion } from 'framer-motion';
import { Sparkles, Layers, QrCode, MessageCircle } from 'lucide-react';

const features = [
  {
    number: '01',
    icon: Sparkles,
    title: 'AI 자동 생성',
    description: '에어비앤비 URL만 입력하면 AI가 숙소 정보를 분석해 가이드북을 자동으로 만들어드립니다.',
    accent: 'coral',
  },
  {
    number: '02',
    icon: Layers,
    title: '블록 에디터',
    description: '드래그 앤 드롭으로 자유롭게 편집하세요. 실시간 미리보기로 결과를 바로 확인할 수 있습니다.',
    accent: 'mint',
  },
  {
    number: '03',
    icon: QrCode,
    title: 'QR 공유',
    description: 'QR 코드 하나로 게스트에게 간편하게 전달하세요. 앱 설치 없이 바로 접근 가능합니다.',
    accent: 'amber',
  },
  {
    number: '04',
    icon: MessageCircle,
    title: 'AI 챗봇',
    description: '게스트의 궁금증을 AI 챗봇이 24시간 응대합니다. 호스트의 시간을 절약해드립니다.',
    accent: 'coral',
  },
];

const accentColors = {
  coral: {
    bg: 'bg-coral',
    light: 'bg-coral-light',
    text: 'text-coral',
    border: 'group-hover:border-coral/30',
  },
  mint: {
    bg: 'bg-mint',
    light: 'bg-mint-light',
    text: 'text-mint',
    border: 'group-hover:border-mint/30',
  },
  amber: {
    bg: 'bg-amber',
    light: 'bg-amber-light',
    text: 'text-amber',
    border: 'group-hover:border-amber/30',
  },
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 lg:py-32 bg-snow">
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
            Features
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl font-bold text-ink tracking-tight">
            3가지 핵심 기능으로
            <br />
            <span className="bg-gradient-to-r from-coral to-amber bg-clip-text text-transparent">
              5분 만에 가이드북 완성
            </span>
          </h2>
          <p className="mt-6 text-lg text-stone">
            복잡한 설정 없이 간단하게 시작하세요.
            에어비앤비 링크 하나면 충분합니다.
          </p>
        </motion.div>

        {/* 비대칭 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colors = accentColors[feature.accent as keyof typeof accentColors];
            const isLarge = index === 0 || index === 3;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`group bg-white border border-cloud rounded-3xl p-8 lg:p-10
                  hover:shadow-airbnb-sm hover:-translate-y-1 transition-all duration-500
                  ${colors.border}
                  ${isLarge ? 'lg:col-span-7' : 'lg:col-span-5'}
                  ${index === 1 ? 'lg:col-start-8' : ''}
                  ${index === 3 ? 'lg:col-start-6' : ''}
                `}
              >
                {/* 번호 */}
                <span className="text-sm font-medium text-mist tracking-widest">
                  {feature.number}
                </span>

                {/* 아이콘 */}
                <div className={`mt-6 w-14 h-14 ${colors.light} rounded-2xl flex items-center justify-center
                  group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                >
                  <Icon className={`w-7 h-7 ${colors.text} group-hover:scale-110 transition-transform duration-300`} />
                </div>

                {/* 제목 */}
                <h3 className="mt-6 text-2xl font-bold text-ink">
                  {feature.title}
                </h3>

                {/* 설명 */}
                <p className="mt-4 text-stone leading-relaxed">
                  {feature.description}
                </p>

                {/* 화살표 */}
                <div className={`mt-6 flex items-center gap-2 text-mist group-hover:${colors.text} transition-colors duration-300`}>
                  <span className="text-sm font-medium">자세히 보기</span>
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 플랫폼 지원 배지 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-4"
        >
          <span className="text-sm text-stone">지원 플랫폼:</span>
          {['에어비앤비', '네이버 블로그', '야놀자', '여기어때'].map((platform) => (
            <span
              key={platform}
              className="px-4 py-2 bg-white border border-cloud rounded-full text-sm font-medium text-charcoal"
            >
              {platform}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
