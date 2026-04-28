'use client';

import { useState } from 'react';
import { Connection, Tier } from '../lib/types';
import { DEFAULT_CATEGORIES } from '../lib/categories';
import { MENU_TIER_COLORS } from '../lib/menu-categories';
import { SUBCATEGORY_DEFINITIONS } from '../lib/definitions';

interface HighlightsProps {
  connection: Connection;
  theirConnection?: Connection;
  theirName?: string;
}

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

const TIER_SCORE: Record<Tier, number> = {
  'must-have': 4,
  'open': 3,
  'maybe': 2,
  'off-limits': 1,
};

interface RatingItem {
  subcategory: string;
  tier: Tier;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
}

// Group items by category, preserving order of first appearance
function groupByCategory(items: RatingItem[]): { categoryId: string; categoryName: string; categoryColor: string; items: RatingItem[] }[] {
  const map = new Map<string, { categoryId: string; categoryName: string; categoryColor: string; items: RatingItem[] }>();
  for (const item of items) {
    if (!map.has(item.categoryId)) {
      map.set(item.categoryId, { categoryId: item.categoryId, categoryName: item.categoryName, categoryColor: item.categoryColor, items: [] });
    }
    map.get(item.categoryId)!.items.push(item);
  }
  return [...map.values()];
}

export default function Highlights({ connection, theirConnection, theirName }: HighlightsProps) {
  const [showYes, setShowYes] = useState(false);
  const [showConvo, setShowConvo] = useState(false);
  const [peekItem, setPeekItem] = useState<string | null>(null);

  const allRatings: RatingItem[] = connection.categories.flatMap((cat) => {
    const catDef = DEFAULT_CATEGORIES.find((c) => c.id === cat.categoryId);
    return cat.ratings.map((r) => ({
      ...r,
      categoryId: cat.categoryId,
      categoryName: catDef?.name || '',
      categoryColor: catDef?.color || '#ccc',
    }));
  });

  const hasTheirData = !!theirConnection;

  const theirRatings = new Map<string, Tier>();
  if (theirConnection) {
    for (const cat of theirConnection.categories) {
      for (const r of cat.ratings) {
        theirRatings.set(r.subcategory, r.tier);
      }
    }
  }

  let yesItems: RatingItem[];
  let convoItems: RatingItem[];

  if (hasTheirData) {
    yesItems = allRatings.filter((r) => {
      const theirTier = theirRatings.get(r.subcategory);
      return r.tier === 'must-have' && (theirTier === 'must-have' || theirTier === 'open');
    });
    convoItems = allRatings.filter((r) => {
      const theirTier = theirRatings.get(r.subcategory);
      if (!theirTier) return false;
      const myPositive = r.tier === 'must-have' || r.tier === 'open';
      const theirPositive = theirTier === 'must-have' || theirTier === 'open';
      return myPositive !== theirPositive;
    });
    yesItems.sort((a, b) => {
      const aScore = TIER_SCORE[a.tier] + TIER_SCORE[theirRatings.get(a.subcategory) || 'off-limits'];
      const bScore = TIER_SCORE[b.tier] + TIER_SCORE[theirRatings.get(b.subcategory) || 'off-limits'];
      return bScore - aScore;
    });
    convoItems.sort((a, b) => {
      const aGap = Math.abs(TIER_SCORE[a.tier] - TIER_SCORE[theirRatings.get(a.subcategory) || 'off-limits']);
      const bGap = Math.abs(TIER_SCORE[b.tier] - TIER_SCORE[theirRatings.get(b.subcategory) || 'off-limits']);
      return bGap - aGap;
    });
  } else {
    yesItems = allRatings
      .filter((r) => r.tier === 'must-have')
      .sort((a, b) => TIER_SCORE[b.tier] - TIER_SCORE[a.tier]);
    convoItems = allRatings
      .filter((r) => r.tier === 'off-limits' || r.tier === 'maybe')
      .sort((a, b) => TIER_SCORE[a.tier] - TIER_SCORE[b.tier]);
  }

  if (yesItems.length === 0 && convoItems.length === 0) return null;

  const yesGroups = groupByCategory(yesItems);
  const convoGroups = groupByCategory(convoItems);

  // Get initials for pill labels
  const myInitial = connection.name?.[0]?.toUpperCase() || 'A';
  const theirInitial = theirName?.[0]?.toUpperCase() || 'B';

  const renderGroupedItems = (groups: ReturnType<typeof groupByCategory>, showBothPills?: boolean) => (
    <div className="px-4 py-3 space-y-2.5">
      {groups.map((group) => (
        <div
          key={group.categoryId}
          className="rounded-xl px-3 py-2.5"
          style={{ background: `${group.categoryColor}12` }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
            style={{ color: group.categoryColor }}
          >
            {group.categoryName}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const theirTier = theirRatings.get(item.subcategory);
              return (
                <div key={item.subcategory}>
                  <button
                    onClick={() => setPeekItem(peekItem === item.subcategory ? null : item.subcategory)}
                    className="w-full flex items-center gap-2 py-1.5 px-1 rounded-lg transition-all active:scale-[0.99]"
                  >
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: TIER_COLORS_DARK[item.tier] }} />
                    <span className="flex-1 text-left text-sm" style={{ color: 'rgba(0,0,0,0.7)' }}>
                      {item.subcategory}
                    </span>
                    {showBothPills && hasTheirData && theirTier ? (
                      <div className="flex gap-1 shrink-0">
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{ background: `${MENU_TIER_COLORS[item.tier]}25`, color: TIER_COLORS_DARK[item.tier] }}
                        >
                          {myInitial}: {PILL_LABELS[item.tier]}
                        </span>
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{ background: `${MENU_TIER_COLORS[theirTier]}25`, color: TIER_COLORS_DARK[theirTier] }}
                        >
                          {theirInitial}: {PILL_LABELS[theirTier]}
                        </span>
                      </div>
                    ) : (
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: `${MENU_TIER_COLORS[item.tier]}25`, color: TIER_COLORS_DARK[item.tier] }}
                      >
                        {PILL_LABELS[item.tier]}
                      </span>
                    )}
                  </button>
                  {peekItem === item.subcategory && (
                    <div className="ml-6 mr-1 mb-1.5 px-3 py-2 rounded-xl text-xs leading-relaxed"
                      style={{ background: `${MENU_TIER_COLORS[item.tier]}18`, color: 'rgba(0,0,0,0.5)', animation: 'tooltip-enter 0.15s ease-out' }}>
                      {SUBCATEGORY_DEFINITIONS[item.subcategory] && (
                        <p>{SUBCATEGORY_DEFINITIONS[item.subcategory]}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="px-1 mb-1">
        <h2 className="text-2xl font-extrabold uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.7)' }}>
          Highlights
        </h2>
        {hasTheirData && theirName && (
          <p className="text-xs" style={{ color: 'rgba(0,0,0,0.4)' }}>
            Comparing your view with {theirName}
          </p>
        )}
      </div>

      {/* Easy Yes's */}
      {yesItems.length > 0 && (
        <div className="rounded-2xl overflow-hidden">
          <button
            onClick={() => { setShowYes(!showYes); setPeekItem(null); }}
            className="w-full text-left px-5 py-5 transition-all active:scale-[0.99]"
            style={{ background: '#009483' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-extrabold uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.75)' }}>
                  Easy Yes&apos;s
                </h3>
                <p className="text-xs mt-1" style={{ color: 'rgba(0,0,0,0.4)' }}>
                  {hasTheirData
                    ? `${yesItems.length} thing${yesItems.length !== 1 ? 's' : ''} you both want`
                    : `${yesItems.length} thing${yesItems.length !== 1 ? 's' : ''} you're a yes for`
                  }
                </p>
              </div>
              <span className="text-sm" style={{ color: 'rgba(0,0,0,0.3)' }}>
                {showYes ? '▲' : '▼'}
              </span>
            </div>
          </button>
          {showYes && (
            <div className="bg-white border-x border-b border-black/5 rounded-b-2xl" style={{ animation: 'tooltip-enter 0.2s ease-out' }}>
              {renderGroupedItems(yesGroups)}
            </div>
          )}
        </div>
      )}

      {/* Worth a Conversation */}
      {convoItems.length > 0 && (
        <div className="rounded-2xl overflow-hidden">
          <button
            onClick={() => { setShowConvo(!showConvo); setPeekItem(null); }}
            className="w-full text-left px-5 py-5 transition-all active:scale-[0.99]"
            style={{ background: '#FF9448' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-extrabold uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.75)' }}>
                  Worth a Conversation
                </h3>
                <p className="text-xs mt-1" style={{ color: 'rgba(0,0,0,0.4)' }}>
                  {hasTheirData
                    ? `${convoItems.length} thing${convoItems.length !== 1 ? 's' : ''} you see differently`
                    : `${convoItems.length} thing${convoItems.length !== 1 ? 's' : ''} you're not a yes for`
                  }
                </p>
              </div>
              <span className="text-sm" style={{ color: 'rgba(0,0,0,0.3)' }}>
                {showConvo ? '▲' : '▼'}
              </span>
            </div>
          </button>
          {showConvo && (
            <div className="bg-white border-x border-b border-black/5 rounded-b-2xl" style={{ animation: 'tooltip-enter 0.2s ease-out' }}>
              {renderGroupedItems(convoGroups, true)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
