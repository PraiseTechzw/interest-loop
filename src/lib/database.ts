import * as SQLite from 'expo-sqlite';

import {
  DEFAULT_INTERESTS,
  type Interest,
} from '@/constants/interests';
import { listInterests, toStoredInterest } from '@/lib/interest-catalogue';
import type {
  CoachResponse,
  DiscoveryItem,
  FeedbackEntry,
  InterestRow,
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

export type Database = SQLite.SQLiteDatabase;
export const DATABASE_NAME = 'interest_loop.db';
const SCHEMA_VERSION = 9;

/** Migrations run once per database version inside SQLiteProvider's onInit. */
export async function migrateDatabase(db: Database): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;
  if (currentVersion >= SCHEMA_VERSION) return;

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS user_interests (
      tag TEXT PRIMARY KEY,
      selected_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_profile (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS saved_articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
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
      vote_count INTEGER NOT NULL DEFAULT 0,
      genre TEXT NOT NULL DEFAULT '',
      release_date TEXT NOT NULL DEFAULT '',
      interest_tag TEXT NOT NULL DEFAULT 'geek',
      saved_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS saved_discovery (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      excerpt TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT '',
      score INTEGER NOT NULL DEFAULT 0,
      interest_tag TEXT NOT NULL DEFAULT 'problem-solving',
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

    CREATE TABLE IF NOT EXISTS learning_progress (
      item_key TEXT PRIMARY KEY,
      completed INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS mindset_prompts (
      id TEXT PRIMARY KEY,
      prompt TEXT NOT NULL,
      category TEXT NOT NULL,
      hint TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS capsules (
      id TEXT PRIMARY KEY,
      summary TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS custom_interests (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      color TEXT NOT NULL,
      icon TEXT NOT NULL,
      news_query TEXT NOT NULL,
      movie_genres TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS saved_notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL DEFAULT '',
      url TEXT NOT NULL DEFAULT '',
      interest_tag TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_articles_interest ON saved_articles(interest_tag);
    CREATE INDEX IF NOT EXISTS idx_notes_interest ON saved_notes(interest_tag);
    CREATE INDEX IF NOT EXISTS idx_coach_next_review ON coach_responses(next_review_at);
  `);

  // Full article bodies were previously discarded on save.
  if (currentVersion < 9) {
    const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(saved_articles)');
    if (!columns.some((column) => column.name === 'content')) {
      await db.execAsync(
        "ALTER TABLE saved_articles ADD COLUMN content TEXT NOT NULL DEFAULT ''",
      );
      await db.execAsync('UPDATE saved_articles SET content = description WHERE content = \'\'');
    }
    const movieColumns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(saved_movies)');
    for (const column of ['vote_count', 'release_date', 'interest_tag']) {
      if (!movieColumns.some((item) => item.name === column)) {
        const definition =
          column === 'vote_count'
            ? 'INTEGER NOT NULL DEFAULT 0'
            : "TEXT NOT NULL DEFAULT ''";
        await db.execAsync(`ALTER TABLE saved_movies ADD COLUMN ${column} ${definition}`);
      }
    }
  }

  // v1 databases predate the interest_tag column on saved_discovery.
  if (currentVersion < 2) {
    const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(saved_discovery)');
    if (!columns.some((column) => column.name === 'interest_tag')) {
      await db.execAsync(
        "ALTER TABLE saved_discovery ADD COLUMN interest_tag TEXT NOT NULL DEFAULT 'problem-solving'",
      );
    }
  }

  // Existing users skip onboarding; new databases show it on first launch.
  if (currentVersion > 0 && currentVersion < 6) {
    await db.runAsync(
      "INSERT INTO user_profile (key, value) VALUES ('onboarded', '1') ON CONFLICT(key) DO UPDATE SET value = '1'",
    );
  }

  for (const tag of DEFAULT_INTERESTS) {
    await db.runAsync('INSERT OR IGNORE INTO user_interests (tag) VALUES (?)', tag);
  }

  await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
}

// -- Interests ---------------------------------------------------------------

export async function getInterests(db: Database): Promise<string[]> {
  const rows = await db.getAllAsync<InterestRow>(
    'SELECT tag FROM user_interests ORDER BY selected_at ASC',
  );
  return rows.map((row) => row.tag).filter((tag) => tag.trim().length > 0);
}

export async function setInterest(
  db: Database,
  tag: string,
  selected: boolean,
): Promise<void> {
  if (selected) {
    await db.runAsync('INSERT OR IGNORE INTO user_interests (tag) VALUES (?)', tag);
  } else {
    await db.runAsync('DELETE FROM user_interests WHERE tag = ?', tag);
  }
}

// -- User-created interests ---------------------------------------------------

export async function getCustomInterests(db: Database): Promise<Interest[]> {
  const rows = await db.getAllAsync<{
    id: string;
    label: string;
    color: string;
    icon: string;
    news_query: string;
    movie_genres: string;
  }>('SELECT id, label, color, icon, news_query, movie_genres FROM custom_interests ORDER BY created_at ASC');
  return rows.map(toStoredInterest);
}

export async function addCustomInterest(db: Database, interest: Interest): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO custom_interests
       (id, label, color, icon, news_query, movie_genres)
     VALUES ($id, $label, $color, $icon, $newsQuery, $genres)`,
    {
      $id: interest.id,
      $label: interest.label,
      $color: interest.color,
      $icon: interest.icon,
      $newsQuery: interest.newsQuery,
      $genres: interest.movieGenres.join(','),
    },
  );
}

export async function deleteCustomInterest(db: Database, id: string): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM custom_interests WHERE id = ?', id);
    await db.runAsync('DELETE FROM user_interests WHERE tag = ?', id);
  });
}

// -- Personal notes -----------------------------------------------------------

export async function getSavedNotes(db: Database): Promise<SavedNoteRow[]> {
  return db.getAllAsync<SavedNoteRow>('SELECT * FROM saved_notes ORDER BY updated_at DESC');
}

export async function getSavedNoteById(db: Database, id: string): Promise<SavedNoteRow | null> {
  return db.getFirstAsync<SavedNoteRow>('SELECT * FROM saved_notes WHERE id = ?', id);
}

export async function saveNote(
  db: Database,
  input: { id?: string; title: string; body: string; url: string; interest: string },
): Promise<string> {
  const id = input.id ?? `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await db.runAsync(
    `INSERT INTO saved_notes (id, title, body, url, interest_tag)
     VALUES ($id, $title, $body, $url, $interest)
     ON CONFLICT(id) DO UPDATE SET
       title = excluded.title,
       body = excluded.body,
       url = excluded.url,
       interest_tag = excluded.interest_tag,
       updated_at = CURRENT_TIMESTAMP`,
    {
      $id: id,
      $title: input.title.trim(),
      $body: input.body.trim(),
      $url: input.url.trim(),
      $interest: input.interest,
    },
  );
  return id;
}

export async function removeNote(db: Database, id: string): Promise<void> {
  await db.runAsync('DELETE FROM saved_notes WHERE id = ?', id);
}

// -- Profile -----------------------------------------------------------------

export async function getProfile(db: Database): Promise<UserProfile> {
  const rows = await db.getAllAsync<{ key: string; value: string }>(
    'SELECT key, value FROM user_profile',
  );
  const values = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  return { name: values.name ?? '', bio: values.bio ?? '' };
}

export async function setProfile(db: Database, profile: UserProfile): Promise<void> {
  await db.runAsync(
    `INSERT INTO user_profile (key, value) VALUES ('name', ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    profile.name,
  );
  await db.runAsync(
    `INSERT INTO user_profile (key, value) VALUES ('bio', ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    profile.bio,
  );
}

// -- Saved articles ----------------------------------------------------------

export async function getSavedArticles(db: Database): Promise<SavedArticleRow[]> {
  return db.getAllAsync<SavedArticleRow>(
    'SELECT * FROM saved_articles ORDER BY saved_at DESC',
  );
}

export async function saveArticle(db: Database, article: NewsArticle): Promise<void> {
  await db.runAsync(
    `INSERT INTO saved_articles (title, url, description, content, source, image_url, interest_tag)
     VALUES ($title, $url, $description, $content, $source, $imageUrl, $interest)
     ON CONFLICT(url) DO UPDATE SET
       title = excluded.title,
       description = excluded.description,
       content = excluded.content,
       source = excluded.source,
       image_url = excluded.image_url,
       interest_tag = excluded.interest_tag`,
    {
      $title: article.title,
      $url: article.url,
      $description: article.description,
      $content: article.content ?? article.description,
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
    `INSERT INTO saved_movies (tmdb_id, title, overview, poster_path, vote_average, vote_count, genre, release_date, interest_tag)
     VALUES ($tmdbId, $title, $overview, $posterPath, $voteAverage, $voteCount, $genre, $releaseDate, $interest)
     ON CONFLICT(tmdb_id) DO UPDATE SET
       title = excluded.title,
       overview = excluded.overview,
       poster_path = excluded.poster_path,
       vote_average = excluded.vote_average,
       vote_count = excluded.vote_count,
       genre = excluded.genre,
       release_date = excluded.release_date,
       interest_tag = excluded.interest_tag`,
    {
      $tmdbId: movie.id,
      $title: movie.title,
      $overview: movie.overview,
      $posterPath: movie.posterPath,
      $voteAverage: movie.rating,
      $voteCount: movie.voteCount,
      $genre: movie.genreIds.join(','),
      $releaseDate: movie.releaseDate,
      $interest: movie.interest,
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
    `INSERT OR REPLACE INTO saved_discovery (id, title, url, excerpt, source, score, interest_tag)
     VALUES ($id, $title, $url, $excerpt, $source, $score, $interest)`,
    {
      $id: item.id,
      $title: item.title,
      $url: item.url,
      $excerpt: item.excerpt,
      $source: item.source,
      $score: item.score,
      $interest: item.interest,
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
  const counts: Record<string, number> = {};

  const [articles, movies, finds, notes] = await Promise.all([
    db.getAllAsync<{ interest_tag: string }>('SELECT interest_tag FROM saved_articles'),
    db.getAllAsync<{ genre: string }>('SELECT genre FROM saved_movies'),
    db.getAllAsync<{ interest_tag: string }>('SELECT interest_tag FROM saved_discovery'),
    db.getAllAsync<{ interest_tag: string }>('SELECT interest_tag FROM saved_notes'),
  ]);

  for (const row of [...articles, ...finds, ...notes]) {
    if (row.interest_tag) {
      counts[row.interest_tag] = (counts[row.interest_tag] ?? 0) + 1;
    }
  }

  for (const movie of movies) {
    const genreIds = movie.genre.split(',').filter(Boolean).map(Number);
    const interest = listInterests().find((candidate) =>
      candidate.movieGenres.some((genre) => genreIds.includes(genre)),
    );
    if (interest) counts[interest.id] = (counts[interest.id] ?? 0) + 1;
  }

  return counts;
}

// -- User-created mindset prompts --------------------------------------------

export async function getMindsetPrompts(db: Database): Promise<MindsetPrompt[]> {
  const rows = await db.getAllAsync<{
    id: string;
    prompt: string;
    category: string;
    hint: string;
  }>('SELECT id, prompt, category, hint FROM mindset_prompts ORDER BY created_at DESC');

  return rows.map((row) => ({
    id: row.id,
    prompt: row.prompt,
    category: row.category as PromptCategory,
    hint: row.hint,
  }));
}

export async function addMindsetPrompt(
  db: Database,
  input: { id: string; prompt: string; category: PromptCategory; hint: string },
): Promise<void> {
  await db.runAsync(
    'INSERT OR REPLACE INTO mindset_prompts (id, prompt, category, hint) VALUES ($id, $prompt, $category, $hint)',
    {
      $id: input.id,
      $prompt: input.prompt,
      $category: input.category,
      $hint: input.hint,
    },
  );
}

export async function deleteMindsetPrompt(db: Database, id: string): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM coach_responses WHERE prompt_id = ?', id);
    await db.runAsync('DELETE FROM mindset_prompts WHERE id = ?', id);
  });
}

// -- Learning paths ----------------------------------------------------------

export async function getLearningProgress(db: Database): Promise<Record<string, boolean>> {
  const rows = await db.getAllAsync<{ item_key: string; completed: number }>(
    'SELECT item_key, completed FROM learning_progress',
  );
  return Object.fromEntries(rows.map((row) => [row.item_key, row.completed === 1]));
}

export async function setLearningProgress(
  db: Database,
  itemKey: string,
  completed: boolean,
): Promise<void> {
  await db.runAsync(
    `INSERT INTO learning_progress (item_key, completed)
     VALUES ($key, $completed)
     ON CONFLICT(item_key) DO UPDATE SET
       completed = excluded.completed,
       updated_at = CURRENT_TIMESTAMP`,
    { $key: itemKey, $completed: completed ? 1 : 0 },
  );
}

export async function resetLearningProgress(db: Database, prefix: string): Promise<void> {
  await db.runAsync('DELETE FROM learning_progress WHERE item_key LIKE ?', [`${prefix}%`]);
}

/** Clears user content but keeps selected interests. Used by Settings → Clear local data. */
export async function clearUserData(db: Database): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM saved_articles');
    await db.runAsync('DELETE FROM saved_movies');
    await db.runAsync('DELETE FROM saved_discovery');
    await db.runAsync('DELETE FROM saved_notes');
    await db.runAsync('DELETE FROM coach_responses');
    await db.runAsync('DELETE FROM learning_progress');
    await db.runAsync('DELETE FROM mindset_prompts');
  });
}

// -- Generic settings (onboarding flag, etc.) --------------------------------

export async function getSetting(db: Database, key: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM user_profile WHERE key = ?',
    key,
  );
  return row?.value ?? null;
}

export async function setSetting(db: Database, key: string, value: string): Promise<void> {
  await db.runAsync(
    'INSERT INTO user_profile (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, value],
  );
}

// -- Detail lookups ----------------------------------------------------------

export async function getSavedArticleByUrl(
  db: Database,
  url: string,
): Promise<SavedArticleRow | null> {
  return db.getFirstAsync<SavedArticleRow>('SELECT * FROM saved_articles WHERE url = ?', url);
}

export async function getSavedMovieById(
  db: Database,
  tmdbId: number,
): Promise<SavedMovieRow | null> {
  return db.getFirstAsync<SavedMovieRow>('SELECT * FROM saved_movies WHERE tmdb_id = ?', tmdbId);
}

// -- Feedback ----------------------------------------------------------------

export async function getFeedback(db: Database): Promise<FeedbackEntry[]> {
  return db.getAllAsync<FeedbackEntry>('SELECT * FROM feedback ORDER BY created_at DESC');
}

export async function addFeedback(
  db: Database,
  input: { category: string; message: string },
): Promise<void> {
  await db.runAsync('INSERT INTO feedback (category, message) VALUES (?, ?)', [
    input.category,
    input.message,
  ]);
}

// -- Saved capsules ----------------------------------------------------------

export async function getCapsules(db: Database): Promise<SavedCapsule[]> {
  return db.getAllAsync<SavedCapsule>('SELECT * FROM capsules ORDER BY created_at DESC');
}

export async function saveCapsule(db: Database, summary: string): Promise<string> {
  const id = `capsule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await db.runAsync('INSERT INTO capsules (id, summary) VALUES (?, ?)', [id, summary]);
  return id;
}

export async function deleteCapsule(db: Database, id: string): Promise<void> {
  await db.runAsync('DELETE FROM capsules WHERE id = ?', id);
}

// -- Backup and restore -------------------------------------------------------

export async function exportUserData(db: Database) {
  const [
    interests,
    customInterests,
    profile,
    articles,
    movies,
    finds,
    notes,
    prompts,
    responses,
    progress,
    capsules,
    feedback,
  ] = await Promise.all([
    getInterests(db),
    getCustomInterests(db),
    getProfile(db),
    getSavedArticles(db),
    getSavedMovies(db),
    getSavedDiscovery(db),
    getSavedNotes(db),
    getMindsetPrompts(db),
    getCoachResponses(db),
    getLearningProgress(db),
    getCapsules(db),
    getFeedback(db),
  ]);

  return {
    app: 'interest-loop',
    version: 1,
    exportedAt: new Date().toISOString(),
    interests,
    customInterests,
    profile,
    savedArticles: articles,
    savedMovies: movies,
    savedDiscovery: finds,
    savedNotes: notes,
    prompts,
    reflections: responses,
    learningProgress: progress,
    capsules,
    feedback,
  };
}

export type UserDataBackup = Awaited<ReturnType<typeof exportUserData>>;

/** Parse and lightly validate a backup before touching the database. */
export function parseBackup(text: string): UserDataBackup {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('That is not valid JSON.');
  }
  if (!raw || typeof raw !== 'object') throw new Error('That file is not an InterestLoop backup.');
  const data = raw as Partial<UserDataBackup>;
  // Backups exported before v1.5 have no `app` marker — accept them too.
  const isLegacy = data.app === undefined && Array.isArray(data.interests);
  if ((data.app !== 'interest-loop' && !isLegacy) || !Array.isArray(data.interests)) {
    throw new Error('That file is not an InterestLoop backup.');
  }
  const listFields = [
    'customInterests',
    'savedArticles',
    'savedMovies',
    'savedDiscovery',
    'savedNotes',
    'prompts',
    'reflections',
    'capsules',
    'feedback',
  ] as const;
  for (const field of listFields) {
    if (data[field] !== undefined && !Array.isArray(data[field])) {
      throw new Error(`Backup field ${field} is invalid.`);
    }
  }
  if (data.learningProgress && typeof data.learningProgress !== 'object') {
    throw new Error('Backup field learningProgress is invalid.');
  }
  return { app: 'interest-loop', version: 1, ...data } as UserDataBackup;
}

/** Replaces all local data with the contents of a backup. Runs atomically. */
export async function importUserData(db: Database, backup: UserDataBackup): Promise<void> {
  const interests = (backup.interests ?? []).filter(
    (tag): tag is string => typeof tag === 'string' && tag.length > 0,
  );
  const custom = backup.customInterests ?? [];
  const profile = backup.profile ?? { name: '', bio: '' };
  const articles = backup.savedArticles ?? [];
  const movies = backup.savedMovies ?? [];
  const finds = backup.savedDiscovery ?? [];
  const notes = backup.savedNotes ?? [];
  const prompts = backup.prompts ?? [];
  const reflections = backup.reflections ?? [];
  const progress = backup.learningProgress ?? {};
  const capsules = backup.capsules ?? [];
  const feedback = backup.feedback ?? [];

  await db.withTransactionAsync(async () => {
    for (const table of [
      'user_interests',
      'custom_interests',
      'saved_articles',
      'saved_movies',
      'saved_discovery',
      'saved_notes',
      'mindset_prompts',
      'coach_responses',
      'learning_progress',
      'capsules',
      'feedback',
    ]) {
      await db.runAsync(`DELETE FROM ${table}`);
    }

    for (const tag of interests) {
      await db.runAsync('INSERT OR IGNORE INTO user_interests (tag) VALUES (?)', tag);
    }
    for (const interest of custom) {
      const meta = toStoredInterest({
        id: interest.id,
        label: interest.label,
        color: interest.color ?? null,
        icon: interest.icon ?? null,
        news_query: interest.newsQuery ?? null,
        movie_genres: interest.movieGenres?.join(',') ?? null,
      });
      await db.runAsync(
        `INSERT OR REPLACE INTO custom_interests
           (id, label, color, icon, news_query, movie_genres)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [meta.id, meta.label, meta.color, meta.icon, meta.newsQuery, meta.movieGenres.join(',')],
      );
    }

    await setProfile(db, { name: profile.name ?? '', bio: profile.bio ?? '' });

    for (const article of articles) {
      await saveArticle(db, {
        id: article.url,
        title: article.title,
        description: article.description ?? '',
        url: article.url,
        source: article.source ?? '',
        imageUrl: article.image_url ?? null,
        publishedAt: article.saved_at ?? new Date().toISOString(),
        interest: article.interest_tag || 'geek',
      });
    }
    for (const movie of movies) {
      await saveMovie(db, {
        id: movie.tmdb_id,
        title: movie.title,
        overview: movie.overview ?? '',
        posterPath: movie.poster_path ?? null,
        rating: movie.vote_average ?? 0,
        voteCount: 0,
        genreIds: (movie.genre ?? '').split(',').filter(Boolean).map(Number),
        releaseDate: '',
        interest: 'geek',
      });
    }
    for (const find of finds) {
      await saveDiscovery(db, {
        id: find.id,
        title: find.title,
        url: find.url,
        excerpt: find.excerpt ?? '',
        source: find.source === 'reddit' || find.source === 'hacker-news' ? find.source : 'curated',
        score: find.score ?? 0,
        age: '',
        type: 'article',
        interest: find.interest_tag || 'problem-solving',
      });
    }
    for (const note of notes) {
      await saveNote(db, {
        id: note.id,
        title: note.title,
        body: note.body ?? '',
        url: note.url ?? '',
        interest: note.interest_tag || (interests[0] ?? 'geek'),
      });
    }
    for (const prompt of prompts) {
      await addMindsetPrompt(db, prompt);
    }
    for (const response of reflections) {
      await saveCoachResponse(db, response);
    }
    for (const [key, done] of Object.entries(progress)) {
      if (done) await setLearningProgress(db, key, true);
    }
    for (const capsule of capsules) {
      await db.runAsync(
        'INSERT OR REPLACE INTO capsules (id, summary, created_at) VALUES (?, ?, ?)',
        [capsule.id, capsule.summary, capsule.created_at ?? new Date().toISOString()],
      );
    }
    for (const entry of feedback) {
      await db.runAsync(
        'INSERT INTO feedback (category, message, created_at) VALUES (?, ?, ?)',
        [entry.category, entry.message, entry.created_at ?? new Date().toISOString()],
      );
    }
  });
}