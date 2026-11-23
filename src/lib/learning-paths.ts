import {
  INTEREST_BY_ID,
  INTEREST_IDS,
  isInterestId,
  type InterestId,
} from '@/constants/interests';
import { DEMO_DISCOVERY, DEMO_MOVIES, DEMO_NEWS } from '@/data/demo';
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
  isSample: boolean;
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

/** Ordered, deterministic paths built from saved content (or curated samples when empty). */
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

  const hasSavedContent = grouped.size > 0;

  if (!hasSavedContent) {
    for (const interest of interests) {
      for (const article of DEMO_NEWS.filter((item) => item.interest === interest).slice(0, 2)) {
        const key = `demo-article:${article.id}`;
        add(interest, {
          key,
          kind: 'article',
          title: article.title,
          subtitle: `${article.source} · sample article`,
          url: article.url,
          interest,
          done: Boolean(progress[key]),
        });
      }
      for (const movie of DEMO_MOVIES.filter((item) => item.interest === interest).slice(0, 1)) {
        const key = `demo-movie:${movie.id}`;
        add(interest, {
          key,
          kind: 'movie',
          title: movie.title,
          subtitle: 'Film · sample pick',
          interest,
          done: Boolean(progress[key]),
        });
      }
      for (const find of DEMO_DISCOVERY.filter((item) => item.interest === interest).slice(0, 1)) {
        const key = `demo-find:${find.id}`;
        add(interest, {
          key,
          kind: 'find',
          title: find.title,
          subtitle: `${find.source} · sample find`,
          url: find.url,
          interest,
          done: Boolean(progress[key]),
        });
      }
    }
  }

  return INTEREST_IDS.filter((id) => interests.includes(id))
    .map((id): LearningPath => {
      const steps = (grouped.get(id) ?? []).slice(0, 8);
      return {
        id,
        interest: id,
        title: `${INTEREST_BY_ID[id].label} path`,
        description: hasSavedContent
          ? 'Built from the items you saved for later.'
          : 'Sample path — save items in this topic to make it yours.',
        steps,
        completed: steps.filter((step) => step.done).length,
        total: steps.length,
        isSample: !hasSavedContent,
      };
    })
    .filter((path) => path.steps.length >= 2);
}
