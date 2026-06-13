import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('joins truthy class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('ignores falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b');
  });

  it('applies conditional object syntax', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active');
  });

  it('dedupes conflicting Tailwind utilities (last wins)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});
