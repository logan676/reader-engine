import { describe, it, expect, vi } from 'vitest';
import { Paginator } from '../paginator';
import type { PageState } from '../paginator';

function createMockElements(containerWidth: number, contentScrollWidth: number) {
  const container = document.createElement('div');
  Object.defineProperty(container, 'clientWidth', { value: containerWidth });
  Object.defineProperty(container, 'clientHeight', { value: 600 });

  const content = document.createElement('div');
  Object.defineProperty(content, 'scrollWidth', { value: contentScrollWidth });

  return { container, content };
}

describe('Paginator', () => {
  it('calculates total pages correctly', () => {
    const { container, content } = createMockElements(400, 1600);
    const paginator = new Paginator(container, content, { margin: 20, gap: 20 });

    expect(paginator.totalPages).toBe(4);
  });

  it('starts at page 0', () => {
    const { container, content } = createMockElements(400, 1600);
    const paginator = new Paginator(container, content, { margin: 20, gap: 20 });

    expect(paginator.currentPage).toBe(0);
    expect(paginator.isFirstPage).toBe(true);
  });

  it('nextPage() advances to the next page', () => {
    const { container, content } = createMockElements(400, 1600);
    const paginator = new Paginator(container, content, { margin: 20, gap: 20 });

    const result = paginator.nextPage();

    expect(result).toBe(true);
    expect(paginator.currentPage).toBe(1);
  });

  it('prevPage() goes back after goToPage(2)', () => {
    const { container, content } = createMockElements(400, 1600);
    const paginator = new Paginator(container, content, { margin: 20, gap: 20 });

    paginator.goToPage(2);
    const result = paginator.prevPage();

    expect(result).toBe(true);
    expect(paginator.currentPage).toBe(1);
  });

  it('goToPage(999) clamps to last page', () => {
    const { container, content } = createMockElements(400, 1600);
    const paginator = new Paginator(container, content, { margin: 20, gap: 20 });

    paginator.goToPage(999);

    expect(paginator.currentPage).toBe(3);
  });

  it('goToPage(-5) clamps to 0', () => {
    const { container, content } = createMockElements(400, 1600);
    const paginator = new Paginator(container, content, { margin: 20, gap: 20 });

    paginator.goToPage(-5);

    expect(paginator.currentPage).toBe(0);
  });

  it('progress at page 1 of 4 is ~0.333', () => {
    const { container, content } = createMockElements(400, 1600);
    const paginator = new Paginator(container, content, { margin: 20, gap: 20 });

    paginator.goToPage(1);

    expect(paginator.progress).toBeCloseTo(1 / 3, 3);
  });

  it('isFirstPage and isLastPage are correct', () => {
    const { container, content } = createMockElements(400, 1600);
    const paginator = new Paginator(container, content, { margin: 20, gap: 20 });

    expect(paginator.isFirstPage).toBe(true);
    expect(paginator.isLastPage).toBe(false);

    paginator.goToEnd();

    expect(paginator.isFirstPage).toBe(false);
    expect(paginator.isLastPage).toBe(true);
  });

  it('nextPage() returns false at the last page', () => {
    const { container, content } = createMockElements(400, 1600);
    const paginator = new Paginator(container, content, { margin: 20, gap: 20 });

    paginator.goToEnd();

    expect(paginator.nextPage()).toBe(false);
  });

  it('prevPage() returns false at the first page', () => {
    const { container, content } = createMockElements(400, 1600);
    const paginator = new Paginator(container, content, { margin: 20, gap: 20 });

    expect(paginator.prevPage()).toBe(false);
  });

  it('onPageChange callback fires with correct state', () => {
    const { container, content } = createMockElements(400, 1600);
    const paginator = new Paginator(container, content, { margin: 20, gap: 20 });

    const callback = vi.fn<(state: PageState) => void>();
    paginator.onPageChange = callback;

    paginator.nextPage();

    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith({
      currentPage: 1,
      totalPages: 4,
      progress: 1 / 3,
      isFirstPage: false,
      isLastPage: false,
    });
  });

  it('sets transform on content element', () => {
    const { container, content } = createMockElements(400, 1600);
    const paginator = new Paginator(container, content, { margin: 20, gap: 20 });

    paginator.goToPage(2);

    expect(content.style.transform).toBe('translateX(-800px)');
  });

  it('progress is 1 when there is only one page', () => {
    const { container, content } = createMockElements(400, 400);
    const paginator = new Paginator(container, content, { margin: 20, gap: 20 });

    expect(paginator.totalPages).toBe(1);
    expect(paginator.progress).toBe(1);
  });

  it('getState() returns a consistent snapshot', () => {
    const { container, content } = createMockElements(400, 1600);
    const paginator = new Paginator(container, content, { margin: 20, gap: 20 });

    paginator.goToPage(2);
    const state = paginator.getState();

    expect(state).toEqual({
      currentPage: 2,
      totalPages: 4,
      progress: 2 / 3,
      isFirstPage: false,
      isLastPage: false,
    });
  });
});
