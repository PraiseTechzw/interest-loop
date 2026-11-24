import type Ionicons from '@expo/vector-icons/Ionicons';

export type InterestIcon = keyof typeof Ionicons.glyphMap;

/** Metadata for a topic. Built-ins ship with the app; custom ones live in SQLite. */
export type Interest = {
  id: string;
  label: string;
  short: string;
  color: string;
  icon: InterestIcon;
  newsQuery: string;
  movieGenres: number[];
  blurb: string;
  custom?: boolean;
};

/** Interest ids are opaque strings so user-created topics work everywhere. */
export type InterestId = string;

export const INTERESTS: Interest[] = [
  {
    id: 'ci',
    label: 'CIA & Intelligence',
    short: 'CIA',
    color: '#5B4FE9',
    icon: 'shield-outline',
    newsQuery: 'CIA OR intelligence OR espionage',
    movieGenres: [28, 53],
    blurb: ' tradecraft, spy thrillers and intelligence history',
  },
  {
    id: 'mi6',
    label: 'MI6 & Secret Service',
    short: 'MI6',
    color: '#2F6FED',
    icon: 'radio-outline',
    newsQuery: 'MI6 OR "secret service" OR espionage',
    movieGenres: [28, 53],
    blurb: ' secret service stories and Cold War intrigue',
  },
  {
    id: 'geek',
    label: 'Geek Culture',
    short: 'Geek',
    color: '#7B52D8',
    icon: 'game-controller-outline',
    newsQuery: 'technology OR gaming OR "open source"',
    movieGenres: [35, 878],
    blurb: ' tech, gaming and cult classics',
  },
  {
    id: 'romance',
    label: 'Romance',
    short: 'Romance',
    color: '#E75480',
    icon: 'heart-outline',
    newsQuery: 'romance OR relationships OR love',
    movieGenres: [10749],
    blurb: ' love stories and relationship insights',
  },
  {
    id: '3d',
    label: '3D & Animation',
    short: '3D',
    color: '#F08A24',
    icon: 'cube-outline',
    newsQuery: '3D OR animation OR "computer graphics"',
    movieGenres: [878, 16],
    blurb: ' computer graphics, animation and immersive worlds',
  },
  {
    id: 'animation',
    label: 'Animation Craft',
    short: 'Animation',
    color: '#D9A400',
    icon: 'film-outline',
    newsQuery: 'animation OR "motion graphics" OR Blender',
    movieGenres: [16, 878],
    blurb: ' animation techniques and motion design',
  },
  {
    id: 'learning',
    label: 'Learning',
    short: 'Learning',
    color: '#189774',
    icon: 'school-outline',
    newsQuery: 'education OR learning OR science',
    movieGenres: [99],
    blurb: ' documentaries and science for curious minds',
  },
  {
    id: 'problem-solving',
    label: 'Problem Solving',
    short: 'Thinking',
    color: '#0E9AA7',
    icon: 'bulb-outline',
    newsQuery: '"problem solving" OR "first principles" OR critical thinking',
    movieGenres: [99, 878],
    blurb: ' mental models, first principles and clever thinking',
  },
];

export const INTEREST_IDS: string[] = INTERESTS.map((interest) => interest.id);
export const DEFAULT_INTERESTS: string[] = ['ci', 'geek', '3d', 'learning'];
export const INTEREST_BY_ID: Record<string, Interest> = Object.fromEntries(
  INTERESTS.map((interest) => [interest.id, interest]),
);

/** Curated relationships for built-in topics; custom topics connect via shared saves. */
export const RELATED_INTERESTS: Record<string, string[]> = {
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
  return typeof value === 'string' && value.trim().length > 0;
}

/** Palette used when the user creates a new topic without picking a colour. */
export const CUSTOM_INTEREST_COLORS = [
  '#5B4FE9',
  '#2F6FED',
  '#E75480',
  '#F08A24',
  '#189774',
  '#0E9AA7',
  '#7B52D8',
  '#D9A400',
];

export const CUSTOM_INTEREST_ICONS: InterestIcon[] = [
  'star-outline',
  'heart-outline',
  'bulb-outline',
  'book-outline',
  'musical-notes-outline',
  'briefcase-outline',
  'flask-outline',
  'planet-outline',
  'camera-outline',
  'code-slash-outline',
];

/** Sensible defaults so a new topic still contributes to news and movie feeds. */
export function makeCustomInterest(input: {
  id: string;
  label: string;
  color?: string;
  icon?: InterestIcon;
  newsQuery?: string;
  movieGenres?: number[];
}): Interest {
  const label = input.label.trim();
  const short = label.length > 14 ? `${label.slice(0, 13)}…` : label;
  return {
    id: input.id,
    label,
    short,
    color: input.color ?? CUSTOM_INTEREST_COLORS[0],
    icon: input.icon ?? 'star-outline',
    newsQuery: input.newsQuery?.trim() || label,
    movieGenres: input.movieGenres ?? [],
    blurb: ` everything you save about ${label.toLowerCase()}`,
    custom: true,
  };
}
