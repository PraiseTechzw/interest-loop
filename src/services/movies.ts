import { buildUrl, fetchJson } from '@/lib/api';
import { getInterest } from '@/lib/interest-catalogue';
import type { FeedResult, Movie } from '@/types/models';

type TmdbResponse = {
  results?: {
    id: number;
    title?: string;
    overview?: string;
    poster_path?: string | null;
    vote_average?: number;
    vote_count?: number;
    genre_ids?: number[];
    release_date?: string;
  }[];
};

function pickInterest(genreIds: number[], interests: string[]): string {
  return (
    interests.find((id) =>
      getInterest(id).movieGenres.some((genre) => genreIds.includes(genre)),
    ) ?? interests[0]
  );
}

const MIN_VOTES = 500;
const PRIOR_RATING = 6;

/** Bayesian score: a 9/10 from 50 votes should not outrank 8/10 from 20,000. */
export function rankingScore(rating: number, votes: number): number {
  return (votes * rating + MIN_VOTES * PRIOR_RATING) / (votes + MIN_VOTES);
}

export async function fetchMovieById(
  id: number,
  interests: string[],
): Promise<Movie | null> {
  const apiKey = process.env.EXPO_PUBLIC_TMDB_KEY?.trim();
  if (!apiKey) return null;

  try {
    const movie = await fetchJson<{
      id: number;
      title?: string;
      overview?: string;
      tagline?: string;
      poster_path?: string | null;
      backdrop_path?: string | null;
      vote_average?: number;
      vote_count?: number;
      genre_ids?: number[];
      genres?: { name: string }[];
      runtime?: number | null;
      release_date?: string;
    }>(
      buildUrl(`https://api.themoviedb.org/3/movie/${id}`, {
        api_key: apiKey,
        language: 'en',
      }),
    );
    if (!movie.id || !movie.title) return null;
    return {
      id: movie.id,
      title: movie.title,
      overview: movie.overview ?? '',
      posterPath: movie.poster_path ?? null,
      rating: movie.vote_average ?? 0,
      voteCount: movie.vote_count ?? 0,
      genreIds: movie.genre_ids ?? [],
      releaseDate: movie.release_date ?? '',
      interest: pickInterest(
        movie.genre_ids ?? [],
        interests.length ? interests : ['geek'],
      ),
      tagline: movie.tagline || undefined,
      runtime: movie.runtime ?? undefined,
      genres: movie.genres?.map((genre) => genre.name),
      backdropPath: movie.backdrop_path ?? null,
    };
  } catch {
    return null;
  }
}

/** Finds an official YouTube trailer key so it can play without leaving the app. */
export async function fetchMovieTrailer(id: number): Promise<string | null> {
  const apiKey = process.env.EXPO_PUBLIC_TMDB_KEY?.trim();
  if (!apiKey) return null;

  try {
    const data = await fetchJson<{
      results?: { site?: string; type?: string; official?: boolean; key?: string }[];
    }>(
      buildUrl(`https://api.themoviedb.org/3/movie/${id}/videos`, {
        api_key: apiKey,
        language: 'en-US',
      }),
    );
    const videos = data.results ?? [];
    const trailer =
      videos.find((video) => video.site === 'YouTube' && video.type === 'Trailer' && video.official) ??
      videos.find((video) => video.site === 'YouTube' && video.type === 'Trailer');
    return trailer?.key ?? null;
  } catch {
    return null;
  }
}

export async function fetchMovies(interests: string[]): Promise<FeedResult<Movie>> {
  const apiKey = process.env.EXPO_PUBLIC_TMDB_KEY?.trim();

  if (!apiKey || interests.length === 0) {
    return {
      items: [],
      notice: 'No movie source connected. Add EXPO_PUBLIC_TMDB_KEY to .env and restart the app.',
    };
  }

  // TMDB treats a comma as AND (a movie must match every genre). With several
  // interests selected that yields zero results, so use OR to match any genre.
  const genres = Array.from(
    new Set(interests.flatMap((id) => getInterest(id).movieGenres)),
  ).join('|');

  try {
    const data = await fetchJson<TmdbResponse>(
      buildUrl('https://api.themoviedb.org/3/discover/movie', {
        api_key: apiKey,
        with_genres: genres,
        sort_by: 'popularity.desc',
        include_adult: 'false',
        'vote_count.gte': 200,
        page: 1,
      }),
    );

    const items = (data.results ?? [])
      .filter((movie) => movie.id && movie.title)
      .slice(0, 20)
      .map(
        (movie): Movie => ({
          id: movie.id,
          title: movie.title!,
          overview: movie.overview ?? '',
          posterPath: movie.poster_path ?? null,
          rating: movie.vote_average ?? 0,
          voteCount: movie.vote_count ?? 0,
          genreIds: movie.genre_ids ?? [],
          releaseDate: movie.release_date ?? '',
          interest: pickInterest(movie.genre_ids ?? [], interests),
        }),
      )
      .sort(
        (a, b) =>
          rankingScore(b.rating, b.voteCount) - rankingScore(a.rating, a.voteCount) ||
          b.voteCount - a.voteCount,
      );

    if (items.length === 0) {
      return {
        items: [],
        notice: 'No movies matched your interests right now. Try adding more interests in Profile.',
      };
    }

    return { items };
  } catch (error) {
    return {
      items: [],
      error: 'Live recommendations could not be loaded. Check your connection and API key.',
      notice: error instanceof Error ? error.message : undefined,
    };
  }
}
