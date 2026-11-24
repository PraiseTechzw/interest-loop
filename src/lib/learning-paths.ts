import { getInterest } from '@/lib/interest-catalogue';
import type {
  SavedArticleRow,
  SavedDiscoveryRow,
  SavedMovieRow,
  SavedNoteRow,
} from '@/types/models';

export type StepKind = 'article' | 'movie' | 'find' | 'note';

export type PathStep = {
  key: string;
  kind: StepKind;
  title: string;
  subtitle: string;
  url?: string;
  interest: string;
  done: boolean;
};

export type LearningPath = {
  id: string;
  interest: string;
  title: string;
  description: string;
  steps: PathStep[];
  completed: number;
  total: number;
};

type Input = {
  interests: string[];
  articles: SavedArticleRow[];
  movies: SavedMovieRow[];
  finds: SavedDiscoveryRow[];
  notes: SavedNoteRow[];
  progress: Record<string, boolean>;
};

function interestForMovie(genre: string, interests: string[]): string {
  const genreIds = genre.split(',').filter(Boolean).map(Number);
  return (
    interests.find((id) =>
      getInterest(id).movieGenres.some((movieGenre) => genreIds.includes(movieGenre)),
    ) ?? interests[0]
  );
}

/** Deterministic paths built only from content the user has actually saved. */
export function buildLearningPaths({
  interests,
  articles,
  movies,
  finds,
  notes,
  progress,
}: Input): LearningPath[] {
  const grouped = new Map<string, PathStep[]>();
  const add = (interest: string, step: PathStep) => {
    const existing = grouped.get(interest) ?? [];
    existing.push(step);
    grouped.set(interest, existing);
  };

  for (const article of articles) {
    const interest = article.interest_tag || 'geek';
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
    const interest = find.interest_tag || 'problem-solving';
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

  for (const note of notes) {
    const interest = note.interest_tag || interests[0] || 'geek';
    add(interest, {
      key: `note:${note.id}`,
      kind: 'note',
      title: note.title,
      subtitle: 'Your note',
      url: note.url || undefined,
      interest,
      done: Boolean(progress[`note:${note.id}`]),
    });
  }

  return Array.from(new Set(interests))
    .map((id): LearningPath => {
      const steps = (grouped.get(id) ?? []).slice(0, 8);
      return {
        id,
        interest: id,
        title: `${getInterest(id).label} path`,
        description: 'Built from the items you saved for later.',
        steps,
        completed: steps.filter((step) => step.done).length,
        total: steps.length,
      };
    })
    .filter((path) => path.steps.length >= 2);
}
