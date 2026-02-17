import { ReaderEngine, type ReaderState } from '@readmigo/reader-engine';

async function main() {
  // 1. Create engine with API base URL and optional settings overrides
  const engine = new ReaderEngine({
    apiBaseUrl: 'https://api.readmigo.com',
    settings: { theme: 'sepia', fontSize: 20 },
  });

  // 2. Mount to a DOM container
  const container = document.getElementById('reader')!;
  engine.mount(container);

  // 3. Listen for state changes
  engine.callbacks.onStateChange = (state: ReaderState) => {
    console.log(
      `Chapter ${state.chapterIndex + 1} | ` +
      `Page ${state.currentPage + 1}/${state.totalPages} | ` +
      `Overall: ${(state.overallProgress * 100).toFixed(1)}%`,
    );
  };

  engine.callbacks.onError = (error) => {
    console.error('Reader error:', error.message);
  };

  // 4. Load a book and its first chapter
  const book = await engine.loadBook('book-123');
  console.log(`Loaded: ${book.title} by ${book.author} (${book.chapters.length} chapters)`);
  await engine.loadChapter(0);

  // 5. Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') engine.nextPage();
    if (e.key === 'ArrowLeft') engine.prevPage();
  });

  // 6. Change settings at any time (re-styles and re-paginates automatically)
  engine.updateSettings({ theme: 'dark', lineHeight: 1.8 });

  // 7. Jump to a specific chapter
  await engine.goToChapter(3);

  // 8. Clean up when done
  // engine.unmount();
}

main();
