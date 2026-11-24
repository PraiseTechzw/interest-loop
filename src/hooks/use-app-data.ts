import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo } from 'react';

import type { Interest, InterestId } from '@/constants/interests';
import {
  addCustomInterest,
  addFeedback,
  addMindsetPrompt,
  clearUserData,
  deleteCapsule,
  deleteCoachResponse,
  deleteCustomInterest,
  deleteMindsetPrompt,
  getCapsules,
  getCoachResponses,
  getCustomInterests,
  getFeedback,
  getInterests,
  getInterestActivity,
  getMindsetPrompts,
  getLearningProgress,
  getProfile,
  getSavedArticleByUrl,
  getSavedArticles,
  getSavedDiscovery,
  getSavedNoteById,
  getSavedNotes,
  getSavedMovies,
  getSavedMovieById,
  getSetting,
  importUserData,
  parseBackup,
  removeArticle,
  removeDiscovery,
  removeMovie,
  removeNote,
  resetLearningProgress,
  reviewCoachResponse,
  saveArticle,
  saveCoachResponse,
  saveDiscovery,
  saveCapsule,
  saveMovie,
  saveNote,
  setInterest,
  setSetting,
  setLearningProgress,
  setProfile,
  type UserDataBackup,
} from '@/lib/database';
import { registerCustomInterests } from '@/lib/interest-catalogue';
import { buildLearningPaths } from '@/lib/learning-paths';
import { keys } from '@/lib/query-keys';
import { fetchDiscovery } from '@/services/discovery';
import { fetchMovies } from '@/services/movies';
import { fetchNews } from '@/services/news';
import type {
  CoachResponse,
  DiscoveryItem,
  FeedbackEntry,
  MindsetPrompt,
  Movie,
  NewsArticle,
  PromptCategory,
  SavedArticleRow,
  SavedCapsule,
  SavedDiscoveryRow,
  SavedMovieRow,
  SavedNoteRow,
  UserProfile,
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
      client.invalidateQueries({ queryKey: keys.savedNotes }),
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

/** Built-in plus user-created topics, registered for pure feed adapters. */
export function useInterestCatalogue() {
  const db = useDb();
  const query = useQuery<Interest[]>({
    queryKey: keys.interestCatalogue,
    queryFn: () => getCustomInterests(db),
  });

  useEffect(() => {
    if (query.data) registerCustomInterests(query.data);
  }, [query.data]);

  return query;
}

export function useAddCustomInterest() {
  const db = useDb();
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (interest: Interest) => {
      await addCustomInterest(db, interest);
      await setInterest(db, interest.id, true);
    },
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: keys.interestCatalogue }),
        client.invalidateQueries({ queryKey: keys.interests }),
      ]);
    },
  });
}

export function useDeleteCustomInterest() {
  const db = useDb();
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => deleteCustomInterest(db, id),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: keys.interestCatalogue }),
        client.invalidateQueries({ queryKey: keys.interests }),
        client.invalidateQueries({ queryKey: keys.activity }),
      ]);
    },
  });
}

// -- Profile -----------------------------------------------------------------

export function useProfile() {
  const db = useDb();
  return useQuery<UserProfile>({
    queryKey: keys.profile,
    queryFn: () => getProfile(db),
  });
}

export function useSetProfile() {
  const db = useDb();
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => setProfile(db, profile),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.profile }),
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
      if (input.saved) {
        await saveArticle(db, input.article);
        if (input.article.imageUrl) {
          void Image.prefetch([input.article.imageUrl], 'disk').catch(() => {});
        }
      } else await removeArticle(db, input.article.url);
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
      if (input.saved) {
        await saveMovie(db, input.movie);
        if (input.movie.posterPath) {
          void Image.prefetch(
            [`https://image.tmdb.org/t/p/w342${input.movie.posterPath}`],
            'disk',
          ).catch(() => {});
        }
      } else await removeMovie(db, input.movie.id);
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

// -- Personal notes ----------------------------------------------------------

export function useSavedNotes() {
  const db = useDb();
  return useQuery<SavedNoteRow[]>({
    queryKey: keys.savedNotes,
    queryFn: () => getSavedNotes(db),
  });
}

export function useSavedNote(id: string) {
  const db = useDb();
  return useQuery({
    queryKey: ['saved-note', id],
    queryFn: () => getSavedNoteById(db, id),
    enabled: Boolean(id),
  });
}

export function useSaveNote() {
  const db = useDb();
  const invalidate = useInvalidateAllSaved();

  return useMutation({
    mutationFn: async (input: {
      id?: string;
      title: string;
      body: string;
      url: string;
      interest: string;
    }) => saveNote(db, input),
    onSuccess: invalidate,
  });
}

export function useRemoveNote() {
  const db = useDb();
  const invalidate = useInvalidateAllSaved();

  return useMutation({
    mutationFn: async (id: string) => removeNote(db, id),
    onSuccess: invalidate,
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
  const notes = useSavedNotes();
  const progress = useLearningProgress();

  const paths = useMemo(
    () =>
      buildLearningPaths({
        interests: interests.data ?? [],
        articles: articles.data ?? [],
        movies: movies.data ?? [],
        finds: finds.data ?? [],
        notes: notes.data ?? [],
        progress: progress.data ?? {},
      }),
    [interests.data, articles.data, movies.data, finds.data, notes.data, progress.data],
  );

  return {
    paths,
    isLoading: interests.isLoading || progress.isLoading,
    refetch: () => {
      interests.refetch();
      articles.refetch();
      movies.refetch();
      finds.refetch();
      notes.refetch();
      progress.refetch();
    },
  };
}

// -- User-created mindset prompts --------------------------------------------

export function useMindsetPrompts() {
  const db = useDb();
  return useQuery<MindsetPrompt[]>({
    queryKey: keys.mindsetPrompts,
    queryFn: () => getMindsetPrompts(db),
  });
}

export function useAddMindsetPrompt() {
  const db = useDb();
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      prompt: string;
      category: PromptCategory;
      hint: string;
    }) => addMindsetPrompt(db, input),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.mindsetPrompts }),
  });
}

export function useDeleteMindsetPrompt() {
  const db = useDb();
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => deleteMindsetPrompt(db, id),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: keys.mindsetPrompts }),
        client.invalidateQueries({ queryKey: keys.coachResponses }),
      ]);
    },
  });
}

// -- Local data management ---------------------------------------------------

export function useClearUserData() {
  const db = useDb();
  const client = useQueryClient();

  return useMutation({
    mutationFn: async () => clearUserData(db),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: keys.savedArticles }),
        client.invalidateQueries({ queryKey: keys.savedMovies }),
        client.invalidateQueries({ queryKey: keys.savedDiscovery }),
        client.invalidateQueries({ queryKey: keys.savedNotes }),
        client.invalidateQueries({ queryKey: keys.coachResponses }),
        client.invalidateQueries({ queryKey: keys.mindsetPrompts }),
        client.invalidateQueries({ queryKey: keys.learningProgress }),
        client.invalidateQueries({ queryKey: keys.activity }),
      ]);
    },
  });
}

export function useImportBackup() {
  const db = useDb();
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (text: string): Promise<UserDataBackup> => {
      const backup = parseBackup(text);
      await importUserData(db, backup);
      return backup;
    },
    onSuccess: async () => {
      await client.resetQueries();
    },
  });
}

// -- Settings, feedback, capsules, detail ------------------------------------

export function useSetting(key: string) {
  const db = useDb();
  return useQuery<string | null>({
    queryKey: keys.setting(key),
    queryFn: () => getSetting(db, key),
  });
}

export function useSetSetting() {
  const db = useDb();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) =>
      setSetting(db, key, value),
    onSuccess: (_, variables) => client.invalidateQueries({ queryKey: keys.setting(variables.key) }),
  });
}

export function useFeedback() {
  const db = useDb();
  return useQuery<FeedbackEntry[]>({
    queryKey: keys.feedback,
    queryFn: () => getFeedback(db),
  });
}

export function useAddFeedback() {
  const db = useDb();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: { category: string; message: string }) => addFeedback(db, input),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.feedback }),
  });
}

export function useCapsules() {
  const db = useDb();
  return useQuery<SavedCapsule[]>({
    queryKey: keys.capsules,
    queryFn: () => getCapsules(db),
  });
}

export function useSaveCapsule() {
  const db = useDb();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (summary: string) => saveCapsule(db, summary),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.capsules }),
  });
}

export function useDeleteCapsule() {
  const db = useDb();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => deleteCapsule(db, id),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.capsules }),
  });
}

export function useSavedArticle(url: string) {
  const db = useDb();
  return useQuery({
    queryKey: ['saved-article', url],
    queryFn: () => getSavedArticleByUrl(db, url),
    enabled: Boolean(url),
  });
}

export function useSavedMovie(tmdbId: number) {
  const db = useDb();
  return useQuery({
    queryKey: ['saved-movie', tmdbId],
    queryFn: () => getSavedMovieById(db, tmdbId),
    enabled: Number.isFinite(tmdbId) && tmdbId > 0,
  });
}

// -- Remote feeds ------------------------------------------------------------

export function useNews(interests: string[]) {
  return useQuery({
    queryKey: keys.news(interests),
    queryFn: () => fetchNews(interests),
    enabled: interests.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMovieFeed(interests: string[]) {
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
