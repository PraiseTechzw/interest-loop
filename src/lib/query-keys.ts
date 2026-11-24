import type { InterestId } from '@/constants/interests';

export const keys = {
  interests: ['interests'] as const,
  profile: ['profile'] as const,
  savedArticles: ['saved-articles'] as const,
  savedMovies: ['saved-movies'] as const,
  savedDiscovery: ['saved-discovery'] as const,
  coachResponses: ['coach-responses'] as const,
  mindsetPrompts: ['mindset-prompts'] as const,
  activity: ['interest-activity'] as const,
  learningProgress: ['learning-progress'] as const,
  setting: (key: string) => ['setting', key] as const,
  feedback: ['feedback'] as const,
  capsules: ['capsules'] as const,
  news: (ids: InterestId[]) => ['news', ids] as const,
  movieFeed: (ids: InterestId[]) => ['movie-feed', ids] as const,
  discoveryFeed: ['discovery-feed'] as const,
};
