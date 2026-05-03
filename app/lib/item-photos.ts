// Curated Unsplash photos per item.
// Each entry is either a plain photo ID string, or { id, pos } to control crop position.
// pos uses CSS object-position values e.g. 'center', 'top', 'bottom', '50% 20%'
// NOTE: only use regular unsplash.com photos (photo-XXXX), not plus/premium ones.
// Anything not listed falls back to Picsum.

type PhotoEntry = string | { id: string; pos?: string };

export const ITEM_PHOTOS: Record<string, PhotoEntry> = {
  // ---- Life Infrastructure ----
  'Co-Housing':                 'photo-1602443394222-300ea8fca02e',
  'Co-Parenting':               'photo-1768316695254-3dceb33f5cdf',
  'Shared Meals':               'photo-1592417817038-d13fd7342605',
  'Shared Chores':              'photo-1643213379811-17f8c9ec7b66',
  'Shared Pets/Plants':         'photo-1548366086-7f1b76106622',
  'Business Collaborations':    'photo-1765395958722-e0cb9f7337e3',

  // ---- Relational Commitment ----
  'Prioritization':             'photo-1517940322679-2b003a168fd2',
  'Reliability':                'photo-1630510590497-e69fac21bfbd',
  'Long-Term Involvement':      'photo-1724129923183-a66bbf3fefb6',
  'Future Plans Together':      { id: 'photo-1539992190939-08f22d7ebaad', pos: 'center top' },
  'Relationship Labels':        'photo-1571907483086-3c0ea40cc16d',

  // ---- Quality Time ----
  'Shared Hobbies or Activities': 'photo-1758691031336-054e6f00acb8',
  'Shared Rituals':             'photo-1564890369478-c89ca6d9cde9',
  'Activities That Are "Yours"': 'photo-1758874960533-a0925d4f645c',
  'Parallel Play':              'photo-1565772964002-c315f1ce06bb',
  'Date Nights':                'photo-1622533122617-5d9e02ee6f85',
  'Celebrating Events or Holidays': 'photo-1764267703523-b58a4da829fc',
  'Trips Together':             'photo-1548957175-84f0f9af659e',
  'Creative Collaboration':     'photo-1445375011782-2384686778a0',
};

export function getItemPhoto(item: string): { url: string; pos: string } {
  const entry = ITEM_PHOTOS[item];
  if (!entry) {
    return { url: `https://picsum.photos/seed/${encodeURIComponent(item)}/700/420`, pos: 'center' };
  }
  const id  = typeof entry === 'string' ? entry : entry.id;
  const pos = typeof entry === 'string' ? 'center' : (entry.pos ?? 'center');
  return {
    url: `https://images.unsplash.com/${id}?w=700&h=420&fit=crop&auto=format`,
    pos,
  };
}
