// Curated Unsplash photos per item.
// URL format: https://images.unsplash.com/{id}?w=700&h=420&fit=crop&auto=format
// Add more as you go — anything not listed falls back to Picsum.

export const ITEM_PHOTOS: Record<string, string> = {
  // ---- Life Infrastructure ----
  'Co-Housing': 'photo-1602443394222-300ea8fca02e',
};

export function getItemPhotoUrl(item: string): string {
  const id = ITEM_PHOTOS[item];
  if (id) {
    return `https://images.unsplash.com/${id}?w=700&h=420&fit=crop&auto=format`;
  }
  return `https://picsum.photos/seed/${encodeURIComponent(item)}/700/420`;
}
