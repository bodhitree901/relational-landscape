'use client';

import { useState } from 'react';
import { Connection, TIER_ORDER, Tier } from '../lib/types';
import { DEFAULT_CATEGORIES } from '../lib/categories';
import { MENU_TIER_COLORS } from '../lib/menu-categories';
import { SUBCATEGORY_DEFINITIONS } from '../lib/definitions';

interface CategoryCardsProps {
  connection: Connection;
}

// Card color: teal → green → yellow → orange based on positive ratio
function getCardColor(positiveRatio: number): string {
  const teal = { r: 0, g: 148, b: 131 };
  const green = { r: 129, g: 204, b: 115 };
  const yellow = { r: 255, g: 239, b: 133 };
  const orange = { r: 255, g: 148, b: 72 };

  let from, to, t;
  if (positiveRatio >= 0.8) {
    from = green; to = teal; t = (positiveRatio - 0.8) / 0.2;
  } else if (positiveRatio >= 0.6) {
    from = yellow; to = green; t = (positiveRatio - 0.6) / 0.2;
  } else if (positiveRatio >= 0.4) {
    from = orange; to = yellow; t = (positiveRatio - 0.4) / 0.2;
  } else {
    from = orange; to = orange; t = 0;
  }

  const r = Math.round(from.r + (to.r - from.r) * t);
  const g = Math.round(from.g + (to.g - from.g) * t);
  const b = Math.round(from.b + (to.b - from.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

const TIER_SORT: Record<Tier, number> = {
  'must-have': 0,
  'open': 1,
  'maybe': 2,
  'off-limits': 3,
};

const PILL_LABELS: Record<Tier, string> = {
  'must-have': 'Actively Want',
  'open': 'Open To',
  'maybe': 'Not Sure',
  'off-limits': 'Not Relevant',
};

const TIER_COLORS_DARK: Record<Tier, string> = {
  'must-have': '#007A6B',
  'open': '#5BA84D',
  'maybe': '#B8A520',
  'off-limits': '#D47020',
};

export default function CategoryCards({ connection }: CategoryCardsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [peekItem, setPeekItem] = useState<string | null>(null);

  const categoryData = connection.categories
    .map((cat) => {
      const catDef = DEFAULT_CATEGORIES.find((c) => c.id === cat.categoryId);
      if (!catDef || cat.ratings.length === 0) return null;

      const tierCounts: Record<Tier, number> = { 'must-have': 0, 'open': 0, 'maybe': 0, 'off-limits': 0 };
      cat.ratings.forEach((r) => { tierCounts[r.tier]++; });

      const totalRated = cat.ratings.length;
      const positiveCount = tierCounts['must-have'] + tierCounts['open'];
      const positiveRatio = totalRated > 0 ? positiveCount / totalRated : 0;

      const sortedItems = [...cat.ratings].sort((a, b) => TIER_SORT[a.tier] - TIER_SORT[b.tier]);

      return {
        id: cat.categoryId,
        name: catDef.name,
        totalRated,
        positiveCount,
        positiveRatio,
        tierCounts,
        sortedItems,
        color: getCardColor(positiveRatio),
      };
    })
    .filter(Boolean) as {
      id: string;
      name: string;
      totalRated: number;
      positiveCount: number;
      positiveRatio: number;
      tierCounts: Record<Tier, number>;
      sortedItems: { subcategory: string; tier: Tier }[];
      color: string;
    }[];

  if (categoryData.length === 0) return null;

  const sorted = [...categoryData].sort((a, b) => b.positiveRatio - a.positiveRatio);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    setPeekItem(null);
  };

  return (
    <div className="space-y-3">
      {sorted.map((cat) => {
        const isExpanded = expandedId === cat.id;

        return (
          <div key={cat.id} className="rounded-2xl overflow-hidden transition-all duration-300">
            <button
              onClick={() => toggleExpand(cat.id)}
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
                    {cat.positiveCount} of {cat.totalRated} positive
                  </p>
                </div>
                <span className="text-sm" style={{ color: 'rgba(0,0,0,0.3)' }}>
                  {isExpanded ? '▲' : '▼'}
                </span>
              </div>
            </button>

            {isExpanded && (
              <div
                className="bg-white border-x border-b border-black/5 rounded-b-2xl"
                style={{ animation: 'tooltip-enter 0.2s ease-out' }}
              >
                <div className="px-4 py-3 space-y-2.5">
                  {TIER_ORDER.map((tier) => {
                    const items = cat.sortedItems.filter((i) => i.tier === tier);
                    if (items.length === 0) return null;
                    return (
                      <div
                        key={tier}
                        className="rounded-xl px-3 py-2.5"
                        style={{ background: `${MENU_TIER_COLORS[tier]}12` }}
                      >
                        <p
                          className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                          style={{ color: TIER_COLORS_DARK[tier] }}
                        >
                          {PILL_LABELS[tier]}
                        </p>
                        <div className="space-y-1.5">
                          {items.map(({ subcategory }) => (
                            <div key={subcategory}>
                              <button
                                onClick={() => setPeekItem(peekItem === subcategory ? null : subcategory)}
                                className="w-full flex items-center gap-2.5 py-2 px-3 rounded-xl transition-all active:scale-[0.98]"
                                style={{
                                  background: peekItem === subcategory ? `${MENU_TIER_COLORS[tier]}30` : `${MENU_TIER_COLORS[tier]}12`,
                                  border: `1.5px solid ${MENU_TIER_COLORS[tier]}40`,
                                }}
                              >
                                <span className="flex-1 text-left text-sm font-medium" style={{ color: 'rgba(0,0,0,0.72)' }}>
                                  {subcategory}
                                </span>
                                <span
                                  className="text-xs font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                                  style={{ background: `${MENU_TIER_COLORS[tier]}25`, color: TIER_COLORS_DARK[tier] }}
                                >
                                  ⓘ
                                </span>
                              </button>
                              {peekItem === subcategory && SUBCATEGORY_DEFINITIONS[subcategory] && (
                                <div
                                  className="ml-6 mr-1 mb-1.5 px-3 py-2 rounded-xl text-xs leading-relaxed"
                                  style={{
                                    background: `${MENU_TIER_COLORS[tier]}18`,
                                    color: 'rgba(0,0,0,0.5)',
                                    animation: 'tooltip-enter 0.15s ease-out',
                                  }}
                                >
                                  {SUBCATEGORY_DEFINITIONS[subcategory]}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
