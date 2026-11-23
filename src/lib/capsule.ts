import { truncate } from '@/lib/format';

export type CapsuleData = {
  date: string;
  interestLabels: string[];
  articleCount: number;
  movieCount: number;
  findCount: number;
  reflectionCount: number;
  topTopics: string[];
  reflections?: string[];
};

/** Build the shareable text snapshot. Reflection text is opt-in. */
export function buildCapsuleText(data: CapsuleData): string {
  const lines = [
    `InterestLoop time capsule — ${data.date}`,
    '',
    `Interests: ${data.interestLabels.length > 0 ? data.interestLabels.join(', ') : 'still choosing'}`,
    `Saved this year: ${data.articleCount} articles · ${data.movieCount} movies · ${data.findCount} finds`,
    `Top topics: ${data.topTopics.length > 0 ? data.topTopics.join(', ') : 'exploring'}`,
    `Mindset reflections recorded: ${data.reflectionCount}`,
  ];

  if (data.reflections && data.reflections.length > 0) {
    lines.push('', 'Reflections:');
    for (const reflection of data.reflections.slice(0, 3)) {
      lines.push(`• ${truncate(reflection, 140)}`);
    }
  }

  lines.push('', 'Made with InterestLoop');
  return lines.join('\n');
}
