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
};

export function getItemPhotoUrl(item: string): string {
  const id = ITEM_PHOTOS[item];
  if (id) {
    return `https://images.unsplash.com/${id}?w=700&h=420&fit=crop&auto=format`;
  }
  return `https://picsum.photos/seed/${encodeURIComponent(item)}/700/420`;
}
