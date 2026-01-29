// @TASK P7-T7.3 - 랜딩 페이지 기능 소개 섹션
// @SPEC docs/planning/06-tasks.md#P7-T7.3

'use client';

import { motion } from 'framer-motion';
import { Link2, Edit3, QrCode, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI 자동 생성',
    description: '에어비앤비 URL만 입력하세요. AI가 숙소 정보를 분석하여 가이드북을 자동으로 생성합니다.',
    gradient: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Edit3,
    title: '블록 에디터',
    description: '드래그 앤 드롭으로 쉽게 커스터마이징하세요. 실시간 미리보기로 결과를 바로 확인할 수 있습니다.',
    gradient: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
  },
  {
    icon: QrCode,
    title: 'QR 공유',
    description: 'QR 코드를 생성하여 게스트에게 간편하게 전달하세요. 앱 설치 없이 바로 접근 가능합니다.',
    gradient: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function FeaturesSection() {
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
            3가지 핵심 기능으로
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              5분 만에 가이드북 완성
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            복잡한 설정 없이 간단하게 시작하세요
          </p>
        </motion.div>

        {/* 기능 카드 */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={item}
                whileHover={{ y: -8 }}
                className="relative bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all group"
              >
                {/* 배경 그라데이션 */}
                <div className={`absolute inset-0 ${feature.bgColor} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />

                {/* 콘텐츠 */}
                <div className="relative">
                  {/* 아이콘 */}
                  <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl shadow-lg mb-6`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* 제목 */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>

                  {/* 설명 */}
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* 장식 요소 */}
                  <div className={`absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-full filter blur-2xl opacity-0 group-hover:opacity-20 transition-opacity`} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* 추가 설명 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full">
            <Link2 className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              에어비앤비, 네이버 블로그 등 다양한 플랫폼 지원
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
