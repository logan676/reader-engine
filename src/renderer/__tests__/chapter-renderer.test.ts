import { describe, it, expect } from 'vitest';
import { ChapterRenderer } from '../chapter-renderer';
import { DEFAULT_SETTINGS } from '../../types';
import type { ReaderSettings } from '../../types';

describe('ChapterRenderer', () => {
  function createRoot(): HTMLElement {
    const el = document.createElement('div');
    document.body.appendChild(el);
    return el;
  }

  it('renders HTML into container', () => {
    const root = createRoot();
    const renderer = new ChapterRenderer(root, DEFAULT_SETTINGS);

    renderer.render('<p>Hello, world!</p>');

    const p = root.querySelector('p');
    expect(p).not.toBeNull();
    expect(p!.textContent).toBe('Hello, world!');
  });

  it('injects a style element with correct CSS', () => {
    const root = createRoot();
    const renderer = new ChapterRenderer(root, DEFAULT_SETTINGS);

    renderer.render('<p>Test</p>');

    const style = root.querySelector('style');
    expect(style).not.toBeNull();
    expect(style!.textContent).toContain(`font-size: ${DEFAULT_SETTINGS.fontSize}px`);
  });

  it('updateSettings changes CSS', () => {
    const root = createRoot();
    const renderer = new ChapterRenderer(root, DEFAULT_SETTINGS);
    renderer.render('<p>Test</p>');

    const updated: ReaderSettings = { ...DEFAULT_SETTINGS, fontSize: 24 };
    renderer.updateSettings(updated);

    const style = root.querySelector('style');
    expect(style!.textContent).toContain('font-size: 24px');
  });

  it('creates .reader-engine-viewport and .reader-engine-content', () => {
    const root = createRoot();
    const renderer = new ChapterRenderer(root, DEFAULT_SETTINGS);

    renderer.render('<p>Structure test</p>');

    expect(root.querySelector('.reader-engine-viewport')).not.toBeNull();
    expect(root.querySelector('.reader-engine-content')).not.toBeNull();
  });

  it('re-render clears previous content', () => {
    const root = createRoot();
    const renderer = new ChapterRenderer(root, DEFAULT_SETTINGS);

    renderer.render('<p>First</p>');
    renderer.render('<p>Second</p>');

    const paragraphs = root.querySelectorAll('p');
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0].textContent).toBe('Second');
  });
});
