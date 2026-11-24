import { buildCapsuleText } from '@/lib/capsule';

describe('buildCapsuleText', () => {
  const base = {
    date: '24 November 2026',
    interestLabels: ['CIA', 'Geek Culture'],
    articleCount: 3,
    movieCount: 2,
    findCount: 1,
    noteCount: 4,
    reflectionCount: 5,
    topTopics: ['CIA'],
  };

  it('includes personal notes in the snapshot', () => {
    expect(buildCapsuleText(base)).toContain('4 of your own notes');
  });

  it('keeps reflection text out unless explicitly included', () => {
    const without = buildCapsuleText(base);
    expect(without).not.toContain('My private thought');

    const withReflections = buildCapsuleText({
      ...base,
      reflections: ['My private thought'],
    });
    expect(withReflections).toContain('My private thought');
  });
});
