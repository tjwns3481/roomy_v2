// @TASK P7-T7.3 - 랜딩 페이지 푸터
// @SPEC docs/planning/06-tasks.md#P7-T7.3

'use client';

import Link from 'next/link';
import { BookOpen, Mail, Instagram, Youtube } from 'lucide-react';

const footerLinks = {
  product: [
    { name: '기능', href: '#features' },
    { name: '요금제', href: '#pricing' },
    { name: '데모', href: '/demo' },
  ],
  company: [
    { name: '회사 소개', href: '/about' },
    { name: '블로그', href: '/blog' },
    { name: '고객센터', href: '/support' },
  ],
  legal: [
    { name: '이용약관', href: '/terms' },
    { name: '개인정보처리방침', href: '/privacy' },
    { name: '환불 정책', href: '/refund' },
  ],
};

const socialLinks = [
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/roomy.kr' },
  { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/@roomy' },
  { name: 'Email', icon: Mail, href: 'mailto:support@roomy.kr' },
];

export function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* 상단 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* 브랜드 */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <BookOpen className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-white">Roomy</span>
            </Link>
            <p className="text-gray-400 leading-relaxed mb-4">
              한국형 디지털 게스트 가이드북 SaaS
              <br />
              AI로 간편하게, 게스트에게 완벽하게
            </p>
            {/* 소셜 링크 */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* 제품 */}
          <div>
            <h3 className="text-white font-semibold mb-4">제품</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 회사 */}
          <div>
            <h3 className="text-white font-semibold mb-4">회사</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 법적 정보 */}
          <div>
            <h3 className="text-white font-semibold mb-4">법적 정보</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* 저작권 */}
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Roomy. All rights reserved.
            </p>

            {/* 사업자 정보 */}
            <div className="text-sm text-gray-400 text-center md:text-right">
              <p>주식회사 루미 | 대표: 홍길동</p>
              <p>사업자등록번호: 123-45-67890 | 통신판매업신고: 제2024-서울강남-01234호</p>
              <p>서울특별시 강남구 테헤란로 123, 4층 | 대표전화: 02-1234-5678</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
