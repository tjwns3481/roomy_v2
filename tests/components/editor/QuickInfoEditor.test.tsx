// @TASK P1-T1.4 - QuickInfoEditor 테스트
// @SPEC docs/planning/06-tasks.md#P1-T1.4

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickInfoEditor } from '@/components/editor/blocks/QuickInfoEditor';
import { QuickInfoContent } from '@/types/blocks';

describe('QuickInfoEditor', () => {
  const mockOnChange = vi.fn();

  const defaultContent: QuickInfoContent = {
    checkIn: '15:00',
    checkOut: '11:00',
    address: '서울시 강남구 테헤란로 123',
    wifi: {
      ssid: 'MyWiFi',
      password: 'password123',
    },
    doorLock: {
      password: '1234',
      instructions: '도어락을 눌러주세요',
    },
    coordinates: {
      lat: 37.5665,
      lng: 126.9780,
    },
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('체크인/체크아웃 시간을 렌더링한다', () => {
    render(<QuickInfoEditor content={defaultContent} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/체크인/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/체크아웃/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('15:00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('11:00')).toBeInTheDocument();
  });

  it('체크인 시간을 변경할 수 있다', async () => {
    const user = userEvent.setup();
    render(<QuickInfoEditor content={defaultContent} onChange={mockOnChange} />);

    const checkInInput = screen.getByLabelText(/체크인/i);
    await user.clear(checkInInput);
    await user.type(checkInInput, '16:00');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          checkIn: '16:00',
        })
      );
    });
  });

  it('와이파이 정보를 렌더링한다', () => {
    render(<QuickInfoEditor content={defaultContent} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/SSID/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('MyWiFi')).toBeInTheDocument();
  });

  it('와이파이 비밀번호를 변경할 수 있다', async () => {
    const user = userEvent.setup();
    render(<QuickInfoEditor content={defaultContent} onChange={mockOnChange} />);

    const passwordInput = screen.getByLabelText(/와이파이 비밀번호/i);
    await user.clear(passwordInput);
    await user.type(passwordInput, 'newpass456');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          wifi: expect.objectContaining({
            password: 'newpass456',
          }),
        })
      );
    });
  });

  it('비밀번호 표시/숨김 토글이 작동한다', async () => {
    const user = userEvent.setup();
    render(<QuickInfoEditor content={defaultContent} onChange={mockOnChange} />);

    const passwordInput = screen.getByLabelText(/와이파이 비밀번호/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: /비밀번호 표시/i });
    await user.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('도어락 정보를 렌더링한다', () => {
    render(<QuickInfoEditor content={defaultContent} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/도어락 비밀번호/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('1234')).toBeInTheDocument();
  });

  it('도어락 사용 방법을 변경할 수 있다', async () => {
    const user = userEvent.setup();
    render(<QuickInfoEditor content={defaultContent} onChange={mockOnChange} />);

    const instructionsInput = screen.getByLabelText(/사용 방법/i);
    await user.clear(instructionsInput);
    await user.type(instructionsInput, '새로운 설명');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          doorLock: expect.objectContaining({
            instructions: '새로운 설명',
          }),
        })
      );
    });
  });

  it('주소를 렌더링하고 변경할 수 있다', async () => {
    const user = userEvent.setup();
    render(<QuickInfoEditor content={defaultContent} onChange={mockOnChange} />);

    const addressInput = screen.getByLabelText(/주소/i);
    expect(addressInput).toHaveValue('서울시 강남구 테헤란로 123');

    await user.clear(addressInput);
    await user.type(addressInput, '서울시 종로구');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          address: '서울시 종로구',
        })
      );
    });
  });

  it('좌표를 렌더링하고 변경할 수 있다', async () => {
    const user = userEvent.setup();
    render(<QuickInfoEditor content={defaultContent} onChange={mockOnChange} />);

    const latInput = screen.getByLabelText(/위도/i);
    const lngInput = screen.getByLabelText(/경도/i);

    expect(latInput).toHaveValue(37.5665);
    expect(lngInput).toHaveValue(126.9780);

    await user.clear(latInput);
    await user.type(latInput, '37.5000');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          coordinates: expect.objectContaining({
            lat: 37.5000,
          }),
        })
      );
    });
  });

  it('와이파이 정보가 없어도 렌더링된다', () => {
    const contentWithoutWifi = { ...defaultContent, wifi: undefined };
    render(<QuickInfoEditor content={contentWithoutWifi} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/SSID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/와이파이 비밀번호/i)).toBeInTheDocument();
  });

  it('도어락 정보가 없어도 렌더링된다', () => {
    const contentWithoutDoorLock = { ...defaultContent, doorLock: undefined };
    render(<QuickInfoEditor content={contentWithoutDoorLock} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/도어락 비밀번호/i)).toBeInTheDocument();
  });
});
