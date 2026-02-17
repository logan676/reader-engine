import { describe, it, expect, beforeEach } from 'vitest';
import { ChapterManager } from '../chapter-manager';
import type { ChapterSummary } from '../../types';

const mockChapters: ChapterSummary[] = [
  { id: 'ch-0', title: 'Preface', order: 0, wordCount: 500 },
  { id: 'ch-1', title: 'Chapter 1', order: 1, wordCount: 3000 },
  { id: 'ch-2', title: 'Chapter 2', order: 2, wordCount: 2500 },
  { id: 'ch-3', title: 'Chapter 3', order: 3, wordCount: 4000 },
];

describe('ChapterManager', () => {
  let manager: ChapterManager;

  beforeEach(() => {
    manager = new ChapterManager(mockChapters);
  });

  it('should report totalChapters = 4', () => {
    expect(manager.totalChapters).toBe(4);
  });

  it('should start at index 0', () => {
    expect(manager.currentIndex).toBe(0);
  });

  it('should return the current chapter', () => {
    expect(manager.currentChapter.id).toBe('ch-0');
  });

  it('should navigate to next chapter', () => {
    expect(manager.goToNext()).toBe(true);
    expect(manager.currentIndex).toBe(1);
  });

  it('should navigate to previous chapter after goTo', () => {
    manager.goTo(2);
    expect(manager.goToPrev()).toBe(true);
    expect(manager.currentIndex).toBe(1);
  });

  it('should not go before first chapter', () => {
    expect(manager.goToPrev()).toBe(false);
    expect(manager.currentIndex).toBe(0);
  });

  it('should not go past last chapter', () => {
    manager.goTo(3);
    expect(manager.goToNext()).toBe(false);
    expect(manager.currentIndex).toBe(3);
  });

  it('should navigate to a specific index', () => {
    manager.goTo(2);
    expect(manager.currentChapter.id).toBe('ch-2');
  });

  it('should navigate by chapter id', () => {
    expect(manager.goToId('ch-3')).toBe(true);
    expect(manager.currentIndex).toBe(3);
  });

  it('should return false for unknown chapter id', () => {
    expect(manager.goToId('nonexistent')).toBe(false);
  });

  it('should report hasPrev and hasNext correctly at boundaries', () => {
    // At start
    expect(manager.hasPrev).toBe(false);
    expect(manager.hasNext).toBe(true);

    // At end
    manager.goTo(3);
    expect(manager.hasPrev).toBe(true);
    expect(manager.hasNext).toBe(false);
  });

  it('should return undefined for out-of-range getChapter', () => {
    expect(manager.getChapter(10)).toBeUndefined();
  });

  it('should return all chapters via getChapters', () => {
    const chapters = manager.getChapters();
    expect(chapters).toHaveLength(4);
    expect(chapters[0]!.id).toBe('ch-0');
  });

  it('should sort chapters by order regardless of input order', () => {
    const unordered: ChapterSummary[] = [
      { id: 'ch-2', title: 'Chapter 2', order: 2, wordCount: 2500 },
      { id: 'ch-0', title: 'Preface', order: 0, wordCount: 500 },
      { id: 'ch-3', title: 'Chapter 3', order: 3, wordCount: 4000 },
      { id: 'ch-1', title: 'Chapter 1', order: 1, wordCount: 3000 },
    ];
    const m = new ChapterManager(unordered);
    expect(m.currentChapter.id).toBe('ch-0');
    expect(m.getChapters().map((c) => c.id)).toEqual([
      'ch-0',
      'ch-1',
      'ch-2',
      'ch-3',
    ]);
  });
});
