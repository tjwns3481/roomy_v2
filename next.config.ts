// @TASK P7-T7.8 - Next.js 성능 최적화
// @SPEC docs/planning/06-tasks.md#P7-T7.8

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker 배포 시에만 standalone 사용 (Vercel은 자동 최적화)
  ...(process.env.DOCKER_BUILD === 'true' && { output: 'standalone' }),

  // 이미지 최적화
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co', // Supabase Storage (와일드카드)
      },
      {
        protocol: 'https',
        hostname: 'a0.muscache.com', // Airbnb 이미지
      },
      {
        protocol: 'https',
        hostname: 'a1.muscache.com',
      },
    ],
    formats: ['image/avif', 'image/webp'], // AVIF 우선, WebP 폴백
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048], // 반응형 이미지 크기
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // 작은 이미지 크기
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7일 캐싱
  },

  // 번들 분석 (ANALYZE=true npm run build 시 활성화)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config: any) => {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: './analyze.html',
          openAnalyzer: true,
        })
      );
      return config;
    },
  }),
};

export default nextConfig;
