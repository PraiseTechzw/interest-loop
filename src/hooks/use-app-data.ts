import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemo } from 'react';

import type { InterestId } from '@/constants/interests';
import {
  deleteCoachResponse,
  getCoachResponses,
  getInterests,
  getInterestActivity,
  getLearningProgress,
  getSavedArticles,
  getSavedDiscovery,
  getSavedMovies,
  removeArticle,
  removeDiscovery,
  removeMovie,
  resetLearningProgress,
  reviewCoachResponse,
  saveArticle,
  saveCoachResponse,
  saveDiscovery,
  saveMovie,
  setInterest,
  setLearningProgress,
} from '@/lib/database';
import { buildLearningPaths } from '@/lib/learning-paths';
import { keys } from '@/lib/query-keys';
import { fetchDiscovery } from '@/services/discovery';
import { fetchMovies } from '@/services/movies';
import { fetchNews } from '@/services/news';
import type {
  CoachResponse,
  DiscoveryItem,
  Movie,
  NewsArticle,
  PromptCategory,
  SavedArticleRow,
  SavedDiscoveryRow,
  SavedMovieRow,
} from '@/types/models';

function useDb() {
  return useSQLiteContext();
}

function useInvalidateAllSaved() {
  const client = useQueryClient();
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: keys.savedArticles }),
      client.invalidateQueries({ queryKey: keys.savedMovies }),
      client.invalidateQueries({ queryKey: keys.savedDiscovery }),
      client.invalidateQueries({ queryKey: keys.activity }),
    ]);
}

// -- Interests ---------------------------------------------------------------

export function useInterests() {
  const db = useDb();
  return useQuery<InterestId[]>({
    queryKey: keys.interests,
    queryFn: () => getInterests(db),
  });
}

export function useSetInterest() {
  const db = useDb();
  const client = useQueryClient();

  return useMutation({
    mutationFn: async ({ tag, selected }: { tag: InterestId; selected: boolean }) => {
      await setInterest(db, tag, selected);
    },
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: keys.interests }),
        client.invalidateQueries({ queryKey: ['news'] }),
        client.invalidateQueries({ queryKey: ['movie-feed'] }),
        client.invalidateQueries({ queryKey: keys.activity }),
      ]);
    },
  });
}

// -- Saved content -----------------------------------------------------------

export function useSavedArticles() {
  const db = useDb();
  return useQuery<SavedArticleRow[]>({
    queryKey: keys.savedArticles,
    queryFn: () => getSavedArticles(db),
  });
}

export function useToggleSavedArticle() {
  const db = useDb();
  const invalidate = useInvalidateAllSaved();

  return useMutation({
    mutationFn: async (input: { article: NewsArticle; saved: boolean }) => {
      if (input.saved) await saveArticle(db, input.article);
      else await removeArticle(db, input.article.url);
    },
    onSuccess: invalidate,
  });
}

export function useSavedMovies() {
  const db = useDb();
  return useQuery<SavedMovieRow[]>({
    queryKey: keys.savedMovies,
    queryFn: () => getSavedMovies(db),
  });
}

export function useToggleSavedMovie() {
  const db = useDb();
  const invalidate = useInvalidateAllSaved();

  return useMutation({
    mutationFn: async (input: { movie: Movie; saved: boolean }) => {
      if (input.saved) await saveMovie(db, input.movie);
      else await removeMovie(db, input.movie.id);
    },
    onSuccess: invalidate,
  });
}

export function useSavedDiscovery() {
  const db = useDb();
  return useQuery<SavedDiscoveryRow[]>({
    queryKey: keys.savedDiscovery,
    queryFn: () => getSavedDiscovery(db),
  });
}

export function useToggleSavedDiscovery() {
  const db = useDb();
  const invalidate = useInvalidateAllSaved();

  return useMutation({
    mutationFn: async (input: { item: DiscoveryItem; saved: boolean }) => {
      if (input.saved) await saveDiscovery(db, input.item);
      else await removeDiscovery(db, input.item.id);
    },
    onSuccess: invalidate,
  });
}

export function useInterestActivity() {
  const db = useDb();
  return useQuery<Record<string, number>>({
    queryKey: keys.activity,
    queryFn: () => getInterestActivity(db),
  });
}

// -- Coach -------------------------------------------------------------------

export function useCoachResponses() {
  const db = useDb();
  return useQuery<CoachResponse[]>({
    queryKey: keys.coachResponses,
    queryFn: () => getCoachResponses(db),
  });
}

export function useSaveCoachResponse() {
  const db = useDb();
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      promptId: string;
      response: string;
      category: PromptCategory;
    }) => saveCoachResponse(db, input),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.coachResponses }),
  });
}

export function useReviewCoachResponse() {
  const db = useDb();
  const client = useQueryClient();

  return useMutation({
    mutationFn: async ({ promptId, again }: { promptId: string; again: boolean }) =>
      reviewCoachResponse(db, promptId, again),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.coachResponses }),
  });
}

export function useDeleteCoachResponse() {
  const db = useDb();
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (promptId: string) => deleteCoachResponse(db, promptId),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.coachResponses }),
  });
}

// -- Learning paths ----------------------------------------------------------

export function useLearningProgress() {
  const db = useDb();
  return useQuery<Record<string, boolean>>({
    queryKey: keys.learningProgress,
    queryFn: () => getLearningProgress(db),
  });
}

export function useSetLearningProgress() {
  const db = useDb();
  const client = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, done }: { key: string; done: boolean }) =>
      setLearningProgress(db, key, done),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.learningProgress }),
  });
}

export function useResetLearningProgress() {
  const db = useDb();
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (prefix: string) => resetLearningProgress(db, prefix),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.learningProgress }),
  });
}

/** Combine saved content and progress into ordered paths for the current interests. */
export function useLearningPaths() {
  const interests = useInterests();
  const articles = useSavedArticles();
  const movies = useSavedMovies();
  const finds = useSavedDiscovery();
  const progress = useLearningProgress();

  const paths = useMemo(
    () =>
      buildLearningPaths({
        interests: interests.data ?? [],
        articles: articles.data ?? [],
        movies: movies.data ?? [],
        finds: finds.data ?? [],
        progress: progress.data ?? {},
      }),
    [interests.data, articles.data, movies.data, finds.data, progress.data],
  );

  return {
    paths,
    isLoading: interests.isLoading || progress.isLoading,
    refetch: () => {
      interests.refetch();
      articles.refetch();
      movies.refetch();
      finds.refetch();
      progress.refetch();
    },
  };
}

// -- Remote feeds ------------------------------------------------------------

export function useNews(interests: InterestId[]) {
  return useQuery({
    queryKey: keys.news(interests),
    queryFn: () => fetchNews(interests),
    enabled: interests.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMovieFeed(interests: InterestId[]) {
  return useQuery({
    queryKey: keys.movieFeed(interests),
    queryFn: () => fetchMovies(interests),
    enabled: interests.length > 0,
    staleTime: 30 * 60 * 1000,
  });
}

export function useDiscoveryFeed() {
  return useQuery({
    queryKey: keys.discoveryFeed,
    queryFn: fetchDiscovery,
    staleTime: 5 * 60 * 1000,
  });
}
