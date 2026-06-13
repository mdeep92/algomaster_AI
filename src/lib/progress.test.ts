import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useCompletedTopics } from './progress';

describe('useCompletedTopics', () => {
  afterEach(() => localStorage.clear());

  it('starts with nothing completed', () => {
    const { result } = renderHook(() => useCompletedTopics());
    expect(result.current.completed).toEqual([]);
    expect(result.current.isCompleted('arrays')).toBe(false);
  });

  it('marks a topic complete', () => {
    const { result } = renderHook(() => useCompletedTopics());
    act(() => result.current.toggle('arrays'));
    expect(result.current.isCompleted('arrays')).toBe(true);
    expect(result.current.completed).toEqual(['arrays']);
  });

  it('toggles a topic back to incomplete', () => {
    const { result } = renderHook(() => useCompletedTopics());
    act(() => result.current.toggle('graphs'));
    act(() => result.current.toggle('graphs'));
    expect(result.current.isCompleted('graphs')).toBe(false);
    expect(result.current.completed).toEqual([]);
  });
});
