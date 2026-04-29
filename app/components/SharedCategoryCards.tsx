'use client';

import { useState } from 'react';
import { Connection, TIER_ORDER, Tier } from '../lib/types';
import { DEFAULT_CATEGORIES } from '../lib/categories';
import { MENU_TIER_COLORS } from '../lib/menu-categories';
import { SUBCATEGORY_DEFINITIONS } from '../lib/definitions';

interface SharedCategoryCardsProps {
  myConnection: Connection;
  theirConnection: Connection;
  myName: string;
  theirName: string;
}

const SHORT_TIER_LABELS: Record<Tier, string> = {
  'must-have': 'Want',
  'open': 'Open',
  'maybe': 'Unsure',
  'off-limits': 'N/A',
};

const TIER_COLORS_DARK: Record<Tier, string> = {
  'must-have': '#007A6B',
  'open': '#5BA84D',
  'maybe': '#B8A520',
  'off-limits': '#D47020',
};

// Card color based on alignment ratio
function getCardColor(alignmentRatio: number): string {
  const teal = { r: 0, g: 148, b: 131 };
  const green = { r: 129, g: 204, b: 115 };
  const yellow = { r: 255, g: 239, b: 133 };
  const orange = { r: 255, g: 148, b: 72 };

  let from, to, t;
  if (alignmentRatio >= 0.8) {
    from = green; to = teal; t = (alignmentRatio - 0.8) / 0.2;
  } else if (alignmentRatio >= 0.6) {
    from = yellow; to = green; t = (alignmentRatio - 0.6) / 0.2;
  } else if (alignmentRatio >= 0.4) {
    from = orange; to = yellow; t = (alignmentRatio - 0.4) / 0.2;
  } else {
    from = orange; to = orange; t = 0;
  }

  const r = Math.round(from.r + (to.r - from.r) * t);
  const g = Math.round(from.g + (to.g - from.g) * t);
  const b = Math.round(from.b + (to.b - from.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

interface DimensionRow {
  subcategory: string;
  myTier: Tier;
  theirTier: Tier;
  aligned: boolean;
}

export default function SharedCategoryCards({ myConnection, theirConnection, myName, theirName }: SharedCategoryCardsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [peekItem, setPeekItem] = useState<string | null>(null);

  const myInitial = myName[0]?.toUpperCase() || 'A';
  const theirInitial = theirName[0]?.toUpperCase() || 'B';

  // Build a map of their ratings
  const theirRatingsMap = new Map<string, Map<string, Tier>>();
  for (const cat of theirConnection.categories) {
    const catMap = new Map<string, Tier>();
    for (const r of cat.ratings) {
      catMap.set(r.subcategory, r.tier);
    }
    theirRatingsMap.set(cat.categoryId, catMap);
  }

  const categoryData = myConnection.categories
    .map((cat) => {
      const catDef = DEFAULT_CATEGORIES.find((c) => c.id === cat.categoryId);
      if (!catDef) return null;

      const theirCatRatings = theirRatingsMap.get(cat.categoryId) || new Map<string, Tier>();

      // Collect all dimensions from both sides
      const allDims = new Set<string>();
      cat.ratings.forEach((r) => allDims.add(r.subcategory));
      theirCatRatings.forEach((_, key) => allDims.add(key));

      const myRatingsMap = new Map<string, Tier>();
      cat.ratings.forEach((r) => myRatingsMap.set(r.subcategory, r.tier));

      const dimensions: DimensionRow[] = [];
      for (const dim of allDims) {
        const myTier = myRatingsMap.get(dim) || 'off-limits';
        const theirTier = theirCatRatings.get(dim) || 'off-limits';
        const myPositive = myTier === 'must-have' || myTier === 'open';
        const theirPositive = theirTier === 'must-have' || theirTier === 'open';
        dimensions.push({
          subcategory: dim,
          myTier,
          theirTier,
          aligned: myPositive === theirPositive,
        });
      }

      if (dimensions.length === 0) return null;

      const alignedCount = dimensions.filter((d) => d.aligned).length;
      const alignmentRatio = dimensions.length > 0 ? alignedCount / dimensions.length : 0;

      // Sort: aligned first, then by combined tier score
      dimensions.sort((a, b) => {
        if (a.aligned !== b.aligned) return a.aligned ? -1 : 1;
        const TIER_SCORE: Record<Tier, number> = { 'must-have': 4, 'open': 3, 'maybe': 2, 'off-limits': 1 };
        const aScore = TIER_SCORE[a.myTier] + TIER_SCORE[a.theirTier];
        const bScore = TIER_SCORE[b.myTier] + TIER_SCORE[b.theirTier];
        return bScore - aScore;
      });

      return {
        id: cat.categoryId,
        name: catDef.name,
        dimensions,
        alignmentRatio,
        alignedCount,
        totalDims: dimensions.length,
        color: getCardColor(alignmentRatio),
      };
    })
    .filter(Boolean) as {
      id: string;
      name: string;
      dimensions: DimensionRow[];
      alignmentRatio: number;
      alignedCount: number;
      totalDims: number;
      color: string;
    }[];

  if (categoryData.length === 0) return null;

  const sorted = [...categoryData].sort((a, b) => b.alignmentRatio - a.alignmentRatio);

  return (
    <div className="space-y-3">
      {sorted.map((cat) => {
        const isExpanded = expandedId === cat.id;

        return (
          <div key={cat.id} className="rounded-2xl overflow-hidden transition-all duration-300">
            <button
              onClick={() => { setExpandedId(isExpanded ? null : cat.id); setPeekItem(null); }}
              className="w-full text-left px-5 py-5 transition-all active:scale-[0.99] rounded-2xl"
              style={{
                background: cat.color,
                boxShadow: `0 4px 18px ${cat.color}55, inset 0 -2px 6px ${cat.color}40`,
                border: '2px solid rgba(255,255,255,0.5)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-extrabold uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.75)' }}>
                    {cat.name}
                  </h3>
                  <p className="text-xs mt-1" style={{ color: 'rgba(0,0,0,0.4)' }}>
                    {cat.alignedCount} of {cat.totalDims} aligned
                  </p>
                </div>
                <span className="text-sm" style={{ color: 'rgba(0,0,0,0.3)' }}>
                  {isExpanded ? '\u25B2' : '\u25BC'}
                </span>
              </div>
            </button>

            {isExpanded && (
              <div
                className="bg-white border-x border-b border-black/5 rounded-b-2xl"
                style={{ animation: 'tooltip-enter 0.2s ease-out' }}
              >
                <div className="px-4 py-3">
                  {/* Tier column headers */}
                  <div className="flex items-center mb-3">
                    <div className="flex-1" />
                    <div className="flex gap-0">
                      {TIER_ORDER.map((tier) => (
                        <div key={tier} className="w-14 text-center">
                          <span
                            className="text-[9px] font-semibold uppercase tracking-wider"
                            style={{ color: TIER_COLORS_DARK[tier] }}
                          >
                            {SHORT_TIER_LABELS[tier]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dimension rows */}
                  <div className="space-y-1">
                    {cat.dimensions.map((dim) => (
                      <div key={dim.subcategory}>
                        <button
                          onClick={() => setPeekItem(peekItem === dim.subcategory ? null : dim.subcategory)}
                          className="w-full flex items-center py-1.5 px-1 rounded-lg transition-all active:scale-[0.99]"
                          style={{ background: peekItem === dim.subcategory ? 'rgba(0,0,0,0.04)' : 'transparent' }}
                        >
                          <span className="text-[11px] mr-1.5 shrink-0" style={{ color: 'rgba(0,0,0,0.3)' }}>ⓘ</span>
                          <span className="flex-1 text-left text-sm pr-2 underline decoration-dotted underline-offset-2" style={{ color: 'rgba(0,0,0,0.7)', textDecorationColor: 'rgba(0,0,0,0.25)' }}>
                            {dim.subcategory}
                          </span>
                          <div className="flex gap-0">
                            {TIER_ORDER.map((tier) => (
                              <div key={tier} className="w-14 flex items-center justify-center gap-0.5">
                                {dim.myTier === tier && (
                                  <span
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                    style={{ background: TIER_COLORS_DARK[tier] }}
                                  >
                                    {myInitial}
                                  </span>
                                )}
                                {dim.theirTier === tier && (
                                  <span
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2"
                                    style={{ borderColor: TIER_COLORS_DARK[tier], color: TIER_COLORS_DARK[tier], background: `${MENU_TIER_COLORS[tier]}20` }}
                                  >
                                    {theirInitial}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </button>
                        {peekItem === dim.subcategory && SUBCATEGORY_DEFINITIONS[dim.subcategory] && (
                          <div
                            className="ml-2 mr-1 mb-1.5 px-3 py-2 rounded-xl text-xs leading-relaxed"
                            style={{ background: 'rgba(0,0,0,0.03)', color: 'rgba(0,0,0,0.5)', animation: 'tooltip-enter 0.15s ease-out' }}
                          >
                            {SUBCATEGORY_DEFINITIONS[dim.subcategory]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
