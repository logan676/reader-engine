# @readmigo/reader-engine

[![CI](https://github.com/readmigo/reader-engine/actions/workflows/ci.yml/badge.svg)](https://github.com/readmigo/reader-engine/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green.svg)](https://nodejs.org/)

A CSS column-based pagination engine for rendering book chapter HTML in web environments. Built with TypeScript, ships as ESM and CJS with full type declarations.

---

## Features

| Feature | Description |
|---------|-------------|
| 📖 **HTML Pagination** | CSS column layout engine that splits chapter HTML into discrete pages |
| 📜 **Scroll Mode** | Alternative continuous scroll reading mode with progress tracking |
| 🔤 **Typography Settings** | Configurable font size, family, line height, letter/word spacing, paragraph spacing, text alignment, and hyphenation |
| 🎨 **Theme System** | Four built-in themes — Light, Sepia, Dark, and Ultra Dark |
| 🧭 **Chapter Navigation** | Chapter manager with ordered traversal, jump-to-chapter, and boundary detection |
| 📊 **Reading Progress** | Combined chapter + page progress calculation (0 to 1) |
| 🔒 **Content Security** | DOMPurify-based HTML sanitization before rendering |
| ⚛️ **React Wrapper** | Provider, View component, and hooks for React integration |
| 📦 **Dual Format** | Ships as ESM and CJS with full TypeScript declarations |

## Installation

```bash
npm install @readmigo/reader-engine
```

For React integration:

```bash
npm install @readmigo/reader-engine react react-dom
```

## Quick Start

### Vanilla TypeScript

```typescript
import { ReaderEngine } from '@readmigo/reader-engine';

const engine = new ReaderEngine({
  apiBaseUrl: 'https://api.readmigo.com',
  settings: { theme: 'sepia', fontSize: 20 },
});

// Mount to a DOM container
engine.mount(document.getElementById('reader')!);

// Load a book and its first chapter
const book = await engine.loadBook('book-123');
await engine.loadChapter(0);

// Navigate pages
engine.nextPage();
engine.prevPage();

// Listen for state changes
engine.callbacks.onStateChange = (state) => {
  console.log(`Page ${state.currentPage + 1}/${state.totalPages}`);
};
```

### React

```tsx
import React, { useEffect } from 'react';
import { ReaderProvider, ReaderView, useReader } from '@readmigo/reader-engine/react';

function App() {
  return (
    <ReaderProvider apiBaseUrl="https://api.readmigo.com">
      <ReaderPage bookId="book-123" />
    </ReaderProvider>
  );
}

function ReaderPage({ bookId }: { bookId: string }) {
  const { state, loadBook, loadChapter, nextPage, prevPage } = useReader();

  useEffect(() => {
    loadBook(bookId).then(() => loadChapter(0));
  }, [bookId, loadBook, loadChapter]);

  return (
    <div>
      <ReaderView style={{ height: '80vh' }} />
      <p>Progress: {(state.overallProgress * 100).toFixed(1)}%</p>
    </div>
  );
}
```

## Architecture

```
@readmigo/reader-engine
├── types/          # Data models, settings, themes
├── api/            # HTTP client + content loader
├── renderer/       # CSS generation + DOMPurify HTML rendering
├── core/           # Paginator (CSS columns) + scroll mode
├── navigation/     # Chapter traversal + progress calculation
├── engine.ts       # ReaderEngine facade
└── react/          # Provider, View component, hooks
```

The engine uses CSS multi-column layout to split content into pages, then translates the content horizontally to display one page at a time. See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed module diagrams and data flow.

### Theme Color Palette

| Theme | Background | Text | Best For |
|-------|-----------|------|----------|
| Light | `#FFFFFF` | `#1A1A1A` | Daytime reading |
| Sepia | `#F4ECD8` | `#5B4636` | Reduced eye strain |
| Dark | `#1C1C1E` | `#E5E5E7` | Low-light environments |
| Ultra Dark | `#000000` | `#E5E5E7` | OLED screens / night |

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](./docs/ARCHITECTURE.md) | Module diagrams, data flow, CSS column pagination |
| [API Reference](./docs/API.md) | Complete type and method documentation |
| [Getting Started](./docs/GETTING-STARTED.md) | Setup, integration guides, and customization |

## Examples

| Example | Description |
|---------|-------------|
| [`examples/basic-usage.ts`](./examples/basic-usage.ts) | Vanilla TypeScript — engine lifecycle, navigation, settings |
| [`examples/react-usage.tsx`](./examples/react-usage.tsx) | React — provider, view, hooks, theme switcher |

## Development

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run build` | Build with tsup (ESM + CJS + DTS) |
| `npm run dev` | Watch mode build |
| `npm test` | Run tests with Vitest |
| `npm run test:watch` | Watch mode tests |
| `npm run lint` | Type check with `tsc --noEmit` |

### Project Structure

```
reader-engine/
├── src/
│   ├── types/              # Book, Chapter, Settings, Theme types
│   ├── api/                # ApiClient, ContentLoader
│   ├── renderer/           # ChapterRenderer, generateReaderCSS
│   ├── core/               # Paginator, ScrollMode
│   ├── navigation/         # ChapterManager, calculateOverallProgress
│   ├── react/              # ReaderProvider, ReaderView, hooks
│   ├── engine.ts           # ReaderEngine facade
│   └── index.ts            # Public exports
├── docs/                   # Architecture, API, Getting Started
├── examples/               # Usage examples
├── tsconfig.json           # TypeScript config
├── tsup.config.ts          # Build config (ESM + CJS + DTS)
└── vitest.config.ts        # Test config (happy-dom)
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes and add tests
4. Ensure all checks pass: `npm run lint && npm run build && npm test`
5. Commit your changes (`git commit -m 'feat: add my feature'`)
6. Push to the branch (`git push origin feature/my-feature`)
7. Open a Pull Request

## License

[MIT](./LICENSE)
