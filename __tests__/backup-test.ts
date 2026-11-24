import { parseBackup } from '@/lib/database';

describe('parseBackup', () => {
  it('rejects invalid JSON and foreign files', () => {
    expect(() => parseBackup('not json')).toThrow(/valid JSON/);
    expect(() => parseBackup('{"hello":"world"}')).toThrow(/InterestLoop backup/);
    expect(() => parseBackup('{"app":"interest-loop"}')).toThrow(/InterestLoop backup/);
  });

  it('accepts a well-formed backup and keeps its content', () => {
    const payload = {
      app: 'interest-loop',
      version: 1,
      exportedAt: '2026-11-24T10:00:00.000Z',
      interests: ['ci', 'custom-1'],
      customInterests: [
        {
          id: 'custom-1',
          label: 'Vintage watches',
          short: 'Vintage watches',
          color: '#123456',
          icon: 'star-outline',
          newsQuery: 'watch',
          movieGenres: [],
          blurb: '',
          custom: true,
        },
      ],
      profile: { name: 'Me', bio: 'Curious' },
      savedArticles: [],
      savedMovies: [],
      savedDiscovery: [],
      savedNotes: [
        {
          id: 'note-1',
          title: 'An idea',
          body: 'Remember this',
          url: '',
          interest_tag: 'custom-1',
          created_at: '2026-11-24T10:00:00.000Z',
          updated_at: '2026-11-24T10:00:00.000Z',
        },
      ],
      prompts: [],
      reflections: [],
      learningProgress: {},
      capsules: [],
      feedback: [],
    };

    expect(parseBackup(JSON.stringify(payload))).toEqual(payload);
  });

  it('accepts a backup exported before the app marker existed', () => {
    const legacy = {
      interests: ['ci', 'geek'],
      profile: { name: 'Me', bio: '' },
      savedArticles: [],
    };
    expect(parseBackup(JSON.stringify(legacy))).toMatchObject({
      app: 'interest-loop',
      interests: ['ci', 'geek'],
    });
  });

  it('rejects a backup with a malformed list field', () => {
    const payload = {
      app: 'interest-loop',
      interests: ['ci'],
      savedNotes: 'not a list',
    };
    expect(() => parseBackup(JSON.stringify(payload))).toThrow(/savedNotes/);
  });
});
