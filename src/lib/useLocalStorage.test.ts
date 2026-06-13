import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  afterEach(() => localStorage.clear());

  it('returns the initial value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('k', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  it('reads a previously stored value', () => {
    localStorage.setItem('k', JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage('k', 'fallback'));
    expect(result.current[0]).toBe('stored');
  });

  it('persists updates to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('k', 0));
    act(() => result.current[1](5));
    expect(result.current[0]).toBe(5);
    expect(JSON.parse(localStorage.getItem('k')!)).toBe(5);
  });

  it('supports functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('count', 1));
    act(() => result.current[1]((prev) => prev + 2));
    expect(result.current[0]).toBe(3);
  });

  it('keeps separate hook instances in sync within the tab', () => {
    const a = renderHook(() => useLocalStorage('shared', 'x'));
    const b = renderHook(() => useLocalStorage('shared', 'x'));
    act(() => a.result.current[1]('y'));
    expect(b.result.current[0]).toBe('y');
  });
});
