import * as SQLite from 'expo-sqlite';

import { DEFAULT_INTERESTS, isInterestId, type InterestId } from '@/constants/interests';
import type {
  CoachResponse,
  DiscoveryItem,
  InterestRow,
  Movie,
  NewsArticle,
  PromptCategory,
  SavedArticleRow,
  SavedDiscoveryRow,
  SavedMovieRow,
} from '@/types/models';

export type Database = SQLite.SQLiteDatabase;
export const DATABASE_NAME = 'interest_loop.db';
const SCHEMA_VERSION = 1;

/** Migrations run once per database version inside SQLiteProvider's onInit. */
export async function migrateDatabase(db: Database): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  if ((row?.user_version ?? 0) >= SCHEMA_VERSION) return;

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS user_interests (
      tag TEXT PRIMARY KEY,
      selected_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS saved_articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT '',
      image_url TEXT,
      interest_tag TEXT NOT NULL,
      saved_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS saved_movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tmdb_id INTEGER NOT NULL UNIQUE,
      title TEXT NOT NULL,
      overview TEXT NOT NULL DEFAULT '',
      poster_path TEXT,
      vote_average REAL NOT NULL DEFAULT 0,
      genre TEXT NOT NULL DEFAULT '',
      saved_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS saved_discovery (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      excerpt TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT '',
      score INTEGER NOT NULL DEFAULT 0,
      saved_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS coach_responses (
      prompt_id TEXT PRIMARY KEY,
      response TEXT NOT NULL,
      category TEXT NOT NULL,
      review_count INTEGER NOT NULL DEFAULT 0,
      interval_days INTEGER NOT NULL DEFAULT 1,
      next_review_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_articles_interest ON saved_articles(interest_tag);
    CREATE INDEX IF NOT EXISTS idx_coach_next_review ON coach_responses(next_review_at);
  `);

  for (const tag of DEFAULT_INTERESTS) {
    await db.runAsync('INSERT OR IGNORE INTO user_interests (tag) VALUES (?)', tag);
  }

  await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
}

// -- Interests ---------------------------------------------------------------

export async function getInterests(db: Database): Promise<InterestId[]> {
  const rows = await db.getAllAsync<InterestRow>(
    'SELECT tag FROM user_interests ORDER BY selected_at ASC',
  );
  return rows.map((row) => row.tag).filter(isInterestId);
}

export async function setInterest(
  db: Database,
  tag: InterestId,
  selected: boolean,
): Promise<void> {
  if (selected) {
    await db.runAsync('INSERT OR IGNORE INTO user_interests (tag) VALUES (?)', tag);
  } else {
    await db.runAsync('DELETE FROM user_interests WHERE tag = ?', tag);
  }
}

// -- Saved articles ----------------------------------------------------------

export async function getSavedArticles(db: Database): Promise<SavedArticleRow[]> {
  return db.getAllAsync<SavedArticleRow>(
    'SELECT * FROM saved_articles ORDER BY saved_at DESC',
  );
}

export async function saveArticle(db: Database, article: NewsArticle): Promise<void> {
  await db.runAsync(
    `INSERT INTO saved_articles (title, url, description, source, image_url, interest_tag)
     VALUES ($title, $url, $description, $source, $imageUrl, $interest)
     ON CONFLICT(url) DO UPDATE SET
       title = excluded.title,
       description = excluded.description,
       source = excluded.source,
       image_url = excluded.image_url,
       interest_tag = excluded.interest_tag`,
    {
      $title: article.title,
      $url: article.url,
      $description: article.description,
      $source: article.source,
      $imageUrl: article.imageUrl ?? null,
      $interest: article.interest,
    },
  );
}

export async function removeArticle(db: Database, url: string): Promise<void> {
  await db.runAsync('DELETE FROM saved_articles WHERE url = ?', url);
}

// -- Saved movies ------------------------------------------------------------

export async function getSavedMovies(db: Database): Promise<SavedMovieRow[]> {
  return db.getAllAsync<SavedMovieRow>(
    'SELECT * FROM saved_movies ORDER BY saved_at DESC',
  );
}

export async function saveMovie(db: Database, movie: Movie): Promise<void> {
  await db.runAsync(
    `INSERT INTO saved_movies (tmdb_id, title, overview, poster_path, vote_average, genre)
     VALUES ($tmdbId, $title, $overview, $posterPath, $voteAverage, $genre)
     ON CONFLICT(tmdb_id) DO UPDATE SET
       title = excluded.title,
       overview = excluded.overview,
       poster_path = excluded.poster_path,
       vote_average = excluded.vote_average,
       genre = excluded.genre`,
    {
      $tmdbId: movie.id,
      $title: movie.title,
      $overview: movie.overview,
      $posterPath: movie.posterPath,
      $voteAverage: movie.rating,
      $genre: movie.genreIds.join(','),
    },
  );
}

export async function removeMovie(db: Database, tmdbId: number): Promise<void> {
  await db.runAsync('DELETE FROM saved_movies WHERE tmdb_id = ?', tmdbId);
}

// -- Saved discoveries -------------------------------------------------------

export async function getSavedDiscovery(db: Database): Promise<SavedDiscoveryRow[]> {
  return db.getAllAsync<SavedDiscoveryRow>(
    'SELECT * FROM saved_discovery ORDER BY saved_at DESC',
  );
}

export async function saveDiscovery(db: Database, item: DiscoveryItem): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO saved_discovery (id, title, url, excerpt, source, score)
     VALUES ($id, $title, $url, $excerpt, $source, $score)`,
    {
      $id: item.id,
      $title: item.title,
      $url: item.url,
      $excerpt: item.excerpt,
      $source: item.source,
      $score: item.score,
    },
  );
}

export async function removeDiscovery(db: Database, id: string): Promise<void> {
  await db.runAsync('DELETE FROM saved_discovery WHERE id = ?', id);
}

// -- Coach responses (simplified spaced repetition) --------------------------

export async function getCoachResponses(db: Database): Promise<CoachResponse[]> {
  const rows = await db.getAllAsync<{
    prompt_id: string;
    response: string;
    category: string;
    review_count: number;
    interval_days: number;
    next_review_at: string;
    updated_at: string;
  }>('SELECT * FROM coach_responses ORDER BY updated_at DESC');

  return rows.map((row) => ({
    promptId: row.prompt_id,
    response: row.response,
    category: row.category as PromptCategory,
    reviewCount: row.review_count,
    intervalDays: row.interval_days,
    nextReviewAt: row.next_review_at,
    updatedAt: row.updated_at,
  }));
}

export async function saveCoachResponse(
  db: Database,
  input: { promptId: string; response: string; category: PromptCategory },
): Promise<void> {
  await db.runAsync(
    `INSERT INTO coach_responses (prompt_id, response, category, review_count, interval_days, next_review_at)
     VALUES ($promptId, $response, $category, 0, 1, datetime('now', '+1 day'))
     ON CONFLICT(prompt_id) DO UPDATE SET
       response = excluded.response,
       category = excluded.category,
       review_count = 0,
       interval_days = 1,
       next_review_at = datetime('now', '+1 day'),
       updated_at = CURRENT_TIMESTAMP`,
    {
      $promptId: input.promptId,
      $response: input.response,
      $category: input.category,
    },
  );
}

/** `again` resets the interval; otherwise it grows, capped at 60 days. */
export async function reviewCoachResponse(
  db: Database,
  promptId: string,
  again: boolean,
): Promise<void> {
  await db.runAsync(
    `UPDATE coach_responses
     SET review_count = review_count + 1,
         interval_days = CASE
           WHEN ? = 1 THEN 1
           ELSE MIN(60, interval_days * 2)
         END,
         next_review_at = datetime('now', CASE
           WHEN ? = 1 THEN '+1 day'
           ELSE '+' || MIN(60, interval_days * 2) || ' days'
         END),
         updated_at = CURRENT_TIMESTAMP
     WHERE prompt_id = ?`,
    [again ? 1 : 0, again ? 1 : 0, promptId],
  );
}

export async function deleteCoachResponse(db: Database, promptId: string): Promise<void> {
  await db.runAsync('DELETE FROM coach_responses WHERE prompt_id = ?', promptId);
}

// -- Graph aggregation -------------------------------------------------------

export async function getInterestActivity(
  db: Database,
): Promise<Record<string, number>> {
  const articleRows = await db.getAllAsync<{ interest_tag: string; count: number }>(
    'SELECT interest_tag, COUNT(*) AS count FROM saved_articles GROUP BY interest_tag',
  );
  const counts: Record<string, number> = {};
  for (const row of articleRows) {
    counts[row.interest_tag] = (counts[row.interest_tag] ?? 0) + row.count;
  }
  return counts;
}
