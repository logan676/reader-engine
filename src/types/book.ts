export interface Book {
  id: string;
  title: string;
  author: string;
  authorId: string | null;
  description: string | null;
  language: string;
  coverUrl: string | null;
  coverThumbUrl: string | null;
  stylesUrl: string | null;
  subjects: string[];
  genres: string[];
  wordCount: number | null;
  chapterCount: number | null;
  difficultyScore: number | null;
  fleschScore: number | null;
  cefrLevel: string | null;
  doubanRating: number | null;
  goodreadsRating: number | null;
  hasAudiobook?: boolean;
  audiobookId?: string | null;
}

export interface ChapterSummary {
  id: string;
  title: string;
  order: number;
  wordCount: number | null;
}

export interface BookDetail {
  id: string;
  title: string;
  author: string;
  authorId: string | null;
  description: string | null;
  language: string;
  coverUrl: string | null;
  coverThumbUrl: string | null;
  stylesUrl: string | null;
  subjects: string[];
  genres: string[];
  wordCount: number | null;
  chapterCount: number | null;
  difficultyScore: number | null;
  fleschScore: number | null;
  cefrLevel: string | null;
  doubanRating: number | null;
  goodreadsRating: number | null;
  chapters: ChapterSummary[];
}
