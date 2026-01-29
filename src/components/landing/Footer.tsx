/**
 * @TASK P7-T7.3 + UI-V2 - 랜딩 페이지 푸터
 * 감성 중심 디자인 - 미니멀, 클린 레이아웃
 */

'use client';

import Link from 'next/link';
import { Instagram, Youtube, Mail } from 'lucide-react';

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
    <footer className="bg-snow border-t border-cloud">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        {/* 상단 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* 브랜드 */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 bg-ink rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl font-display">R</span>
              </div>
              <span className="text-xl font-bold text-ink tracking-tight">Roomy</span>
            </Link>
            <p className="mt-6 text-stone leading-relaxed max-w-sm">
              한국형 디지털 게스트 가이드북 SaaS
              <br />
              AI로 간편하게, 게스트에게 완벽하게
            </p>
            {/* 소셜 링크 */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center bg-white border border-cloud rounded-xl
                      hover:bg-ink hover:text-white hover:border-ink
                      transition-all duration-300"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* 링크 그룹 */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* 제품 */}
            <div>
              <h3 className="text-sm font-semibold text-ink uppercase tracking-widest mb-6">
                Product
              </h3>
              <ul className="space-y-4">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-stone hover:text-ink transition-colors duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 회사 */}
            <div>
              <h3 className="text-sm font-semibold text-ink uppercase tracking-widest mb-6">
                Company
              </h3>
              <ul className="space-y-4">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-stone hover:text-ink transition-colors duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 법적 정보 */}
            <div>
              <h3 className="text-sm font-semibold text-ink uppercase tracking-widest mb-6">
                Legal
              </h3>
              <ul className="space-y-4">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-stone hover:text-ink transition-colors duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-cloud pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* 저작권 */}
            <p className="text-sm text-mist">
              © {new Date().getFullYear()} Roomy. All rights reserved.
            </p>

            {/* 사업자 정보 */}
            <div className="text-xs text-mist space-y-1 lg:text-right">
              <p>주식회사 루미 | 대표: 홍길동 | 사업자등록번호: 123-45-67890</p>
              <p>서울특별시 강남구 테헤란로 123, 4층 | 대표전화: 02-1234-5678</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
