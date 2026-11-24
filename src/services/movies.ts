import { INTEREST_BY_ID, type InterestId } from '@/constants/interests';
import { buildUrl, fetchJson } from '@/lib/api';
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

function pickInterest(genreIds: number[], interests: InterestId[]): InterestId {
  return (
    interests.find((id) =>
      INTEREST_BY_ID[id].movieGenres.some((genre) => genreIds.includes(genre)),
    ) ?? interests[0]
  );
}

export async function fetchMovieById(
  id: number,
  interests: InterestId[],
): Promise<Movie | null> {
  const apiKey = process.env.EXPO_PUBLIC_TMDB_KEY?.trim();
  if (!apiKey) return null;

  try {
    const movie = await fetchJson<{
      id: number;
      title?: string;
      overview?: string;
      poster_path?: string | null;
      vote_average?: number;
      vote_count?: number;
      genre_ids?: number[];
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
      interest: pickInterest(movie.genre_ids ?? [], interests),
    };
  } catch {
    return null;
  }
}

export async function fetchMovies(interests: InterestId[]): Promise<FeedResult<Movie>> {
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
    new Set(interests.flatMap((id) => INTEREST_BY_ID[id].movieGenres)),
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
