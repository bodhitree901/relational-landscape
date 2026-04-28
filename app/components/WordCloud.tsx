'use client';

import { Connection, Tier } from '../lib/types';
import { DEFAULT_CATEGORIES } from '../lib/categories';

const TIER_SIZE_CLASS: Record<Tier, string> = {
  'must-have': 'word-core',
  'open': 'word-rhythm',
  'maybe': 'word-sometimes',
  'off-limits': 'word-potential',
};

function getCategoryColor(subcategory: string): string {
  for (const cat of DEFAULT_CATEGORIES) {
    if (cat.subcategories.includes(subcategory)) {
      return cat.color;
    }
  }
  return '#A8C5A0';
}

export default function WordCloud({ connection }: { connection: Connection }) {
  const allRatings = connection.categories.flatMap((c) => c.ratings);

  if (allRatings.length === 0) {
    return (
      <div className="text-center py-8 opacity-40">
        <p>No subcategories rated yet</p>
      </div>
    );
  }

  // Sort: core first, then rhythm, etc.
  const tierPriority: Record<Tier, number> = { 'must-have': 0, 'open': 1, 'maybe': 2, 'off-limits': 3 };
  const sorted = [...allRatings].sort((a, b) => tierPriority[a.tier] - tierPriority[b.tier]);

  return (
    <div className="flex flex-wrap justify-center items-center gap-1 py-4">
      {sorted.map((rating) => {
        const color = getCategoryColor(rating.subcategory);
        return (
          <span
            key={rating.subcategory}
            className={`word-cloud-item ${TIER_SIZE_CLASS[rating.tier]}`}
            style={{
              background: `${color}20`,
              color: '#3D3532',
            }}
          >
            {rating.subcategory}
          </span>
        );
      })}
    </div>
  );
}
