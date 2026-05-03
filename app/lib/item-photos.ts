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

  'Spending the Night':           'photo-1599682802483-c31c10e577a8',

  // ---- Quality Time ----
  'Shared Hobbies or Activities': 'photo-1758691031336-054e6f00acb8',
  'Shared Rituals':             'photo-1564890369478-c89ca6d9cde9',
  'Activities That Are "Yours"': 'photo-1758874960533-a0925d4f645c',
  'Parallel Play':              'photo-1565772964002-c315f1ce06bb',
  'Date Nights':                'photo-1622533122617-5d9e02ee6f85',
  'Celebrating Events or Holidays': 'photo-1764267703523-b58a4da829fc',
  'Trips Together':             'photo-1548957175-84f0f9af659e',
  'Creative Collaboration':     'photo-1445375011782-2384686778a0',

  // ---- Emotional Intimacy ----
  'Terms of Endearment':        'photo-1707787597159-82cd78925ca2',
  'Words of Affirmation':       'photo-1753482555713-5c114a6f81e5',
  'Saying "I Love You"':        'reserve/Af0sF2OS5S5gatqrKzVP_Silhoutte.jpg',
  'Sharing Longings':           'photo-1621452773781-0f992fd1f5cb',
  'Sharing Vulnerable Feelings': 'photo-1776223814006-2d282c732742',
  'Sharing About Mental Health': 'photo-1636249253913-40e83d5423e9',
  'Supporting Mental Health Work': 'photo-1604881991720-f91add269bed',
  'Offering Emotional Support': 'photo-1641057324798-c05769de628a',
  'Being Relied Upon for Support': 'photo-1702911235202-df7450a878d6',
  'Being a Confidante':         'photo-1483706600674-e0c87d3fe85b',
  'Expressing Disagreements or Hurt Feelings': 'photo-1484973768669-7fb6b5451095',
  'Addressing and Resolving Conflict': 'photo-1523198780259-41f275ab6e3d',
  '3rd Party Support':          'photo-1551845843-8520a9208f20',
  'Multiple Emotional Bonds':   'photo-1511632765486-a01980e01a18',
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
