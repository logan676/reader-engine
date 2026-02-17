# Architecture

## Module Overview

```mermaid
graph TB
    subgraph "Public API"
        RE["ReaderEngine (Facade)"]
        React["React Wrapper"]
    end

    subgraph "Core Modules"
        API["api/"]
        Renderer["renderer/"]
        Core["core/"]
        Nav["navigation/"]
        Types["types/"]
    end

    RE --> API
    RE --> Renderer
    RE --> Core
    RE --> Nav
    React --> RE

    API --> Types
    Renderer --> Types
    Core --> Types
    Nav --> Types
```

## Module Responsibilities

```mermaid
graph LR
    subgraph "api/"
        AC[ApiClient] --> CL[ContentLoader]
    end

    subgraph "renderer/"
        SI[StyleInjector] --> CR[ChapterRenderer]
    end

    subgraph "core/"
        P[Paginator]
        SM[ScrollMode]
    end

    subgraph "navigation/"
        CM[ChapterManager]
        PR[Progress Calculator]
    end
```

| Module | Files | Purpose |
|--------|-------|---------|
| `types/` | `book.ts`, `chapter.ts`, `settings.ts` | Data models, settings interface, theme definitions, font families |
| `api/` | `client.ts`, `content-loader.ts` | HTTP client for book/chapter API, HTML content fetching |
| `renderer/` | `style-injector.ts`, `chapter-renderer.ts` | CSS generation from settings, DOMPurify HTML rendering |
| `core/` | `paginator.ts`, `scroll-mode.ts` | CSS column pagination engine, scroll-based reading mode |
| `navigation/` | `chapter-manager.ts`, `progress.ts` | Chapter traversal state machine, overall reading progress |
| `engine.ts` | `engine.ts` | ReaderEngine facade: orchestrates all modules behind a single API |
| `react/` | `context.tsx`, `ReaderView.tsx`, `hooks.ts` | ReaderProvider, ReaderView component, useReader/useReaderSettings/useChapters hooks |

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Engine as ReaderEngine
    participant API as ApiClient
    participant CL as ContentLoader
    participant CR as ChapterRenderer
    participant P as Paginator

    User->>Engine: loadBook(bookId)
    Engine->>API: getBookDetail(bookId)
    API-->>Engine: BookDetail + ChapterSummary[]

    User->>Engine: loadChapter(index)
    Engine->>CL: loadChapter(bookId, chapterId)
    CL->>API: getChapterContent()
    API-->>CL: ChapterContent (metadata + contentUrl)
    CL->>API: fetchHtml(contentUrl)
    API-->>CL: Raw HTML
    CL-->>Engine: LoadedChapter (meta + html)

    Engine->>CR: render(html)
    Note over CR: DOMPurify sanitization
    Note over CR: Inject CSS from settings
    CR-->>Engine: DOM mounted

    Engine->>P: new Paginator(container, content)
    Note over P: Calculate pages via CSS columns

    User->>Engine: nextPage() / prevPage()
    Engine->>P: nextPage() / prevPage()
    P-->>Engine: PageState
```

## CSS Column Pagination

The paginator uses CSS multi-column layout to split content into fixed-width columns, then translates the content container horizontally to show one "page" at a time.

```mermaid
graph LR
    subgraph "Viewport (visible area)"
        Page["Current Page"]
    end

    subgraph "Content (CSS columns, translated)"
        C1["Col 1"]
        C2["Col 2"]
        C3["Col 3"]
        C4["Col 4"]
        C5["Col 5"]
    end

    Page -.->|"translateX(-N * pageWidth)"| C3
```

| Property | Value |
|----------|-------|
| Layout | `column-width: calc(100% - margin*2)` |
| Gap | `column-gap: margin*2` |
| Fill | `column-fill: auto` |
| Navigation | `transform: translateX(-currentPage * pageWidth)` |
| Overflow | `overflow: hidden` on viewport |

## Settings & Theme System

```mermaid
graph TD
    RS[ReaderSettings] --> SI[generateReaderCSS]
    SI --> CSS[CSS Stylesheet]
    CSS --> DOM[Style Element in DOM]

    RS --> |theme name| TH[THEMES Record]
    TH --> TC[ThemeColors]
    TC --> SI
```

### Theme Color Palette

| Theme | Background | Text | Secondary | Highlight | Link |
|-------|-----------|------|-----------|-----------|------|
| Light | `#FFFFFF` | `#1A1A1A` | `#666666` | `#FFD700` | `#2563EB` |
| Sepia | `#F4ECD8` | `#5B4636` | `#8B7355` | `#D4A574` | `#8B4513` |
| Dark | `#1C1C1E` | `#E5E5E7` | `#8E8E93` | `#4A90D9` | `#64B5F6` |
| Ultra Dark | `#000000` | `#E5E5E7` | `#8E8E93` | `#4A90D9` | `#64B5F6` |

### Typography Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| fontSize | number | 18 | Font size in pixels |
| fontFamily | string | Georgia, serif | CSS font-family value |
| lineHeight | number | 1.6 | Line height multiplier |
| letterSpacing | number | 0 | Letter spacing in pixels |
| wordSpacing | number | 0 | Word spacing in pixels |
| paragraphSpacing | number | 12 | Paragraph bottom margin in pixels |
| textAlign | TextAlign | justify | Text alignment |
| hyphenation | boolean | true | Enable CSS hyphenation |
| theme | ThemeName | light | Active theme |
| readingMode | ReadingMode | paginated | Paginated or scroll mode |
| margin | number | 20 | Content margin in pixels |

## Reading Progress Calculation

```mermaid
graph LR
    CI[chapterIndex] --> F["(chapterIndex + chapterProgress) / totalChapters"]
    CP[currentPage] --> CHP["chapterProgress = currentPage / (totalPages - 1)"]
    TP[totalPages] --> CHP
    CHP --> F
    TC[totalChapters] --> F
    F --> R["Result: 0.0 to 1.0"]
```
