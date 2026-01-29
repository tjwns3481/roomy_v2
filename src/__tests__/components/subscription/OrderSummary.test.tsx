/**
 * @TASK P6-T6.5 - OrderSummary 컴포넌트 테스트
 * @SPEC docs/planning/06-tasks.md#P6-T6.5
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { OrderSummary } from '@/components/subscription/OrderSummary';

describe('OrderSummary', () => {
  it('Pro 플랜 정보가 표시되어야 함', () => {
    render(<OrderSummary plan="pro" />);

    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('49,000원')).toBeInTheDocument();
    expect(screen.getByText(/월 4,083원/)).toBeInTheDocument();
  });

  it('Business 플랜 정보가 표시되어야 함', () => {
    render(<OrderSummary plan="business" />);

    expect(screen.getByText('Business')).toBeInTheDocument();
    expect(screen.getByText('99,000원')).toBeInTheDocument();
    expect(screen.getByText(/월 8,250원/)).toBeInTheDocument();
  });

  it('구독 기간이 표시되어야 함', () => {
    render(<OrderSummary plan="pro" />);

    expect(screen.getByText('구독 시작일')).toBeInTheDocument();
    expect(screen.getByText('구독 종료일')).toBeInTheDocument();
    expect(screen.getByText('1년 (12개월)')).toBeInTheDocument();
  });

  it('포함 혜택이 표시되어야 함', () => {
    render(<OrderSummary plan="pro" />);

    expect(screen.getByText('포함 혜택')).toBeInTheDocument();
    expect(screen.getByText('가이드북 5개')).toBeInTheDocument();
    expect(screen.getByText('워터마크 제거')).toBeInTheDocument();
  });

  it('Pro 플랜에 추천 배지가 표시되어야 함', () => {
    render(<OrderSummary plan="pro" />);

    expect(screen.getByText('추천')).toBeInTheDocument();
  });

  it('Business 플랜에는 추천 배지가 없어야 함', () => {
    render(<OrderSummary plan="business" />);

    expect(screen.queryByText('추천')).not.toBeInTheDocument();
  });

  it('안내 사항이 표시되어야 함', () => {
    render(<OrderSummary plan="pro" />);

    expect(screen.getByText(/구독은 즉시 시작되며/)).toBeInTheDocument();
    expect(screen.getByText(/자동 갱신을 해지/)).toBeInTheDocument();
    expect(screen.getByText(/환불 정책/)).toBeInTheDocument();
  });

  it('총 결제 금액이 표시되어야 함', () => {
    render(<OrderSummary plan="pro" />);

    expect(screen.getByText('총 결제 금액')).toBeInTheDocument();
  });

  it('가격 정보가 올바르게 표시되어야 함', () => {
    render(<OrderSummary plan="pro" />);

    expect(screen.getByText('Pro 연간 구독')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // 수량
    expect(screen.getByText('-0원')).toBeInTheDocument(); // 할인
  });
});
