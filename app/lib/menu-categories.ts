// Expanded categories for "My Menu" — personal relationship preferences
// Inspired by the Non-Escalator Relationship Menu

export interface MenuCategory {
  id: string;
  name: string;
  color: string;
  watercolorClass: string;
  items: string[];
}

export type MenuTier = 'must-have' | 'open' | 'maybe' | 'off-limits';

export const MENU_TIER_LABELS: Record<MenuTier, string> = {
  'must-have': 'Actively Want',
  'open': 'Open To',
  'maybe': 'Not Sure Yet',
  'off-limits': 'Not Available For',
};

export const MENU_TIER_COLORS: Record<MenuTier, string> = {
  'must-have': '#E8838A',   // rose
  'open': '#89CFF0',        // blue
  'maybe': '#F5D06E',       // gold
  'off-limits': '#B0B0B0',  // grey
};

export interface MenuRating {
  item: string;
  tier: MenuTier;
}

export interface MenuProfile {
  categoryId: string;
  ratings: MenuRating[];
}

export const MENU_CATEGORIES: MenuCategory[] = [
  {
    id: 'commitment',
    name: 'Commitment',
    color: '#89CFF0',
    watercolorClass: 'watercolor-blue',
    items: [
      'Cohabitation',
      'Marriage / Civil Partnership',
      'Co-parenting',
      'Shared pets',
      'Planning for the future',
      'Long-term involvement',
      'Working through challenges',
      'Relationship labels',
      'Prioritization over other partners',
      'Home ownership',
      'Power of attorney / wills',
      'Support through health challenges',
    ],
  },
  {
    id: 'emotional-intimacy',
    name: 'Emotional Intimacy',
    color: '#C5A3CF',
    watercolorClass: 'watercolor-lavender',
    items: [
      'Expressing happiness and joy',
      'Offering support in hard times',
      'Sharing vulnerable feelings',
      'Saying "I love you"',
      'Sharing stories about the past',
      'Sharing hopes for the future',
      'Knowing personal likes and dislikes',
      'Pet names',
      'Sharing about mental health',
      'Supporting mental health work',
    ],
  },
  {
    id: 'physical-intimacy',
    name: 'Physical Intimacy',
    color: '#F4A89A',
    watercolorClass: 'watercolor-peach',
    items: [
      'Physical affection',
      'Public displays of affection',
      'Hand holding',
      'Cuddling',
      'Massage',
      'Sleeping together',
      'Nudity',
      'Sensual interactions',
      'Sexual interactions',
      'Kink',
    ],
  },
  {
    id: 'communication',
    name: 'Communication',
    color: '#A8C5A0',
    watercolorClass: 'watercolor-sage',
    items: [
      'Daily or frequent check-ins',
      'Texting',
      'Phone / video calls',
      'Discussing work and hobbies',
      'Discussing family, partners, relationships',
      'Discussing politics and current events',
      'Expressing disagreements or hurt feelings',
      'Addressing and resolving conflict',
      'Radical honesty',
    ],
  },
  {
    id: 'social-integration',
    name: 'Social Integration',
    color: '#F5D06E',
    watercolorClass: 'watercolor-gold',
    items: [
      'Meeting metamours (partners\' other partners)',
      'Meeting children',
      'Meeting parents / siblings / extended family',
      'Meeting friends',
      'Spending time as a couple with friends / family',
      'Positive relationships with metamours',
      'Serving as +1 for social events',
      'Presenting as a couple in public',
      'Following on social media',
      'Presenting as a couple on social media',
      'Joint vacations with family / metamours',
    ],
  },
  {
    id: 'quality-time',
    name: 'Quality Time',
    color: '#F2B5B5',
    watercolorClass: 'watercolor-rose',
    items: [
      'Regularly scheduled time together',
      'Date nights',
      'Spending the night',
      'Shared hobbies or activities',
      'Vacations together',
      'Calendar night / scheduling initiation',
      'Spontaneous hangouts',
      'Parallel play (together, doing separate things)',
    ],
  },
  {
    id: 'financial',
    name: 'Financial',
    color: '#89CFF0',
    watercolorClass: 'watercolor-blue',
    items: [
      'Shared bank account(s)',
      'Mutual contributions to vacation / activity fund',
      'Financial support',
      'Large gifts',
      'Complete financial integration',
      'Shared meal costs',
    ],
  },
  {
    id: 'autonomy',
    name: 'Autonomy',
    color: '#B8A9D4',
    watercolorClass: 'watercolor-purple',
    items: [
      'Balance of time together and apart',
      'Support to pursue independent interests',
      'Maintaining independent friendships',
      'Maintaining independent romantic relationships',
      'Equal distribution of relationship power',
      'Alone time',
    ],
  },
];
