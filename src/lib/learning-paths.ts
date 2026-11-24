import {
  INTEREST_BY_ID,
  INTEREST_IDS,
  isInterestId,
  type InterestId,
} from '@/constants/interests';
import type { SavedArticleRow, SavedDiscoveryRow, SavedMovieRow } from '@/types/models';

export type StepKind = 'article' | 'movie' | 'find';

export type PathStep = {
  key: string;
  kind: StepKind;
  title: string;
  subtitle: string;
  url?: string;
  interest: InterestId;
  done: boolean;
};

export type LearningPath = {
  id: string;
  interest: InterestId;
  title: string;
  description: string;
  steps: PathStep[];
  completed: number;
  total: number;
};

type Input = {
  interests: InterestId[];
  articles: SavedArticleRow[];
  movies: SavedMovieRow[];
  finds: SavedDiscoveryRow[];
  progress: Record<string, boolean>;
};

function interestForMovie(genre: string, interests: InterestId[]): InterestId {
  const genreIds = genre.split(',').filter(Boolean).map(Number);
  return (
    interests.find((id) =>
      INTEREST_BY_ID[id].movieGenres.some((movieGenre) => genreIds.includes(movieGenre)),
    ) ?? interests[0]
  );
}

/** Deterministic paths built only from content the user has actually saved. */
export function buildLearningPaths({
  interests,
  articles,
  movies,
  finds,
  progress,
}: Input): LearningPath[] {
  const grouped = new Map<InterestId, PathStep[]>();
  const add = (interest: InterestId, step: PathStep) => {
    const existing = grouped.get(interest) ?? [];
    existing.push(step);
    grouped.set(interest, existing);
  };

  for (const article of articles) {
    const interest = isInterestId(article.interest_tag) ? article.interest_tag : 'geek';
    add(interest, {
      key: `article:${article.url}`,
      kind: 'article',
      title: article.title,
      subtitle: `${article.source} · article`,
      url: article.url,
      interest,
      done: Boolean(progress[`article:${article.url}`]),
    });
  }

  for (const movie of movies) {
    const interest = interestForMovie(movie.genre, interests);
    add(interest, {
      key: `movie:${movie.tmdb_id}`,
      kind: 'movie',
      title: movie.title,
      subtitle: `Film · ${movie.vote_average.toFixed(1)} rating`,
      interest,
      done: Boolean(progress[`movie:${movie.tmdb_id}`]),
    });
  }

  for (const find of finds) {
    const interest = isInterestId(find.interest_tag) ? find.interest_tag : 'problem-solving';
    add(interest, {
      key: `find:${find.id}`,
      kind: 'find',
      title: find.title,
      subtitle: `${find.source} · discovery`,
      url: find.url,
      interest,
      done: Boolean(progress[`find:${find.id}`]),
    });
  }

  return INTEREST_IDS.filter((id) => interests.includes(id))
    .map((id): LearningPath => {
      const steps = (grouped.get(id) ?? []).slice(0, 8);
      return {
        id,
        interest: id,
        title: `${INTEREST_BY_ID[id].label} path`,
        description: 'Built from the items you saved for later.',
        steps,
        completed: steps.filter((step) => step.done).length,
        total: steps.length,
      };
    })
    .filter((path) => path.steps.length >= 2);
}
