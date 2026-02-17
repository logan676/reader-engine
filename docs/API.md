# API Reference

## Table of Contents

- [ReaderEngine (Facade)](#readerengine-facade)
- [Types](#types)
- [API Module](#api-module)
- [Renderer Module](#renderer-module)
- [Core Module](#core-module)
- [Navigation Module](#navigation-module)
- [React Wrapper](#react-wrapper)
- [Constants](#constants)

---

## ReaderEngine (Facade)

The main entry point that orchestrates all internal modules (API, renderer, paginator, navigation) behind a single unified API.

### ReaderEngineOptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| apiBaseUrl | `string` | Yes | Base URL for the book content API |
| apiHeaders | `Record<string, string>` | No | Additional HTTP headers for API requests |
| settings | `Partial<ReaderSettings>` | No | Override default reader settings |
| fetch | `typeof fetch` | No | Custom fetch implementation |

### ReaderEngine

**Constructor**

Takes `ReaderEngineOptions` to initialize the API client and default settings.

**Lifecycle Methods**

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| mount | `container: HTMLElement` | `void` | Attach the engine to a DOM container |
| unmount | - | `void` | Detach from DOM, clean up modes and renderer |

**Book & Chapter Methods**

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| loadBook | `bookId: string` | `Promise<BookDetail>` | Fetch book detail and initialize chapter manager |
| loadChapter | `index: number` | `Promise<void>` | Load chapter by index, render, and set up pagination |
| goToChapter | `index: number` | `Promise<void>` | Alias for loadChapter |
| goToChapterId | `chapterId: string` | `Promise<void>` | Load chapter by its string ID |

**Page Navigation Methods**

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| nextPage | - | `boolean` | Advance to next page; auto-advances to next chapter at end |
| prevPage | - | `boolean` | Go to previous page; auto-goes to prev chapter at start |

**Settings**

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| updateSettings | `partial: Partial<ReaderSettings>` | `void` | Merge new settings, update CSS, recalculate pages |

**Properties**

| Property | Type | Description |
|----------|------|-------------|
| settings | `ReaderSettings` | Current reader settings (copy) |
| bookDetail | `BookDetail \| null` | Loaded book detail |
| chapters | `ChapterSummary[]` | Sorted chapter list |
| currentChapterIndex | `number` | Current chapter index |
| state | `ReaderState` | Full reader state snapshot |

### ReaderState

| Field | Type | Description |
|-------|------|-------------|
| bookId | `string \| null` | Currently loaded book ID |
| chapterIndex | `number` | Current chapter index |
| currentPage | `number` | Current page in chapter (0-based) |
| totalPages | `number` | Total pages in current chapter |
| chapterProgress | `number` | Progress within chapter (0 to 1) |
| overallProgress | `number` | Overall book progress (0 to 1) |
| isFirstPage | `boolean` | Whether on first page of chapter |
| isLastPage | `boolean` | Whether on last page of chapter |
| isFirstChapter | `boolean` | Whether on first chapter |
| isLastChapter | `boolean` | Whether on last chapter |
| loading | `boolean` | Whether a load operation is in progress |

### ReaderCallbacks

| Callback | Type | Description |
|----------|------|-------------|
| onStateChange | `(state: ReaderState) => void` | Called whenever reader state changes |
| onChapterChange | `(chapter: ChapterSummary, index: number) => void` | Called when a new chapter is loaded |
| onError | `(error: Error) => void` | Called when an error occurs |

Set callbacks via `engine.callbacks.onStateChange = ...`.

---

## Types

### Book

| Field | Type | Description |
|-------|------|-------------|
| id | `string` | Unique book identifier |
| title | `string` | Book title |
| author | `string` | Author name |
| authorId | `string \| null` | Author identifier |
| description | `string \| null` | Book description |
| language | `string` | Language code |
| coverUrl | `string \| null` | Full-size cover image URL |
| coverThumbUrl | `string \| null` | Thumbnail cover image URL |
| stylesUrl | `string \| null` | Custom stylesheet URL |
| subjects | `string[]` | Subject tags |
| genres | `string[]` | Genre tags |
| wordCount | `number \| null` | Total word count |
| chapterCount | `number \| null` | Total chapter count |
| difficultyScore | `number \| null` | Reading difficulty score |
| fleschScore | `number \| null` | Flesch readability score |
| cefrLevel | `string \| null` | CEFR language level |
| doubanRating | `number \| null` | Douban rating |
| goodreadsRating | `number \| null` | Goodreads rating |
| hasAudiobook | `boolean?` | Whether audiobook exists |
| audiobookId | `string \| null?` | Audiobook identifier |

### BookDetail

Extends Book with:

| Field | Type | Description |
|-------|------|-------------|
| chapters | `ChapterSummary[]` | List of chapter summaries |

### ChapterSummary

| Field | Type | Description |
|-------|------|-------------|
| id | `string` | Chapter identifier |
| title | `string` | Chapter title |
| order | `number` | Sort order (0-based) |
| wordCount | `number \| null` | Chapter word count |

### ChapterContent

| Field | Type | Description |
|-------|------|-------------|
| id | `string` | Chapter identifier |
| title | `string` | Chapter title |
| order | `number` | Sort order |
| contentUrl | `string` | URL to fetch HTML content |
| wordCount | `number \| null` | Chapter word count |
| previousChapterId | `string \| null` | Previous chapter ID |
| nextChapterId | `string \| null` | Next chapter ID |

### LoadedChapter

| Field | Type | Description |
|-------|------|-------------|
| meta | `ChapterContent` | Chapter metadata |
| html | `string` | Raw HTML content |

### ReaderSettings

| Field | Type | Default | Range / Values |
|-------|------|---------|----------------|
| fontSize | `number` | `18` | Pixels |
| fontFamily | `string` | `"Georgia, serif"` | CSS font-family |
| lineHeight | `number` | `1.6` | Multiplier |
| letterSpacing | `number` | `0` | Pixels |
| wordSpacing | `number` | `0` | Pixels |
| paragraphSpacing | `number` | `12` | Pixels |
| textAlign | `TextAlign` | `"justify"` | `left \| center \| right \| justify` |
| hyphenation | `boolean` | `true` | - |
| theme | `ThemeName` | `"light"` | `light \| sepia \| dark \| ultraDark` |
| readingMode | `ReadingMode` | `"paginated"` | `paginated \| scroll` |
| margin | `number` | `20` | Pixels |

### ThemeColors

| Field | Type | Description |
|-------|------|-------------|
| background | `string` | Background color hex |
| text | `string` | Primary text color hex |
| secondaryText | `string` | Secondary text color hex |
| highlight | `string` | Highlight color hex |
| link | `string` | Link color hex |

### PageState

| Field | Type | Description |
|-------|------|-------------|
| currentPage | `number` | Current page index (0-based) |
| totalPages | `number` | Total number of pages |
| progress | `number` | Page progress within chapter (0 to 1) |
| isFirstPage | `boolean` | Whether on the first page |
| isLastPage | `boolean` | Whether on the last page |

### ScrollState

| Field | Type | Description |
|-------|------|-------------|
| scrollTop | `number` | Current scroll position |
| scrollHeight | `number` | Total scrollable height |
| clientHeight | `number` | Visible viewport height |
| progress | `number` | Scroll progress (0 to 1) |

---

## API Module

### ApiClient

Handles HTTP communication with the book content API.

**Constructor**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| options.baseUrl | `string` | Yes | API base URL (trailing slash stripped) |
| options.headers | `Record<string, string>` | No | Additional request headers |
| options.fetch | `typeof fetch` | No | Custom fetch implementation |

**Methods**

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| getBookDetail | `bookId: string` | `Promise<BookDetail>` | Fetch book metadata and chapter list |
| getChapterContent | `bookId: string, chapterId: string` | `Promise<ChapterContent>` | Fetch chapter metadata including content URL |
| fetchHtml | `url: string` | `Promise<string>` | Fetch raw HTML from a content URL |

### ContentLoader

Orchestrates chapter loading by combining metadata fetch + HTML fetch.

**Constructor**

| Parameter | Type | Description |
|-----------|------|-------------|
| client | `ApiClient` | An initialized ApiClient instance |

**Methods**

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| loadChapter | `bookId: string, chapterId: string` | `Promise<LoadedChapter>` | Fetch chapter metadata and HTML content |

---

## Renderer Module

### ChapterRenderer

Renders sanitized HTML into a DOM container with dynamic CSS styling.

**Constructor**

| Parameter | Type | Description |
|-----------|------|-------------|
| root | `HTMLElement` | DOM element to render into |
| settings | `ReaderSettings` | Initial reader settings |

**Methods**

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| render | `html: string` | `void` | Sanitize HTML via DOMPurify and mount to DOM |
| updateSettings | `settings: ReaderSettings` | `void` | Regenerate and apply CSS from new settings |
| clear | - | `void` | Remove all rendered content from the root |

**Properties**

| Property | Type | Description |
|----------|------|-------------|
| contentElement | `HTMLDivElement \| null` | The inner content div (`.reader-engine-content`) |
| viewportElement | `HTMLDivElement \| null` | The outer viewport div (`.reader-engine-viewport`) |

### generateReaderCSS

| Parameter | Type | Description |
|-----------|------|-------------|
| settings | `ReaderSettings` | Reader settings to convert to CSS |
| **Returns** | `string` | Complete CSS stylesheet string |

Generates CSS including: custom properties (`--re-*`), body typography, element styles (links, images, blockquotes, tables, code blocks), and conditional CSS column layout for paginated mode.

---

## Core Module

### Paginator

CSS column-based pagination engine. Splits content into fixed-width columns and navigates by translating the content element horizontally.

**Constructor**

| Parameter | Type | Description |
|-----------|------|-------------|
| container | `HTMLElement` | The viewport container element |
| content | `HTMLElement` | The content element with CSS columns |
| options | `PaginatorOptions` | Margin and gap configuration |

**PaginatorOptions**

| Field | Type | Description |
|-------|------|-------------|
| margin | `number` | Content margin in pixels |
| gap | `number` | Column gap in pixels |

**Methods**

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| recalculate | - | `void` | Recalculate page dimensions after layout change |
| goToPage | `page: number` | `void` | Navigate to a specific page (clamped) |
| nextPage | - | `boolean` | Advance one page; returns false at end |
| prevPage | - | `boolean` | Go back one page; returns false at start |
| goToStart | - | `void` | Jump to first page |
| goToEnd | - | `void` | Jump to last page |
| getState | - | `PageState` | Get current pagination state snapshot |

**Properties**

| Property | Type | Description |
|----------|------|-------------|
| currentPage | `number` | Current page index |
| totalPages | `number` | Total calculated pages |
| progress | `number` | Page progress (0 to 1) |
| isFirstPage | `boolean` | Whether on first page |
| isLastPage | `boolean` | Whether on last page |

**Callbacks**

| Callback | Type | Description |
|----------|------|-------------|
| onPageChange | `(state: PageState) => void` | Called after each page navigation |

### ScrollMode

Manages scroll-based reading mode with progress tracking.

**Constructor**

| Parameter | Type | Description |
|-----------|------|-------------|
| container | `HTMLElement` | Scrollable container element |

**Methods**

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| scrollTo | `progress: number` | `void` | Smooth-scroll to a progress value (0-1) |
| getState | - | `ScrollState` | Get current scroll state snapshot |
| destroy | - | `void` | Remove scroll event listener |

**Properties**

| Property | Type | Description |
|----------|------|-------------|
| progress | `number` | Current scroll progress (0 to 1) |

**Callbacks**

| Callback | Type | Description |
|----------|------|-------------|
| onScrollChange | `(state: ScrollState) => void` | Called on each scroll event |

---

## Navigation Module

### ChapterManager

Manages chapter navigation state. Maintains a sorted chapter list and tracks the current reading position.

**Constructor**

| Parameter | Type | Description |
|-----------|------|-------------|
| chapters | `ChapterSummary[]` | Array of chapters (sorted by `order` internally) |

**Methods**

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| getChapter | `index: number` | `ChapterSummary \| undefined` | Get chapter at index |
| getChapters | - | `ChapterSummary[]` | Get all chapters (sorted) |
| goTo | `index: number` | `boolean` | Jump to chapter index; false if out of range |
| goToId | `chapterId: string` | `boolean` | Jump to chapter by ID; false if not found |
| goToNext | - | `boolean` | Advance to next chapter; false at end |
| goToPrev | - | `boolean` | Go to previous chapter; false at start |

**Properties**

| Property | Type | Description |
|----------|------|-------------|
| totalChapters | `number` | Total number of chapters |
| currentIndex | `number` | Current chapter index |
| currentChapter | `ChapterSummary` | Current chapter object |
| hasNext | `boolean` | Whether a next chapter exists |
| hasPrev | `boolean` | Whether a previous chapter exists |

### calculateOverallProgress

| Parameter | Type | Description |
|-----------|------|-------------|
| chapterIndex | `number` | Zero-based current chapter index |
| currentPage | `number` | Zero-based current page in chapter |
| totalPagesInChapter | `number` | Total pages in current chapter |
| totalChapters | `number` | Total chapters in book |
| **Returns** | `number` | Overall progress from 0.0 to 1.0 |

Returns 0 if `totalChapters <= 0`. For single-page chapters, chapter progress is treated as 1.

---

## React Wrapper

Import from `@readmigo/reader-engine/react`.

### ReaderProvider

Wraps the application tree to provide reader engine context to child components.

**Props (ReaderProviderProps)**

Extends `ReaderEngineOptions` with:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| children | `ReactNode` | Yes | Child components |
| onError | `(error: Error) => void` | No | Error callback |
| onChapterChange | `(chapter: ChapterSummary, index: number) => void` | No | Chapter change callback |
| apiBaseUrl | `string` | Yes | Inherited from ReaderEngineOptions |
| apiHeaders | `Record<string, string>` | No | Inherited from ReaderEngineOptions |
| settings | `Partial<ReaderSettings>` | No | Inherited from ReaderEngineOptions |

### ReaderView

Renders the reader viewport. Mounts the engine to a DOM div and handles tap zones for navigation.

**Props (ReaderViewProps)**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| className | `string` | No | CSS class for the container div |
| style | `CSSProperties` | No | Inline styles for the container div |
| onTapLeft | `() => void` | No | Called when left 30% of viewport is tapped |
| onTapRight | `() => void` | No | Called when right 30% of viewport is tapped |
| onTapCenter | `() => void` | No | Called when center 40% of viewport is tapped |

Tap zone layout:

| Zone | Range | Default Action |
|------|-------|----------------|
| Left | 0% - 30% | `prevPage()` |
| Center | 30% - 70% | No navigation (custom handler) |
| Right | 70% - 100% | `nextPage()` |

### ReaderContextValue

The full context value available via `useReaderContext()`:

| Field | Type | Description |
|-------|------|-------------|
| engine | `ReaderEngine` | The underlying engine instance |
| state | `ReaderState` | Current reader state (reactive) |
| bookDetail | `BookDetail \| null` | Loaded book detail |
| chapters | `ChapterSummary[]` | Sorted chapter list |
| loadBook | `(bookId: string) => Promise<BookDetail>` | Load a book |
| loadChapter | `(index: number) => Promise<void>` | Load a chapter by index |
| nextPage | `() => boolean` | Navigate to next page |
| prevPage | `() => boolean` | Navigate to previous page |
| goToChapter | `(index: number) => Promise<void>` | Jump to a chapter |
| updateSettings | `(partial: Partial<ReaderSettings>) => void` | Update reader settings |

### Hooks

| Hook | Returns | Description |
|------|---------|-------------|
| `useReader()` | `{ state, loadBook, loadChapter, nextPage, prevPage, goToChapter }` | Core reader state and navigation methods |
| `useReaderSettings()` | `{ settings, updateSettings }` | Current settings and update function |
| `useChapters()` | `{ chapters, currentIndex, totalChapters, bookTitle }` | Chapter list and current position |
| `useReaderContext()` | `ReaderContextValue` | Full context value (advanced usage) |

---

## Constants

### DEFAULT_SETTINGS

Default `ReaderSettings` object with all fields populated. See the ReaderSettings table above for values.

### THEMES

`Record<ThemeName, ThemeColors>` mapping theme names to their color palettes. See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full color table.

### FONT_FAMILIES

Array of font family options:

| Name | CSS Value |
|------|-----------|
| Georgia | `Georgia, serif` |
| Palatino | `"Palatino Linotype", Palatino, serif` |
| Times | `"Times New Roman", Times, serif` |
| Baskerville | `Baskerville, serif` |
| Helvetica | `"Helvetica Neue", Helvetica, Arial, sans-serif` |
| Avenir | `"Avenir Next", Avenir, sans-serif` |
| System | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` |
| PingFang SC | `"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif` |
| Songti SC | `"Songti SC", "SimSun", serif` |
