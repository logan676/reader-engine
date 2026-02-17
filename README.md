# @readmigo/reader-engine

A CSS column-based pagination engine for rendering book chapter HTML in web environments.

## Features

- **HTML Pagination** - CSS column layout engine that splits chapter HTML into discrete pages
- **Scroll Mode** - Alternative continuous scroll reading mode with progress tracking
- **Typography Settings** - Configurable font size, family, line height, letter spacing, word spacing, paragraph spacing, text alignment, and hyphenation
- **Theme System** - Four built-in themes: Light, Sepia, Dark, and Ultra Dark
- **Chapter Navigation** - Chapter manager with ordered traversal, jump-to-chapter, and boundary detection
- **Reading Progress** - Combined chapter + page progress calculation (0 to 1)
- **Content Security** - DOMPurify-based HTML sanitization before rendering
- **React Wrapper** - Provider, View component, and hooks for React integration
- **Dual Format** - Ships as ESM and CJS with full TypeScript declarations

## Installation

```
npm install @readmigo/reader-engine
```

## Architecture

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for module diagrams and data flow.

## Design Document

See [docs/DESIGN.md](./docs/DESIGN.md) for detailed design documentation covering architecture decisions, core mechanisms, data flow, security, and extensibility.

## API Reference

See [docs/API.md](./docs/API.md) for complete type and method documentation.

## Getting Started

See [docs/GETTING-STARTED.md](./docs/GETTING-STARTED.md) for setup and integration guides.

## Usage Examples

- `examples/basic-usage.ts` - Vanilla TypeScript usage
- `examples/react-usage.tsx` - React component usage

## Development

| Command | Description |
|---------|-------------|
| `npm run build` | Build with tsup (ESM + CJS + DTS) |
| `npm run dev` | Watch mode build |
| `npm test` | Run tests with Vitest |
| `npm run test:watch` | Watch mode tests |
| `npm run lint` | Type check with tsc |

## License

MIT
