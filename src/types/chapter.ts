export interface ChapterContent {
  id: string;
  title: string;
  order: number;
  contentUrl: string;
  wordCount: number | null;
  previousChapterId: string | null;
  nextChapterId: string | null;
}

export interface LoadedChapter {
  meta: ChapterContent;
  html: string;
}
