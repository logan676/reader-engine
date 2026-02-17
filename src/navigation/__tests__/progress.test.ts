import { describe, it, expect } from 'vitest';
import { calculateOverallProgress } from '../progress';

describe('calculateOverallProgress', () => {
  it('should return ~0 at the start of the book', () => {
    const result = calculateOverallProgress(0, 0, 10, 5);
    expect(result).toBeCloseTo(0, 1);
  });

  it('should return ~1 at the end of the book', () => {
    const result = calculateOverallProgress(4, 9, 10, 5);
    expect(result).toBeCloseTo(1, 1);
  });

  it('should return ~0.5 at the midpoint', () => {
    const result = calculateOverallProgress(2, 5, 10, 5);
    expect(result).toBeCloseTo(0.5, 1);
  });

  it('should return 0 when totalChapters is 0', () => {
    expect(calculateOverallProgress(0, 0, 10, 0)).toBe(0);
  });

  it('should return 0 when totalChapters is negative', () => {
    expect(calculateOverallProgress(0, 0, 10, -1)).toBe(0);
  });

  it('should handle single-page chapter', () => {
    // When totalPagesInChapter <= 1, chapterProgress = 1
    const result = calculateOverallProgress(0, 0, 1, 5);
    expect(result).toBeCloseTo(0.2, 5);
  });
});
