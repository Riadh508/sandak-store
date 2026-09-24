import { describe, it, expect } from 'vitest';

describe('Sanity check', () => {
  it('basic math works', () => {
    expect(1 + 1).toBe(2);
  });

  it('string operations work', () => {
    expect('hello'.toUpperCase()).toBe('HELLO');
  });
});
