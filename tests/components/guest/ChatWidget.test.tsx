// @TASK P8-S2-T2 - AI 챗봇 위젯 테스트
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatWidget } from '@/components/guest/ChatWidget';
import { vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

describe('ChatWidget', () => {
  const mockGuidebookId = '123e4567-e89b-12d3-a456-426614174000';
  const mockThemeColor = '#FF385C';

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockReset();
  });

  describe('플로팅 버튼', () => {
    it('초기에 플로팅 버튼이 보여야 한다', () => {
      render(<ChatWidget guidebookId={mockGuidebookId} themeColor={mockThemeColor} />);

      const button = screen.getByLabelText('AI 챗봇 열기');
      expect(button).toBeInTheDocument();
    });

    it('Primary 색상 (#FF385C)이 적용되어야 한다', () => {
      render(<ChatWidget guidebookId={mockGuidebookId} themeColor={mockThemeColor} />);

      const button = screen.getByLabelText('AI 챗봇 열기');
      expect(button).toHaveStyle({ backgroundColor: '#FF385C' });
    });

    it('버튼 클릭 시 채팅 패널이 열려야 한다', () => {
      render(<ChatWidget guidebookId={mockGuidebookId} themeColor={mockThemeColor} />);

      const button = screen.getByLabelText('AI 챗봇 열기');
      fireEvent.click(button);

      expect(screen.getByText('AI 가이드')).toBeInTheDocument();
    });
  });

  describe('채팅 패널', () => {
    it('헤더에 "AI 가이드" 제목이 있어야 한다', () => {
      render(<ChatWidget guidebookId={mockGuidebookId} themeColor={mockThemeColor} />);

      fireEvent.click(screen.getByLabelText('AI 챗봇 열기'));

      expect(screen.getByText('AI 가이드')).toBeInTheDocument();
      expect(screen.getByText('무엇이든 물어보세요')).toBeInTheDocument();
    });

    it('닫기 버튼을 클릭하면 패널이 닫혀야 한다', () => {
      render(<ChatWidget guidebookId={mockGuidebookId} themeColor={mockThemeColor} />);

      fireEvent.click(screen.getByLabelText('AI 챗봇 열기'));

      const closeButton = screen.getByRole('button', { name: /닫기/i });
      fireEvent.click(closeButton);

      expect(screen.queryByText('AI 가이드')).not.toBeInTheDocument();
    });

    it('초기 환영 메시지가 표시되어야 한다', () => {
      render(<ChatWidget guidebookId={mockGuidebookId} themeColor={mockThemeColor} />);

      fireEvent.click(screen.getByLabelText('AI 챗봇 열기'));

      expect(screen.getByText(/안녕하세요!/)).toBeInTheDocument();
    });
  });

  describe('자주 묻는 질문', () => {
    it('패널을 열면 기본 질문들이 표시되어야 한다', () => {
      render(<ChatWidget guidebookId={mockGuidebookId} themeColor={mockThemeColor} />);

      fireEvent.click(screen.getByLabelText('AI 챗봇 열기'));

      expect(screen.getByText('체크인 시간은?')).toBeInTheDocument();
      expect(screen.getByText('와이파이 비밀번호는?')).toBeInTheDocument();
      expect(screen.getByText('주변 맛집은?')).toBeInTheDocument();
    });

    it('기본 질문 클릭 시 자동으로 질문이 전송되어야 한다', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'msg-1',
          answer: '체크인은 오후 3시부터 가능합니다.',
          created_at: new Date().toISOString(),
        }),
      });

      render(<ChatWidget guidebookId={mockGuidebookId} themeColor={mockThemeColor} />);

      fireEvent.click(screen.getByLabelText('AI 챗봇 열기'));

      const quickQuestion = screen.getByText('체크인 시간은?');
      fireEvent.click(quickQuestion);

      await waitFor(() => {
        expect(screen.getByText('체크인 시간은?')).toBeInTheDocument();
      });
    });
  });

  describe('메시지 전송', () => {
    it('입력창에 텍스트를 입력하고 전송할 수 있어야 한다', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'msg-1',
          answer: '체크아웃은 오전 11시까지입니다.',
          created_at: new Date().toISOString(),
        }),
      });

      render(<ChatWidget guidebookId={mockGuidebookId} themeColor={mockThemeColor} />);

      fireEvent.click(screen.getByLabelText('AI 챗봇 열기'));

      const input = screen.getByPlaceholderText('메시지를 입력하세요...');
      const sendButton = screen.getByRole('button', { name: /전송/i });

      fireEvent.change(input, { target: { value: '체크아웃 시간은?' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/chatbot', expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('체크아웃 시간은?'),
        }));
      });
    });

    it('API 응답이 성공하면 답변이 표시되어야 한다', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'msg-1',
          answer: '체크아웃은 오전 11시까지입니다.',
          created_at: new Date().toISOString(),
        }),
      });

      render(<ChatWidget guidebookId={mockGuidebookId} themeColor={mockThemeColor} />);

      fireEvent.click(screen.getByLabelText('AI 챗봇 열기'));

      const input = screen.getByPlaceholderText('메시지를 입력하세요...');
      const sendButton = screen.getByRole('button', { name: /전송/i });

      fireEvent.change(input, { target: { value: '체크아웃 시간은?' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText('체크아웃은 오전 11시까지입니다.')).toBeInTheDocument();
      });
    });

    it('로딩 중에는 타이핑 인디케이터가 표시되어야 한다', async () => {
      (global.fetch as any).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({
            id: 'msg-1',
            answer: '답변입니다.',
            created_at: new Date().toISOString(),
          }),
        }), 100))
      );

      render(<ChatWidget guidebookId={mockGuidebookId} themeColor={mockThemeColor} />);

      fireEvent.click(screen.getByLabelText('AI 챗봇 열기'));

      const input = screen.getByPlaceholderText('메시지를 입력하세요...');
      const sendButton = screen.getByRole('button', { name: /전송/i });

      fireEvent.change(input, { target: { value: '질문' } });
      fireEvent.click(sendButton);

      // 로딩 인디케이터 확인
      await waitFor(() => {
        expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
      }, { timeout: 50 });
    });
  });

  describe('피드백', () => {
    it('각 답변에 피드백 버튼이 표시되어야 한다', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'msg-1',
          answer: '체크인은 오후 3시입니다.',
          created_at: new Date().toISOString(),
        }),
      });

      render(<ChatWidget guidebookId={mockGuidebookId} themeColor={mockThemeColor} />);

      fireEvent.click(screen.getByLabelText('AI 챗봇 열기'));

      const input = screen.getByPlaceholderText('메시지를 입력하세요...');
      fireEvent.change(input, { target: { value: '체크인은?' } });
      fireEvent.click(screen.getByRole('button', { name: /전송/i }));

      await waitFor(() => {
        expect(screen.getByLabelText('도움이 되었어요')).toBeInTheDocument();
        expect(screen.getByLabelText('도움이 안됐어요')).toBeInTheDocument();
      });
    });

    it('👍 버튼 클릭 시 피드백 API가 호출되어야 한다', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: 'msg-1',
            answer: '체크인은 오후 3시입니다.',
            created_at: new Date().toISOString(),
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      render(<ChatWidget guidebookId={mockGuidebookId} themeColor={mockThemeColor} />);

      fireEvent.click(screen.getByLabelText('AI 챗봇 열기'));

      const input = screen.getByPlaceholderText('메시지를 입력하세요...');
      fireEvent.change(input, { target: { value: '체크인은?' } });
      fireEvent.click(screen.getByRole('button', { name: /전송/i }));

      await waitFor(() => {
        expect(screen.getByLabelText('도움이 되었어요')).toBeInTheDocument();
      });

      const helpfulButton = screen.getByLabelText('도움이 되었어요');
      fireEvent.click(helpfulButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/chatbot/feedback/msg-1', expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedback: 'helpful' }),
        }));
      });
    });
  });

  describe('모바일 최적화', () => {
    it('모바일에서 패널이 화면에 맞게 조정되어야 한다', () => {
      render(<ChatWidget guidebookId={mockGuidebookId} themeColor={mockThemeColor} />);

      fireEvent.click(screen.getByLabelText('AI 챗봇 열기'));

      const panel = screen.getByRole('dialog', { name: /AI 가이드/i });
      expect(panel).toHaveClass('max-w-[calc(100vw-48px)]');
    });
  });
});
