# Getting Started

## Prerequisites

- Node.js >= 18
- npm, yarn, or pnpm
- TypeScript >= 5.7 (for development)

## Installation

```
npm install @readmigo/reader-engine
```

For React integration:

```
npm install @readmigo/reader-engine react react-dom
```

## Module Entry Points

| Import Path | Format | Description |
|------------|--------|-------------|
| `@readmigo/reader-engine` | ESM / CJS | Core engine (types, API, renderer, paginator, navigation) |
| `@readmigo/reader-engine/react` | ESM / CJS | React wrapper (Provider, View, hooks) |

## Integration Flow

### Vanilla TypeScript (using ReaderEngine facade)

```mermaid
sequenceDiagram
    participant App
    participant RE as ReaderEngine
    participant API as Internal API
    participant DOM as Internal Renderer

    App->>RE: new ReaderEngine({ apiBaseUrl })
    App->>RE: mount(containerElement)
    App->>RE: loadBook(bookId)
    RE->>API: getBookDetail
    API-->>RE: BookDetail
    RE-->>App: BookDetail returned

    App->>RE: loadChapter(0)
    RE->>API: fetch chapter + HTML
    RE->>DOM: render + paginate
    RE-->>App: onStateChange(ReaderState)

    App->>RE: nextPage()
    RE-->>App: onStateChange(ReaderState)

    App->>RE: updateSettings({ theme: 'dark' })
    RE->>DOM: re-style + re-paginate
    RE-->>App: onStateChange(ReaderState)
```

### React Integration

```mermaid
graph TD
    RP["ReaderProvider (apiBaseUrl, settings)"] --> |context| RV["ReaderView (tap zones)"]
    RP --> |context| UR["useReader()"]
    RP --> |context| URS["useReaderSettings()"]
    RP --> |context| UC["useChapters()"]

    UR --> |"state, loadBook, nextPage, prevPage"| App[Application]
    URS --> |"settings, updateSettings"| App
    UC --> |"chapters, currentIndex, bookTitle"| App
```

## Customizing Settings

Override any field from `DEFAULT_SETTINGS` to customize the reading experience:

| Setting | Effect |
|---------|--------|
| `fontSize` | Adjust text size (triggers re-pagination) |
| `fontFamily` | Change typeface (use values from `FONT_FAMILIES`) |
| `lineHeight` | Adjust vertical spacing |
| `theme` | Switch color scheme (`light`, `sepia`, `dark`, `ultraDark`) |
| `readingMode` | Toggle between `paginated` and `scroll` |
| `textAlign` | Change alignment (`left`, `center`, `right`, `justify`) |
| `hyphenation` | Enable/disable CSS hyphenation |
| `margin` | Adjust content padding |

With the `ReaderEngine` facade, call `engine.updateSettings({ ... })` -- it handles CSS regeneration and re-pagination internally. When using lower-level modules directly, call `ChapterRenderer.updateSettings()` followed by `Paginator.recalculate()`.

## Theme Switching

```mermaid
graph LR
    User -->|select theme| Settings[Update ReaderSettings.theme]
    Settings --> CSS[generateReaderCSS]
    CSS --> DOM[Inject updated styles]
    DOM --> Repaginate[Paginator.recalculate]
```

Available themes:

| Theme | Background | Best For |
|-------|-----------|----------|
| Light | White (#FFFFFF) | Daytime reading |
| Sepia | Warm tan (#F4ECD8) | Reduced eye strain |
| Dark | Dark gray (#1C1C1E) | Low-light environments |
| Ultra Dark | Pure black (#000000) | OLED screens / night reading |

## Chapter Navigation

```mermaid
stateDiagram-v2
    [*] --> Chapter0: Initialize
    Chapter0 --> Chapter1: goToNext()
    Chapter1 --> Chapter2: goToNext()
    Chapter2 --> Chapter1: goToPrev()
    Chapter1 --> ChapterN: goTo(n) / goToId(id)
    ChapterN --> [*]: Last chapter

    state "Boundary Check" as BC {
        hasPrev: hasPrev (false at start)
        hasNext: hasNext (false at end)
    }
```

Navigation workflow (using ReaderEngine facade):

| Step | Action | Result |
|------|--------|--------|
| 1 | `engine.loadBook(bookId)` | Fetches book detail, initializes chapter manager |
| 2 | `engine.loadChapter(0)` | Loads first chapter, renders, paginates |
| 3 | `engine.nextPage()` / `engine.prevPage()` | Navigates pages; auto-advances chapters at boundaries |
| 4 | `engine.goToChapter(index)` or `engine.goToChapterId(id)` | Jumps to any chapter |
| 5 | Read `engine.state.overallProgress` | Overall progress (0.0 to 1.0) |
| 6 | Listen via `engine.callbacks.onStateChange` | Reactive state updates |

Navigation workflow (using low-level modules):

| Step | Action | Result |
|------|--------|--------|
| 1 | Create `ChapterManager` with `BookDetail.chapters` | Chapters sorted by `order` |
| 2 | Use `goToNext()` / `goToPrev()` / `goTo()` / `goToId()` | Returns `boolean` success |
| 3 | Read `currentChapter` to get `ChapterSummary` | Contains `id`, `title`, `order` |
| 4 | Load chapter content via `ContentLoader.loadChapter()` | Returns `LoadedChapter` |
| 5 | Render via `ChapterRenderer.render(html)` | DOM updated |
| 6 | Create new `Paginator` for the new content | Pages recalculated |
| 7 | Call `calculateOverallProgress()` for book-level progress | Returns 0.0 to 1.0 |
