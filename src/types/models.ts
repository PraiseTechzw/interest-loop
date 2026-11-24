import type { ImageSource as ExpoImageSource } from 'expo-image';

import type { InterestId } from '@/constants/interests';

export type NewsArticle = {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  imageUrl?: string | null;
  publishedAt: string;
  interest: InterestId;
};

export type Movie = {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  posterSource?: ExpoImageSource | number;
  rating: number;
  voteCount: number;
  genreIds: number[];
  releaseDate: string;
  interest: InterestId;
};

export type DiscoveryItem = {
  id: string;
  title: string;
  source: 'hacker-news' | 'reddit' | 'curated';
  url: string;
  excerpt: string;
  score: number;
  age: string;
  type: 'article' | 'video';
  interest: InterestId;
};

export type FeedResult<T> = {
  items: T[];
  isDemo: boolean;
  notice?: string;
};

export type PromptCategory = 'first-principles' | 'inversion' | 'second-order' | 'occam';

export type MindsetPrompt = {
  id: string;
  prompt: string;
  category: PromptCategory;
  hint: string;
  interest: InterestId;
};

export type CoachResponse = {
  promptId: string;
  response: string;
  category: PromptCategory;
  reviewCount: number;
  intervalDays: number;
  nextReviewAt: string;
  updatedAt: string;
};

export type SavedArticleRow = {
  id: number;
  title: string;
  url: string;
  description: string;
  source: string;
  image_url: string | null;
  interest_tag: string;
  saved_at: string;
};

export type SavedMovieRow = {
  id: number;
  tmdb_id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  genre: string;
  saved_at: string;
};

export type SavedDiscoveryRow = {
  id: string;
  title: string;
  url: string;
  excerpt: string;
  source: string;
  score: number;
  interest_tag: string;
  saved_at: string;
};

export type InterestRow = {
  tag: string;
  selected_at: string;
};

export type GraphNode = {
  id: string;
  label: string;
  color: string;
  interest: InterestId;
  savedCount: number;
  x: number;
  y: number;
};

export type GraphEdge = {
  id: string;
  from: string;
  to: string;
  strength: number;
};
