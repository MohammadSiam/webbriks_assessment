import { describe, expect, it } from 'vitest';
import { generatePosition, isUniqueConstraintError } from './fractional-index.js';

describe('generatePosition', () => {
  it('generates a starting key when there are no neighbors', () => {
    const position = generatePosition(null, null);
    expect(typeof position).toBe('string');
    expect(position.length).toBeGreaterThan(0);
  });

  it('generates a key that sorts after an existing first key', () => {
    const first = generatePosition(null, null);
    const second = generatePosition(first, null);
    expect(second > first).toBe(true);
  });

  it('generates a key that sorts before an existing key when appended at the start', () => {
    const first = generatePosition(null, null);
    const before = generatePosition(null, first);
    expect(before < first).toBe(true);
  });

  it('generates a key that sorts strictly between two neighbors', () => {
    const a = generatePosition(null, null);
    const c = generatePosition(a, null);
    const b = generatePosition(a, c);
    expect(a < b).toBe(true);
    expect(b < c).toBe(true);
  });

  it('produces stable ordering across many sequential appends', () => {
    let previous: string | null = null;
    const keys: string[] = [];
    for (let i = 0; i < 20; i++) {
      const key = generatePosition(previous, null);
      keys.push(key);
      previous = key;
    }
    const sorted = [...keys].sort();
    expect(keys).toEqual(sorted);
  });
});

describe('isUniqueConstraintError', () => {
  it('returns false for a plain Error', () => {
    expect(isUniqueConstraintError(new Error('boom'))).toBe(false);
  });

  it('returns false for null/undefined/primitives', () => {
    expect(isUniqueConstraintError(null)).toBe(false);
    expect(isUniqueConstraintError(undefined)).toBe(false);
    expect(isUniqueConstraintError('P2002')).toBe(false);
  });

  it('returns false for an object without a matching code', () => {
    expect(isUniqueConstraintError({ code: 'P2025' })).toBe(false);
  });

  it('returns true for an object with code P2002', () => {
    expect(isUniqueConstraintError({ code: 'P2002' })).toBe(true);
  });
});
