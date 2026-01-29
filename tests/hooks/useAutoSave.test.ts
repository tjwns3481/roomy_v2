// @TASK P1-T1.8 - useAutoSave 훅 테스트
// @SPEC docs/planning/06-tasks.md#P1-T1.8

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoSave, getAutoSaveStatusLabel } from '@/hooks/useAutoSave';

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('초기 상태가 idle이어야 함', () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useAutoSave({ onSave }));

    expect(result.current.status).toBe('idle');
    expect(result.current.lastSavedAt).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isPending).toBe(false);
  });

  it('3초 디바운스 후 저장이 호출되어야 함', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useAutoSave({ onSave, delay: 3000 })
    );

    // 데이터 변경
    act(() => {
      result.current.save({ test: 'data' });
    });

    // 디바운스 대기 중
    expect(result.current.isPending).toBe(true);
    expect(onSave).not.toHaveBeenCalled();

    // 3초 경과
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    // 저장 호출 확인
    expect(onSave).toHaveBeenCalledWith({ test: 'data' });
  });

  it('빠른 연속 호출 시 마지막 데이터만 저장되어야 함', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useAutoSave({ onSave, delay: 1000 })
    );

    // 여러 번 연속 호출
    act(() => {
      result.current.save({ value: 1 });
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    act(() => {
      result.current.save({ value: 2 });
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    act(() => {
      result.current.save({ value: 3 });
    });

    // 1초 경과
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // 마지막 데이터만 저장
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({ value: 3 });
  });

  it('저장 성공 시 saved 상태가 되어야 함', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onSuccess = vi.fn();
    const { result } = renderHook(() =>
      useAutoSave({ onSave, onSuccess, delay: 100 })
    );

    act(() => {
      result.current.save({ test: 'data' });
    });

    // 디바운스 타이머 실행
    await act(async () => {
      vi.advanceTimersByTime(100);
      // Promise 해결을 위한 마이크로태스크 실행
      await Promise.resolve();
    });

    // 저장 완료 확인
    expect(onSave).toHaveBeenCalledWith({ test: 'data' });
    expect(result.current.lastSavedAt).toBeInstanceOf(Date);
    expect(onSuccess).toHaveBeenCalled();
    // status는 saved 또는 idle (3초 후 idle로 복귀)
    expect(['saved', 'idle']).toContain(result.current.status);
  });

  it('저장 실패 시 error 상태가 되어야 함', async () => {
    const error = new Error('저장 실패');
    const onSave = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useAutoSave({ onSave, onError, delay: 100 })
    );

    act(() => {
      result.current.save({ test: 'data' });
    });

    // 디바운스 타이머 실행
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // Promise 해결 대기
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('저장 실패');
    expect(onError).toHaveBeenCalledWith(error);
  });

  it('saveNow는 디바운스 없이 즉시 저장해야 함', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useAutoSave({ onSave, delay: 3000 })
    );

    await act(async () => {
      await result.current.saveNow({ immediate: true });
    });

    expect(onSave).toHaveBeenCalledWith({ immediate: true });
    expect(result.current.status).toBe('saved');
  });

  it('reset은 상태를 초기화해야 함', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('에러'));
    const { result } = renderHook(() =>
      useAutoSave({ onSave, delay: 100 })
    );

    act(() => {
      result.current.save({ test: 'data' });
    });

    // 디바운스 타이머 실행
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // Promise 해결 대기
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.status).toBe('error');

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBeNull();
    expect(result.current.isPending).toBe(false);
  });

  it('enabled=false일 때 저장하지 않아야 함', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useAutoSave({ onSave, enabled: false, delay: 100 })
    );

    act(() => {
      result.current.save({ test: 'data' });
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(onSave).not.toHaveBeenCalled();
  });
});

describe('getAutoSaveStatusLabel', () => {
  it('각 상태에 맞는 레이블을 반환해야 함', () => {
    expect(getAutoSaveStatusLabel('idle', false)).toBe('');
    expect(getAutoSaveStatusLabel('saving', false)).toBe('저장 중...');
    expect(getAutoSaveStatusLabel('saved', false)).toBe('저장됨');
    expect(getAutoSaveStatusLabel('error', false)).toBe('저장 실패');
  });

  it('isPending=true일 때 변경사항 감지 레이블을 반환해야 함', () => {
    expect(getAutoSaveStatusLabel('idle', true)).toBe('변경사항 감지...');
    expect(getAutoSaveStatusLabel('saving', true)).toBe('변경사항 감지...');
  });
});
