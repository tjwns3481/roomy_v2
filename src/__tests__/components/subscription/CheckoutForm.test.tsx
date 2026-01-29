/**
 * @TASK P6-T6.5 - CheckoutForm 컴포넌트 테스트
 * @SPEC docs/planning/06-tasks.md#P6-T6.5
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CheckoutForm } from '@/components/subscription/CheckoutForm';

describe('CheckoutForm', () => {
  const mockOnSubmit = vi.fn();

  const defaultProps = {
    orderId: 'roomy_1234567890_abc123',
    amount: 49000,
    orderName: 'Roomy Pro 연간 구독',
    onSubmit: mockOnSubmit,
  };

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('결제 수단 옵션이 표시되어야 함', () => {
    render(<CheckoutForm {...defaultProps} />);

    expect(screen.getByText('신용카드')).toBeInTheDocument();
    expect(screen.getByText('계좌이체')).toBeInTheDocument();
    expect(screen.getByText('가상계좌')).toBeInTheDocument();
  });

  it('약관 동의 체크박스가 표시되어야 함', () => {
    render(<CheckoutForm {...defaultProps} />);

    expect(screen.getByText(/구매 조건 확인/)).toBeInTheDocument();
    expect(screen.getByText(/개인정보 제3자 제공/)).toBeInTheDocument();
  });

  it('결제 금액이 표시되어야 함', () => {
    render(<CheckoutForm {...defaultProps} />);

    expect(screen.getByText('49,000원 결제하기')).toBeInTheDocument();
  });

  it('약관 미동의 시 결제 버튼이 비활성화되어야 함', () => {
    render(<CheckoutForm {...defaultProps} />);

    const submitButton = screen.getByText('49,000원 결제하기');
    expect(submitButton).toBeDisabled();
  });

  it('약관 동의 시 결제 버튼이 활성화되어야 함', () => {
    render(<CheckoutForm {...defaultProps} />);

    const termsCheckbox = screen.getByLabelText(/구매 조건 확인/);
    const privacyCheckbox = screen.getByLabelText(/개인정보 제3자 제공/);

    fireEvent.click(termsCheckbox);
    fireEvent.click(privacyCheckbox);

    const submitButton = screen.getByText('49,000원 결제하기');
    expect(submitButton).not.toBeDisabled();
  });

  it('약관 미동의 시 에러 메시지가 표시되어야 함', async () => {
    render(<CheckoutForm {...defaultProps} />);

    const submitButton = screen.getByText('49,000원 결제하기');

    // 버튼이 비활성화되어 있으므로 폼 제출 이벤트를 직접 발생
    const form = submitButton.closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('필수 약관에 동의해주세요.')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('결제 수단 선택이 가능해야 함', () => {
    render(<CheckoutForm {...defaultProps} />);

    const transferOption = screen.getByLabelText('계좌이체');
    fireEvent.click(transferOption);

    expect(transferOption).toBeChecked();
  });

  it('결제 버튼 클릭 시 onSubmit이 호출되어야 함', async () => {
    mockOnSubmit.mockResolvedValueOnce(undefined);

    render(<CheckoutForm {...defaultProps} />);

    // 약관 동의
    const termsCheckbox = screen.getByLabelText(/구매 조건 확인/);
    const privacyCheckbox = screen.getByLabelText(/개인정보 제3자 제공/);
    fireEvent.click(termsCheckbox);
    fireEvent.click(privacyCheckbox);

    // 결제 버튼 클릭
    const submitButton = screen.getByText('49,000원 결제하기');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('CARD');
    });
  });

  it('결제 중 로딩 상태가 표시되어야 함', async () => {
    mockOnSubmit.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    render(<CheckoutForm {...defaultProps} />);

    // 약관 동의
    const termsCheckbox = screen.getByLabelText(/구매 조건 확인/);
    const privacyCheckbox = screen.getByLabelText(/개인정보 제3자 제공/);
    fireEvent.click(termsCheckbox);
    fireEvent.click(privacyCheckbox);

    // 결제 버튼 클릭
    const submitButton = screen.getByText('49,000원 결제하기');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('결제 진행 중...')).toBeInTheDocument();
    });
  });

  it('결제 실패 시 에러 메시지가 표시되어야 함', async () => {
    mockOnSubmit.mockRejectedValueOnce(new Error('결제 실패'));

    render(<CheckoutForm {...defaultProps} />);

    // 약관 동의
    const termsCheckbox = screen.getByLabelText(/구매 조건 확인/);
    const privacyCheckbox = screen.getByLabelText(/개인정보 제3자 제공/);
    fireEvent.click(termsCheckbox);
    fireEvent.click(privacyCheckbox);

    // 결제 버튼 클릭
    const submitButton = screen.getByText('49,000원 결제하기');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('결제 실패')).toBeInTheDocument();
    });
  });
});
