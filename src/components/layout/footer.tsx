import Link from 'next/link';
import { Github, Youtube, Twitter, Mail } from 'lucide-react';

/**
 * Footer 컴포넌트
 * - 회사 정보, 링크, 소셜 아이콘
 * - Neo-Brutalism 스타일
 */

const footerLinks = {
  product: [
    { href: '/products', label: '상품 둘러보기' },
    { href: '/categories', label: '카테고리' },
    { href: '/new', label: '신규 상품' },
    { href: '/best', label: '베스트 셀러' },
  ],
  support: [
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: '문의하기' },
    { href: '/downloads', label: '다운로드 센터' },
    { href: '/refund', label: '환불 정책' },
  ],
  company: [
    { href: '/about', label: '회사 소개' },
    { href: '/blog', label: '블로그' },
    { href: '/careers', label: '채용' },
    { href: '/press', label: '보도자료' },
  ],
  legal: [
    { href: '/terms', label: '이용약관' },
    { href: '/privacy', label: '개인정보처리방침' },
    { href: '/license', label: '라이선스' },
  ],
};

const socialLinks = [
  { href: 'https://github.com/vibelabs', icon: Github, label: 'GitHub' },
  { href: 'https://youtube.com/@vibelabs', icon: Youtube, label: 'YouTube' },
  { href: 'https://twitter.com/vibelabs', icon: Twitter, label: 'Twitter' },
  { href: 'mailto:hello@vibestore.com', icon: Mail, label: 'Email' },
];

export function Footer() {
  return (
    <footer className="w-full border-t-3 border-neo-black bg-neo-white">
      {/* 메인 푸터 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* 브랜드 소개 */}
          <div className="col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-block text-2xl sm:text-3xl font-black uppercase tracking-tight text-neo-black hover:text-neo-blue transition-colors"
            >
              VIBE STORE
            </Link>
            <p className="mt-4 text-sm text-neo-black/70 leading-relaxed">
              라이브 코딩으로 만드는 디지털 상품 쇼핑몰 스캘레톤
            </p>

            {/* 소셜 링크 */}
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center bg-neo-white border-3 border-neo-black shadow-neo-sm hover:bg-neo-blue hover:text-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-neo-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2.5} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* 상품 */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-neo-black">
              상품
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neo-black/70 hover:text-neo-blue hover:underline transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 고객지원 */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-neo-black">
              고객지원
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neo-black/70 hover:text-neo-blue hover:underline transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 회사 */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-neo-black">
              회사
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neo-black/70 hover:text-neo-blue hover:underline transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 법적 정보 */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-neo-black">
              약관 및 정책
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neo-black/70 hover:text-neo-blue hover:underline transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 하단 카피라이트 */}
      <div className="w-full border-t-3 border-neo-black bg-neo-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-neo-black/70">
              © 2026 Vibe Labs. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-neo-lime text-neo-black border-2 border-neo-black text-xs font-bold uppercase">
                MVP
              </span>
              <span className="text-xs text-neo-black/50 font-mono">
                v0.1.0
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
