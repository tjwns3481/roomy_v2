// @TASK P8-S2-T1 - QuickInfoBlock 테스트
// @SPEC specs/screens/guest-viewer.yaml

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuickInfoBlock } from '@/components/guest/blocks/QuickInfoBlock';
import { QuickInfoContent } from '@/types/block';

// useCopyToClipboard 훅 모킹
jest.mock('@/hooks/useCopyToClipboard', () => ({
  useCopyToClipboard: () => ({
    copy: jest.fn().mockResolvedValue(true),
  }),
}));

describe('QuickInfoBlock (AirBnB Style)', () => {
  const mockContent: QuickInfoContent = {
    checkIn: '15:00',
    checkOut: '11:00',
    wifi: {
      ssid: 'MyWiFi',
      password: 'password123',
    },
    doorLock: {
      password: '1234',
      instructions: '비밀번호 입력 후 # 누르기',
    },
    address: '서울시 강남구 테헤란로 123',
    coordinates: {
      lat: 37.5665,
      lng: 126.978,
    },
  };

  it('체크인/체크아웃 시간을 표시한다', () => {
    render(<QuickInfoBlock content={mockContent} />);

    expect(screen.getByText('15:00')).toBeInTheDocument();
    expect(screen.getByText('11:00')).toBeInTheDocument();
  });

  it('WiFi 정보를 표시한다', () => {
    render(<QuickInfoBlock content={mockContent} />);

    expect(screen.getByText('MyWiFi')).toBeInTheDocument();
    expect(screen.getByText('•'.repeat(12))).toBeInTheDocument(); // 비밀번호 숨김
  });

  it('WiFi 비밀번호를 토글할 수 있다', async () => {
    render(<QuickInfoBlock content={mockContent} />);

    const toggleButton = screen.getAllByLabelText(/WiFi 비밀번호/)[0];
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText('password123')).toBeInTheDocument();
    });
  });

  it('도어락 정보를 표시한다', () => {
    render(<QuickInfoBlock content={mockContent} />);

    expect(screen.getByText('비밀번호 입력 후 # 누르기')).toBeInTheDocument();
  });

  it('주소를 표시한다', () => {
    render(<QuickInfoBlock content={mockContent} />);

    expect(screen.getByText('서울시 강남구 테헤란로 123')).toBeInTheDocument();
  });

  it('AirBnB 스타일 클래스를 적용한다', () => {
    const { container } = render(<QuickInfoBlock content={mockContent} />);

    // shadow-airbnb-sm 클래스 체크
    const cards = container.querySelectorAll('.shadow-airbnb-sm');
    expect(cards.length).toBeGreaterThan(0);

    // rounded-xl 체크
    const roundedElements = container.querySelectorAll('.rounded-xl');
    expect(roundedElements.length).toBeGreaterThan(0);
  });

  it('터치 친화적 버튼 크기를 사용한다', () => {
    const { container } = render(<QuickInfoBlock content={mockContent} />);

    // min-h-[44px] 클래스 체크
    const buttons = container.querySelectorAll('.min-h-\\[44px\\]');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
