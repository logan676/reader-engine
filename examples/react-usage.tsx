import React, { useEffect } from 'react';
import {
  ReaderProvider,
  ReaderView,
  useReader,
  useReaderSettings,
  useChapters,
} from '@readmigo/reader-engine/react';
import { THEMES, type ThemeName } from '@readmigo/reader-engine';

// Main reader page component
function ReaderPage({ bookId }: { bookId: string }) {
  const { state, loadBook, loadChapter, nextPage, prevPage } = useReader();
  const { settings, updateSettings } = useReaderSettings();
  const { chapters, currentIndex, bookTitle } = useChapters();

  // Load book and first chapter on mount
  useEffect(() => {
    loadBook(bookId).then(() => loadChapter(0));
  }, [bookId, loadBook, loadChapter]);

  const theme = THEMES[settings.theme];

  const handleThemeChange = (themeName: ThemeName) => {
    updateSettings({ theme: themeName });
  };

  return (
    <div style={{ background: theme.background, color: theme.text, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header with title and theme switcher */}
      <header style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{bookTitle}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['light', 'sepia', 'dark', 'ultraDark'] as ThemeName[]).map((t) => (
            <button
              key={t}
              onClick={() => handleThemeChange(t)}
              style={{
                padding: '4px 8px',
                background: THEMES[t].background,
                color: THEMES[t].text,
                border: t === settings.theme ? '2px solid ' + theme.link : '1px solid ' + theme.secondaryText,
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      {/* Reader viewport with tap-zone navigation */}
      <ReaderView
        style={{ flex: 1 }}
        onTapCenter={() => console.log('Center tapped - toggle toolbar')}
      />

      {/* Footer with navigation controls and progress */}
      <footer style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: theme.secondaryText }}>
        <button onClick={prevPage} disabled={state.isFirstPage && state.isFirstChapter}>
          Previous
        </button>
        <span>
          {state.loading
            ? 'Loading...'
            : `Ch ${currentIndex + 1}/${chapters.length} | Page ${state.currentPage + 1}/${state.totalPages} | ${(state.overallProgress * 100).toFixed(1)}%`}
        </span>
        <button onClick={nextPage} disabled={state.isLastPage && state.isLastChapter}>
          Next
        </button>
      </footer>
    </div>
  );
}

// App root with provider
function App() {
  return (
    <ReaderProvider
      apiBaseUrl="https://api.readmigo.com"
      settings={{ theme: 'light', fontSize: 18 }}
      onError={(err) => console.error('Reader error:', err)}
      onChapterChange={(chapter, index) => console.log(`Chapter ${index}: ${chapter.title}`)}
    >
      <ReaderPage bookId="book-123" />
    </ReaderProvider>
  );
}

export default App;
