import { makeCustomInterest } from '@/constants/interests';
import { registerCustomInterests } from '@/lib/interest-catalogue';
import { buildLearningPaths } from '@/lib/learning-paths';
import type { SavedNoteRow } from '@/types/models';

const note = (overrides: Partial<SavedNoteRow> = {}): SavedNoteRow => ({
  id: 'note-1',
  title: 'A thought worth keeping',
  body: 'Some details',
  url: 'https://example.com',
  interest_tag: 'geek',
  created_at: '2026-11-24T10:00:00.000Z',
  updated_at: '2026-11-24T10:00:00.000Z',
  ...overrides,
});

const base = {
  interests: ['geek'],
  articles: [],
  movies: [],
  finds: [],
  progress: {},
};

describe('buildLearningPaths with personal notes', () => {
  afterEach(() => registerCustomInterests([]));

  it('turns two notes into a path with note steps', () => {
    const paths = buildLearningPaths({
      ...base,
      notes: [note(), note({ id: 'note-2', title: 'Another thought' })],
    });

    expect(paths).toHaveLength(1);
    expect(paths[0].steps).toHaveLength(2);
    expect(paths[0].steps[0]).toMatchObject({
      kind: 'note',
      title: 'A thought worth keeping',
      url: 'https://example.com',
    });
  });

  it('reads completion from progress keys', () => {
    const paths = buildLearningPaths({
      ...base,
      notes: [note(), note({ id: 'note-2', title: 'Another thought' })],
      progress: { 'note:note-2': true },
    });

    expect(paths[0].completed).toBe(1);
    expect(paths[0].steps[1].done).toBe(true);
  });

  it('supports user-created topics and their labels', () => {
    registerCustomInterests([
      makeCustomInterest({ id: 'custom-watches', label: 'Vintage watches' }),
    ]);
    const paths = buildLearningPaths({
      interests: ['custom-watches'],
      articles: [],
      movies: [],
      finds: [],
      notes: [
        note({ id: 'n1', interest_tag: 'custom-watches' }),
        note({ id: 'n2', interest_tag: 'custom-watches' }),
      ],
      progress: {},
    });

    expect(paths[0].title).toBe('Vintage watches path');
    expect(paths[0].steps).toHaveLength(2);
  });
});
