// @TASK P2-T2.5 - 게스트 뷰 하단 네비게이션 바
// @SPEC docs/planning/06-tasks.md#P2-T2.5
// @TEST src/__tests__/components/guest/BottomNav.test.tsx

'use client';

import { useEffect, useState } from 'react';
import { Home, MapPin, Info, List, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BlockType } from '@/types/guidebook';

interface NavItem {
  icon: React.ElementType;
  label: string;
  sectionId: string;
  blockType?: BlockType;
}

interface BottomNavProps {
  /**
   * 가이드북에 존재하는 블록 타입 목록
   */
  availableBlocks: BlockType[];
}

const NAV_ITEMS: NavItem[] = [
  {
    icon: Home,
    label: '홈',
    sectionId: 'top',
  },
  {
    icon: MapPin,
    label: '지도',
    sectionId: 'block-map',
    blockType: 'map',
  },
  {
    icon: Info,
    label: '정보',
    sectionId: 'block-quickInfo',
    blockType: 'quickInfo',
  },
  {
    icon: List,
    label: '규칙',
    sectionId: 'block-rules',
    blockType: 'rules',
  },
  {
    icon: MessageCircle,
    label: '문의',
    sectionId: 'contact',
  },
];

/**
 * 게스트 뷰 하단 네비게이션 바
 *
 * Features:
 * - 섹션 스크롤 연동
 * - Intersection Observer로 현재 섹션 감지
 * - iOS safe-area 지원
 * - 블록 존재 여부에 따라 네비 항목 숨김
 */
export function BottomNav({ availableBlocks }: BottomNavProps) {
  const [activeSection, setActiveSection] = useState<string>('top');

  useEffect(() => {
    // Intersection Observer로 현재 보이는 섹션 감지
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px', // 화면 중앙에 있을 때 활성화
      threshold: 0,
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // 모든 섹션 관찰
    const sections = NAV_ITEMS.map((item) => item.sectionId)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);

  /**
   * 섹션으로 스크롤
   */
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * 네비 항목이 활성화되어야 하는지 확인
   */
  const isItemEnabled = (item: NavItem): boolean => {
    // 홈과 문의는 항상 활성화
    if (!item.blockType) {
      return true;
    }

    // 해당 블록 타입이 가이드북에 존재하는지 확인
    return availableBlocks.includes(item.blockType);
  };

  /**
   * 활성화된 네비 항목만 필터링
   */
  const enabledItems = NAV_ITEMS.filter(isItemEnabled);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-gray-200 md:hidden"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)', // iOS safe area 지원
      }}
      aria-label="메인 네비게이션"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {enabledItems.map((item) => {
          const isActive = activeSection === item.sectionId;
          const Icon = item.icon;

          return (
            <button
              key={item.sectionId}
              onClick={() => scrollToSection(item.sectionId)}
              className={cn(
                'flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200',
                'min-w-[64px] min-h-[64px]', // 44x44px 최소 터치 타겟
                'hover:bg-gray-100 active:scale-95',
                isActive
                  ? 'text-coral bg-coral-light'
                  : 'text-gray-600 hover:text-gray-900'
              )}
              aria-label={`${item.label}로 이동`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={cn(
                  'w-5 h-5 mb-1 transition-transform',
                  isActive && 'scale-110'
                )}
              />
              <span
                className={cn(
                  'text-xs font-medium',
                  isActive && 'font-semibold'
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
