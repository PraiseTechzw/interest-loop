import type { Ionicons } from '@expo/vector-icons';

export const INTERESTS = [
  {
    id: 'ci',
    label: 'CIA & Intelligence',
    short: 'CIA',
    color: '#5B4FE9',
    icon: 'shield-outline' as keyof typeof Ionicons.glyphMap,
    newsQuery: 'CIA OR intelligence OR espionage',
    movieGenres: [28, 53],
    blurb: ' tradecraft, spy thrillers and intelligence history',
  },
  {
    id: 'mi6',
    label: 'MI6 & Secret Service',
    short: 'MI6',
    color: '#2F6FED',
    icon: 'radio-outline' as keyof typeof Ionicons.glyphMap,
    newsQuery: 'MI6 OR "secret service" OR espionage',
    movieGenres: [28, 53],
    blurb: ' secret service stories and Cold War intrigue',
  },
  {
    id: 'geek',
    label: 'Geek Culture',
    short: 'Geek',
    color: '#7B52D8',
    icon: 'game-controller-outline' as keyof typeof Ionicons.glyphMap,
    newsQuery: 'technology OR gaming OR "open source"',
    movieGenres: [35, 878],
    blurb: ' tech, gaming and cult classics',
  },
  {
    id: 'romance',
    label: 'Romance',
    short: 'Romance',
    color: '#E75480',
    icon: 'heart-outline' as keyof typeof Ionicons.glyphMap,
    newsQuery: 'romance OR relationships OR love',
    movieGenres: [10749],
    blurb: ' love stories and relationship insights',
  },
  {
    id: '3d',
    label: '3D & Animation',
    short: '3D',
    color: '#F08A24',
    icon: 'cube-outline' as keyof typeof Ionicons.glyphMap,
    newsQuery: '3D OR animation OR "computer graphics"',
    movieGenres: [878, 16],
    blurb: ' computer graphics, animation and immersive worlds',
  },
  {
    id: 'animation',
    label: 'Animation Craft',
    short: 'Animation',
    color: '#D9A400',
    icon: 'film-outline' as keyof typeof Ionicons.glyphMap,
    newsQuery: 'animation OR "motion graphics" OR Blender',
    movieGenres: [16, 878],
    blurb: ' animation techniques and motion design',
  },
  {
    id: 'learning',
    label: 'Learning',
    short: 'Learning',
    color: '#189774',
    icon: 'school-outline' as keyof typeof Ionicons.glyphMap,
    newsQuery: 'education OR learning OR science',
    movieGenres: [99],
    blurb: ' documentaries and science for curious minds',
  },
  {
    id: 'problem-solving',
    label: 'Problem Solving',
    short: 'Thinking',
    color: '#0E9AA7',
    icon: 'bulb-outline' as keyof typeof Ionicons.glyphMap,
    newsQuery: '"problem solving" OR "first principles" OR critical thinking',
    movieGenres: [99, 878],
    blurb: ' mental models, first principles and clever thinking',
  },
] as const;

export type InterestId = (typeof INTERESTS)[number]['id'];
export type Interest = (typeof INTERESTS)[number];

export const INTEREST_IDS = INTERESTS.map((interest) => interest.id);

export const DEFAULT_INTERESTS: InterestId[] = ['ci', 'geek', '3d', 'learning'];

export const INTEREST_BY_ID = Object.fromEntries(
  INTERESTS.map((interest) => [interest.id, interest]),
) as Record<InterestId, Interest>;

/** Curated relationships used by the knowledge graph when the user has little saved data. */
export const RELATED_INTERESTS: Record<InterestId, InterestId[]> = {
  ci: ['mi6', 'problem-solving', 'geek'],
  mi6: ['ci', 'problem-solving', 'romance'],
  geek: ['3d', 'problem-solving', 'animation'],
  romance: ['mi6', 'animation', 'learning'],
  '3d': ['animation', 'geek', 'learning'],
  animation: ['3d', 'romance', 'geek'],
  learning: ['problem-solving', '3d', 'geek'],
  'problem-solving': ['learning', 'ci', 'geek'],
};

export function isInterestId(value: string): value is InterestId {
  return INTEREST_IDS.includes(value as InterestId);
}
