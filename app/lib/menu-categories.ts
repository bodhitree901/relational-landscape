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
      'Co-Parenting',
      'Home Ownership',
      'Shared Sleeping Space',
      'Shared Meals',
      'Shared Chores',
      'Shared Pets/Plants',
      'Shared External Caretaking',
      'Emergency Contact',
      'Mutual Aid',
      'Business Collaborations',
    ],
  },
  {
    id: 'relational-commitment',
    name: 'Relational Commitment',
    color: '#B8A9D4',
    watercolorClass: 'watercolor-purple',
    items: [
      'Exclusivity',
      'Prioritization',
      'Reliability',
      'Allyship',
      'Focusing on the "Here and Now"',
      'Long-Term Involvement',
      'Future Plans Together',
      'Relationship Labels',
      'Working Through Challenges',
      'Support Through Health Challenges',
      'End of Life Care',
    ],
  },
  {
    id: 'quality-time',
    name: 'Quality Time',
    color: '#F2B5B5',
    watercolorClass: 'watercolor-rose',
    items: [
      'Shared Hobbies or Activities',
      'Activities That Are "Yours"',
      'Shared Rituals',
      'Date Nights',
      'Spending the Night',
      'Parallel Play',
      'Celebrating Events or Holidays',
      'Trips Together',
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
      'Words of Affirmation',
      'Saying "I Love You"',
      'Knowing Personal Likes and Dislikes',
      'Sharing Longings',
      'Sharing Vulnerable Feelings',
      'Sharing About Mental Health',
      'Supporting Mental Health Work',
      'Offering Emotional Support',
      'Being Relied Upon for Support',
      'Being a Confidante',
      'Expressing Disagreements or Hurt Feelings',
      'Addressing and Resolving Conflict',
      '3rd Party Support',
      'Multiple Emotional Bonds',
    ],
  },
  {
    id: 'physical-intimacy',
    name: 'Physical Intimacy',
    color: '#F4A89A',
    watercolorClass: 'watercolor-peach',
    items: [
      'Body Contact',
      'Physical Affection',
      'Hugs',
      'Hand Holding',
      'Kissing',
      'Cuddling',
      'Massage',
      'Co-Sleeping',
      'Nudity',
      'Sensual Interactions',
      'Sexual Interactions',
      'Public Displays of Affection',
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
      'Gifts',
      'Sharing Costs',
      'Lending Money',
      'Financial Support',
      'Financial Integration',
      'Shared Bank Account(s)',
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
      'Voice Messages',
      'Phone/Video Calls',
      'Discussing Work and Hobbies',
      'Discussing Politics and Current Events',
      'Intellectual/Philosophical Discussions',
      'Discussing Family, Partners, Relationships',
      'Playing and Laughing Together',
      'Sharing Stories About the Past',
      'Relationship "Check-Ins"',
      'Radical Honesty',
      'Transparency Across Relationships',
    ],
  },
  {
    id: 'time-and-rhythms',
    name: 'Time and Rhythms',
    color: '#D4B896',
    watercolorClass: 'watercolor-sand',
    items: [
      'Expectations Around Responding to Messages',
      'Daily or Frequent Communication',
      'Unplanned Communication',
      'Integrated into Daily Life',
      'Long Distance',
      'Spontaneous Hangouts',
      'Planned Hangouts',
      'Regularly Scheduled Time Together',
      'Weekly Hangouts',
      'Monthly Hangouts',
      'Yearly Hangouts',
      'Seasonal/Contextual Connecting',
    ],
  },
  {
    id: 'tones',
    name: 'Tones',
    color: '#E0B0C0',
    watercolorClass: 'watercolor-blush',
    items: [
      'Companionship',
      'Friendship',
      'Chosen Family',
      'Therapeutic',
      'Romantic',
      'Erotic',
      'Comet/Seasonal',
    ],
  },
];
