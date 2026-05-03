// Curated Unsplash photos per item.
// URL format: https://images.unsplash.com/{id}?w=700&h=420&fit=crop&auto=format
// Add more as you go — anything not listed falls back to Picsum.

export const ITEM_PHOTOS: Record<string, string> = {
  // ---- Life Infrastructure ----
  'Co-Housing':              'photo-1602443394222-300ea8fca02e',
  'Co-Parenting':            'photo-1768316695254-3dceb33f5cdf',
  'Home Ownership':          'premium_photo-1679860703713-9c9f5428f652',
  'Shared Sleeping Space':   'premium_photo-1684445035187-c4bc7c96bc5d',
  'Shared Meals':            'photo-1592417817038-d13fd7342605',
  'Shared Chores':           'photo-1643213379811-17f8c9ec7b66',
  'Shared Pets/Plants':      'photo-1548366086-7f1b76106622',
  'Shared External Caretaking': 'premium_photo-1663126533315-fe75e63dbbf1',
  'Emergency Contact':       'premium_photo-1726797756953-30e3edeea563',
  'Mutual Aid':              'premium_photo-1663045495725-89f23b57cfc5',
  'Business Collaborations': 'photo-1765395958722-e0cb9f7337e3',

  // ---- Relational Commitment ----
  'Exclusivity':                      'premium_photo-1664529906570-7ceaf3e3e472',
  'Prioritization':                   'photo-1517940322679-2b003a168fd2',
  'Reliability':                      'photo-1630510590497-e69fac21bfbd',
  'Allyship':                         'premium_photo-1713453393898-1cd8fe355f3d',
  'Focusing on the "Here and Now"':   'premium_photo-1761478345860-e1a048b8f641',
  'Long-Term Involvement':            'photo-1724129923183-a66bbf3fefb6',
  'Future Plans Together':            'photo-1539992190939-08f22d7ebaad',
  'Relationship Labels':              'photo-1571907483086-3c0ea40cc16d',
  'Working Through Challenges':       'premium_photo-1661963517045-f3ad4911bf4b',
  'Support Through Health Challenges':'premium_photo-1702531819043-88269e752d6c',
  'End of Life Care':                 'premium_photo-1679429320721-74a579575294',

  // ---- Quality Time ----
  'Shared Hobbies or Activities':     'photo-1758691031336-054e6f00acb8',
  'Activities That Are "Yours"':      'premium_photo-1723845636007-e1f7069186a5',
  'Shared Rituals':                   'photo-1564890369478-c89ca6d9cde9',
  'Date Nights':                      'photo-1622533122617-5d9e02ee6f85',
  'Spending the Night':               'premium_photo-1661341477201-3c767199b282',
  'Parallel Play':                    'premium_photo-1681492299363-2ffcb86c8d91',
  'Celebrating Events or Holidays':   'premium_photo-1683121131492-9ae8cdfea4f7',
  'Trips Together':                   'premium_photo-1680102982023-14e2f9563c6f',
  'Creative Collaboration':           'premium_photo-1681540675424-f41320dac7df',
  'Project Collaboration':            'premium_photo-1705882849180-ce62b3d1a2de',
};

export function getItemPhotoUrl(item: string): string {
  const id = ITEM_PHOTOS[item];
  if (id) {
    return `https://images.unsplash.com/${id}?w=700&h=420&fit=crop&auto=format`;
  }
  return `https://picsum.photos/seed/${encodeURIComponent(item)}/700/420`;
}
