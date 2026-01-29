// @TASK P7-T7.3 - 회사 소개 페이지
import Link from 'next/link';
import { BookOpen, Users, Target, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: '회사 소개 | Roomy',
  description: 'Roomy는 숙박 호스트를 위한 디지털 게스트 가이드북 플랫폼입니다.',
};

const values = [
  {
    icon: Users,
    title: '호스트 중심',
    description: '복잡한 도구 대신, 호스트가 쉽게 사용할 수 있는 직관적인 서비스를 만듭니다.',
  },
  {
    icon: Target,
    title: '게스트 경험',
    description: '게스트가 필요한 정보를 쉽고 빠르게 찾을 수 있도록 설계합니다.',
  },
  {
    icon: Heart,
    title: '한국 시장 특화',
    description: '한국 숙박 시장의 특성을 이해하고, 현지화된 솔루션을 제공합니다.',
  },
];

const team = [
  { name: '대표', role: 'CEO & Founder', description: '숙박업 경험과 IT 전문성을 결합' },
  { name: '개발 리드', role: 'CTO', description: '10년+ 소프트웨어 개발 경험' },
  { name: '디자인 리드', role: 'Head of Design', description: '사용자 경험 디자인 전문가' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <BookOpen className="w-5 h-5" />
            <span>Roomy</span>
          </Link>
        </div>
      </div>

      {/* 히어로 */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            숙박의 새로운 경험을 만듭니다
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Roomy는 숙박 호스트와 게스트 모두를 위한
            디지털 가이드북 플랫폼입니다.
          </p>
        </div>
      </div>

      {/* 미션 */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">우리의 미션</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            숙박 호스트가 쉽게 전문적인 가이드북을 만들고,
            게스트가 최고의 숙박 경험을 할 수 있도록 돕습니다.
            AI 기술을 활용해 누구나 몇 분 만에 멋진 가이드북을 만들 수 있습니다.
          </p>
        </div>

        {/* 핵심 가치 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <div key={value.title} className="text-center p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            );
          })}
        </div>

        {/* 팀 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">팀</h2>
          <p className="text-gray-600">다양한 배경의 전문가들이 함께합니다</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {team.map((member) => (
            <div key={member.role} className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900">{member.name}</h3>
              <p className="text-blue-600 text-sm mb-2">{member.role}</p>
              <p className="text-gray-600 text-sm">{member.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-blue-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            함께 성장하고 싶다면
          </h3>
          <p className="text-gray-600 mb-6">
            Roomy와 함께할 팀원을 찾고 있습니다.
          </p>
          <Button asChild variant="outline">
            <a href="mailto:careers@roomy.kr">
              채용 문의하기
              <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
