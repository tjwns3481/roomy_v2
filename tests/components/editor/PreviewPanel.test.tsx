// @TASK P8-S9-T1 - 에디터 미리보기 개선 테스트
// @SPEC specs/screens/S-09-editor.yaml

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PreviewPanel } from '@/components/editor/PreviewPanel';
import { EditorBlock } from '@/hooks/useEditor';

// Mock 블록 데이터
const mockBlocks: EditorBlock[] = [
  {
    id: 'block-1',
    guidebook_id: 'guide-1',
    type: 'hero',
    order_index: 0,
    content: {
      title: '환영합니다',
      subtitle: '편안한 숙소',
      backgroundImage: '/test-image.jpg',
    },
    is_visible: true,
    created_at: '2024-01-28',
    updated_at: '2024-01-28',
  },
  {
    id: 'block-2',
    guidebook_id: 'guide-1',
    type: 'quickInfo',
    order_index: 1,
    content: {
      checkIn: '15:00',
      checkOut: '11:00',
      address: '서울시 강남구',
    },
    is_visible: true,
    created_at: '2024-01-28',
    updated_at: '2024-01-28',
  },
];

describe('PreviewPanel', () => {
  it('디바이스 크기 선택 버튼이 렌더링되어야 함', () => {
    render(
      <PreviewPanel
        blocks={mockBlocks}
        selectedBlockId="block-1"
        onBlockSelect={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /iPhone SE/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iPhone 14/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iPad/i })).toBeInTheDocument();
  });

  it('디바이스 크기 변경 시 프레임 크기가 변경되어야 함', () => {
    render(
      <PreviewPanel
        blocks={mockBlocks}
        selectedBlockId="block-1"
        onBlockSelect={vi.fn()}
      />
    );

    const ipadButton = screen.getByRole('button', { name: /iPad/i });
    fireEvent.click(ipadButton);

    // DeviceFrame의 너비가 iPad 크기(768px)로 변경되었는지 확인
    const frame = screen.getByTestId('device-frame');
    expect(frame).toHaveAttribute('data-device', 'ipad');
  });

  it('라이트/다크 모드 토글이 작동해야 함', () => {
    render(
      <PreviewPanel
        blocks={mockBlocks}
        selectedBlockId="block-1"
        onBlockSelect={vi.fn()}
      />
    );

    const darkModeToggle = screen.getByRole('button', { name: /다크 모드/i });
    fireEvent.click(darkModeToggle);

    const frame = screen.getByTestId('device-frame');
    expect(frame).toHaveClass('dark');
  });

  it('iPhone 프레임에 노치가 표시되어야 함', () => {
    render(
      <PreviewPanel
        blocks={mockBlocks}
        selectedBlockId="block-1"
        onBlockSelect={vi.fn()}
      />
    );

    const notch = screen.getByTestId('device-notch');
    expect(notch).toBeInTheDocument();
  });

  it('선택된 블록이 하이라이트되어야 함', () => {
    const onBlockSelect = vi.fn();
    render(
      <PreviewPanel
        blocks={mockBlocks}
        selectedBlockId="block-1"
        onBlockSelect={onBlockSelect}
      />
    );

    // 선택된 블록에 하이라이트 클래스가 있는지 확인
    const selectedBlock = screen.getByTestId('preview-block-block-1');
    expect(selectedBlock).toHaveClass('ring-2', 'ring-primary');
  });

  it('블록 클릭 시 onBlockSelect가 호출되어야 함', () => {
    const onBlockSelect = vi.fn();
    render(
      <PreviewPanel
        blocks={mockBlocks}
        selectedBlockId="block-1"
        onBlockSelect={onBlockSelect}
      />
    );

    const block2 = screen.getByTestId('preview-block-block-2');
    fireEvent.click(block2);

    expect(onBlockSelect).toHaveBeenCalledWith('block-2');
  });

  it('블록이 없을 때 빈 상태 메시지가 표시되어야 함', () => {
    render(
      <PreviewPanel
        blocks={[]}
        selectedBlockId={null}
        onBlockSelect={vi.fn()}
      />
    );

    expect(screen.getByText(/블록을 추가하여 시작하세요/i)).toBeInTheDocument();
  });

  it('상태바(시간, 배터리)가 표시되어야 함', () => {
    render(
      <PreviewPanel
        blocks={mockBlocks}
        selectedBlockId="block-1"
        onBlockSelect={vi.fn()}
      />
    );

    expect(screen.getByTestId('device-statusbar')).toBeInTheDocument();
  });
});

describe('DeviceFrame', () => {
  it('iPhone SE 크기가 정확해야 함 (375x667)', () => {
    render(
      <PreviewPanel
        blocks={mockBlocks}
        selectedBlockId="block-1"
        onBlockSelect={vi.fn()}
      />
    );

    const iphoneSEButton = screen.getByRole('button', { name: /iPhone SE/i });
    fireEvent.click(iphoneSEButton);

    const frame = screen.getByTestId('device-frame');
    const style = window.getComputedStyle(frame);
    expect(style.maxWidth).toBe('375px');
  });

  it('iPad에서는 노치가 표시되지 않아야 함', () => {
    render(
      <PreviewPanel
        blocks={mockBlocks}
        selectedBlockId="block-1"
        onBlockSelect={vi.fn()}
      />
    );

    const ipadButton = screen.getByRole('button', { name: /iPad/i });
    fireEvent.click(ipadButton);

    expect(screen.queryByTestId('device-notch')).not.toBeInTheDocument();
  });

  it('홈 인디케이터가 표시되어야 함', () => {
    render(
      <PreviewPanel
        blocks={mockBlocks}
        selectedBlockId="block-1"
        onBlockSelect={vi.fn()}
      />
    );

    expect(screen.getByTestId('home-indicator')).toBeInTheDocument();
  });
});
