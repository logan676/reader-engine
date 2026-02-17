import { describe, it, expect } from 'vitest';
import { DEFAULT_SETTINGS, THEMES, FONT_FAMILIES } from '../settings';

describe('ReaderSettings', () => {
  it('has valid default values', () => {
    expect(DEFAULT_SETTINGS.fontSize).toBeGreaterThanOrEqual(12);
    expect(DEFAULT_SETTINGS.fontSize).toBeLessThanOrEqual(36);
    expect(DEFAULT_SETTINGS.lineHeight).toBeGreaterThanOrEqual(1.2);
    expect(DEFAULT_SETTINGS.lineHeight).toBeLessThanOrEqual(2.0);
    expect(DEFAULT_SETTINGS.theme).toBe('light');
    expect(DEFAULT_SETTINGS.readingMode).toBe('paginated');
  });

  it('all themes have required color fields', () => {
    for (const [name, theme] of Object.entries(THEMES)) {
      expect(theme.background, `${name}.background`).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(theme.text, `${name}.text`).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(theme.secondaryText, `${name}.secondaryText`).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(theme.highlight, `${name}.highlight`).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(theme.link, `${name}.link`).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('has all four themes defined', () => {
    expect(Object.keys(THEMES)).toEqual(['light', 'sepia', 'dark', 'ultraDark']);
  });

  it('has at least 5 font families', () => {
    expect(FONT_FAMILIES.length).toBeGreaterThanOrEqual(5);
  });

  it('each font family has name and css', () => {
    for (const font of FONT_FAMILIES) {
      expect(font.name).toBeTruthy();
      expect(font.css).toBeTruthy();
    }
  });
});
