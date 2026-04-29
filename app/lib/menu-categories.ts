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
  'maybe': 'Not Sure',
  'off-limits': 'Not Available For',
};

export const MENU_TIER_COLORS: Record<MenuTier, string> = {
  'must-have': '#009483',   // teal
  'open': '#81CC73',        // green
  'maybe': '#FFEF85',       // yellow
  'off-limits': '#FF9448',  // orange
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
    id: 'life-infrastructure',
    name: 'Life Infrastructure',
    color: '#89CFF0',
    watercolorClass: 'watercolor-blue',
    items: [
      'Co-Housing',
      'Sharing a Sleeping Space',
      'Shared Chores',
      'Shared Meals',
      'Home Ownership',
      'Co-Parenting',
      'Shared Pets/Plants',
      'Shared External Caretaking',
      'Emergency Contact',
      'Business Collaborations',
      'Mutual Aid',
    ],
  },
  {
    id: 'relational-commitment',
    name: 'Relational Commitment',
    color: '#B8A9D4',
    watercolorClass: 'watercolor-purple',
    items: [
      'Future Plans Together',
      'Long-Term Involvement',
      'Focusing on the "Here and Now"',
      'Prioritization Over Other Partners',
      'Relationship Labels',
      'Exclusivity',
      'Working Through Challenges',
      'Reliability',
      'Support Through Health Challenges',
      'End of Life Care',
      'Allyship',
    ],
  },
  {
    id: 'quality-time',
    name: 'Quality Time',
    color: '#F2B5B5',
    watercolorClass: 'watercolor-rose',
    items: [
      'Date Nights',
      'Spending the Night',
      'Shared Hobbies or Activities',
      'Trips Together',
      'Celebrating Events or Holidays',
      'Parallel Play',
      'Activities That Are "Yours"',
      'Shared Rituals',
      'Creative Collaboration',
      'Project Collaboration',
    ],
  },
  {
    id: 'emotional-intimacy',
    name: 'Emotional Intimacy',
    color: '#C5A3CF',
    watercolorClass: 'watercolor-lavender',
    items: [
      'Terms of Endearment',
      'Offering Emotional Support',
      'Saying "I Love You"',
      'Sharing Longings',
      'Knowing Personal Likes and Dislikes',
      'Sharing About Mental Health',
      'Supporting Mental Health Work',
      'Being a Confidante',
      'Words of Affirmation',
      'Expressing Disagreements or Hurt Feelings',
      'Addressing and Resolving Conflict',
      '3rd Party Support',
      'Being Relied Upon for Support',
      'Sharing Vulnerable Feelings',
      'Multiple Emotional Bonds',
    ],
  },
  {
    id: 'physical-intimacy',
    name: 'Physical Intimacy',
    color: '#F4A89A',
    watercolorClass: 'watercolor-peach',
    items: [
      'Physical Affection',
      'Hugs',
      'Kissing',
      'Hand Holding',
      'Body Contact',
      'Public Displays of Affection',
      'Cuddling',
      'Massage',
      'Co-Sleeping',
      'Nudity',
      'Sensual Interactions',
      'Sexual Interactions',
      'Kink',
      'Multiple Sexual Connections',
    ],
  },
  {
    id: 'social-integration',
    name: 'Social Integration',
    color: '#F5D06E',
    watercolorClass: 'watercolor-gold',
    items: [
      'Down to Meet Friends',
      'Down to Meet Metamours',
      'Down to Meet Family',
      'Integrate with Friends',
      'Integrate with Metamours',
      'Integration with Family',
      'Supporting Friendships',
      'Supporting Metamour Relationships',
      'Presenting as a Social Unit in Public',
      'Presenting as a Social Unit on Social Media',
      'Serving as +1 for Social Events',
      'Joint Trips with Family/Friends',
    ],
  },
  {
    id: 'financial-legal',
    name: 'Financial/Legal',
    color: '#A8C5A0',
    watercolorClass: 'watercolor-sage',
    items: [
      'Shared Bank Account(s)',
      'Financial Support',
      'Gifts',
      'Financial Integration',
      'Sharing Costs',
      'Lending Money',
      'Legal Processes',
      'Marriage/Civil Partnership',
    ],
  },
  {
    id: 'communication',
    name: 'Communication',
    color: '#8EC6C5',
    watercolorClass: 'watercolor-teal',
    items: [
      'Texting',
      'Phone/Video Calls',
      'Voice Messages',
      'Discussing Work and Hobbies',
      'Discussing Family, Partners, Relationships',
      'Transparency Across Relationships',
      'Discussing Politics and Current Events',
      'Playing and Laughing Together',
      'Intellectual/Philosophical Discussions',
      'Sharing Stories About the Past',
      'Radical Honesty',
      'Relationship "Check-Ins"',
    ],
  },
  {
    id: 'time-and-rhythms',
    name: 'Time and Rhythms',
    color: '#D4B896',
    watercolorClass: 'watercolor-sand',
    items: [
      'Daily or Frequent Communication',
      'Unplanned Communication',
      'Long Distance',
      'Expectations Around Responding to Messages',
      'Integrated into Daily Life',
      'Planned Hangouts',
      'Spontaneous Hangouts',
      'Regularly Scheduled Time Together',
      'Seasonal/Contextual Connecting',
      'Weekly Hangouts',
      'Monthly Hangouts',
      'Yearly Hangouts',
    ],
  },
  {
    id: 'tones',
    name: 'Tones',
    color: '#E0B0C0',
    watercolorClass: 'watercolor-blush',
    items: [
      'Therapeutic',
      'Romantic',
      'Companionship',
      'Friendship',
      'Erotic',
      'Chosen Family',
      'Comet/Seasonal',
    ],
  },
];
