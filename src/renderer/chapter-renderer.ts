import DOMPurify from 'dompurify';
import type { ReaderSettings } from '../types';
import { generateReaderCSS } from './style-injector';

export class ChapterRenderer {
  private root: HTMLElement;
  private settings: ReaderSettings;
  private styleEl: HTMLStyleElement | null = null;
  private viewport: HTMLDivElement | null = null;
  private content: HTMLDivElement | null = null;

  constructor(root: HTMLElement, settings: ReaderSettings) {
    this.root = root;
    this.settings = settings;
  }

  render(html: string): void {
    this.clear();

    this.styleEl = document.createElement('style');
    this.styleEl.textContent = generateReaderCSS(this.settings);

    this.viewport = document.createElement('div');
    this.viewport.className = 'reader-engine-viewport';
    this.viewport.style.width = '100%';
    this.viewport.style.height = '100%';
    this.viewport.style.overflow = 'hidden';
    this.viewport.style.position = 'relative';

    this.content = document.createElement('div');
    this.content.className = 'reader-engine-content';
    // HTML is sanitized via DOMPurify before DOM insertion - safe against XSS
    const sanitized = DOMPurify.sanitize(html, {
      ADD_TAGS: ['figure', 'figcaption'],
      ADD_ATTR: ['epub:type'],
    });
    this.content.innerHTML = sanitized; // eslint-disable-line no-unsanitized/property -- sanitized by DOMPurify above

    this.viewport.appendChild(this.content);
    this.root.appendChild(this.styleEl);
    this.root.appendChild(this.viewport);
  }

  updateSettings(settings: ReaderSettings): void {
    this.settings = settings;
    if (this.styleEl) {
      this.styleEl.textContent = generateReaderCSS(this.settings);
    }
  }

  clear(): void {
    // Clearing root by removing all children (safe - no untrusted content)
    while (this.root.firstChild) {
      this.root.removeChild(this.root.firstChild);
    }
    this.styleEl = null;
    this.viewport = null;
    this.content = null;
  }

  get contentElement(): HTMLDivElement | null {
    return this.content;
  }

  get viewportElement(): HTMLDivElement | null {
    return this.viewport;
  }
}
