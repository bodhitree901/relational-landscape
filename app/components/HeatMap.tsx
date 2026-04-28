'use client';

import { useState } from 'react';
import { Connection, TIER_ORDER, Tier } from '../lib/types';
import { DEFAULT_CATEGORIES } from '../lib/categories';
import { MENU_TIER_COLORS, MENU_TIER_LABELS } from '../lib/menu-categories';
import { SUBCATEGORY_DEFINITIONS } from '../lib/definitions';

interface HeatMapProps {
  connection: Connection;
}

interface PopupData {
  tier?: Tier;        // if set, filter to this tier
  categoryId?: string; // if set, filter to this category
}

export default function HeatMap({ connection }: HeatMapProps) {
  const [popup, setPopup] = useState<PopupData | null>(null);
  const [peekRow, setPeekRow] = useState<string | null>(null);

  // Build category data with items per tier
  const categoryData = connection.categories
    .map((cat) => {
      const catDef = DEFAULT_CATEGORIES.find((c) => c.id === cat.categoryId);
      if (!catDef || cat.ratings.length === 0) return null;
      const itemTierMap = new Map<string, Tier>();
      cat.ratings.forEach((r) => {
        itemTierMap.set(r.subcategory, r.tier);
      });
      const tierCounts: Record<Tier, number> = { 'must-have': 0, 'open': 0, 'maybe': 0, 'off-limits': 0 };
      cat.ratings.forEach((r) => { tierCounts[r.tier]++; });
      return {
        id: cat.categoryId,
        name: catDef.name,
        color: catDef.color,
        itemTierMap,
        tierCounts,
        allItems: catDef.subcategories,
        ratedCount: cat.ratings.length,
      };
    })
    .filter(Boolean) as {
      id: string;
      name: string;
      color: string;
      itemTierMap: Map<string, Tier>;
      tierCounts: Record<Tier, number>;
      allItems: string[];
      ratedCount: number;
    }[];

  if (categoryData.length === 0) return null;

  const maxCount = Math.max(
    ...categoryData.flatMap((c) => TIER_ORDER.map((t) => c.tierCounts[t])),
    1
  );

  // Get rows for popup detail view
  const getPopupRows = (): { categoryName: string; color: string; items: { name: string; tier: Tier }[] }[] => {
    if (!popup) return [];

    return categoryData
      .filter((c) => !popup.categoryId || c.id === popup.categoryId)
      .map((c) => {
        const items: { name: string; tier: Tier }[] = [];
        c.itemTierMap.forEach((tier, name) => {
          if (!popup.tier || tier === popup.tier) {
            items.push({ name, tier });
          }
        });
        return { categoryName: c.name, color: c.color, items };
      })
      .filter((g) => g.items.length > 0);
  };

  const handleCellTap = (tier: Tier, categoryId: string, count: number) => {
    if (count === 0) return;
    setPopup({ tier, categoryId });
    setPeekRow(null);
  };

  const handleTotalTap = (tier: Tier, total: number) => {
    if (total === 0) return;
    setPopup({ tier });
    setPeekRow(null);
  };

  // Title for the popup
  const getPopupTitle = (): string => {
    if (!popup) return '';
    const tierLabel = popup.tier ? MENU_TIER_LABELS[popup.tier] : 'All';
    if (popup.categoryId) {
      const cat = categoryData.find((c) => c.id === popup.categoryId);
      return cat ? `${cat.name}` : tierLabel;
    }
    return tierLabel;
  };

  return (
    <div className="w-full">
      {/* Tier column headers */}
      <div className="flex mb-2 pl-[100px]">
        {TIER_ORDER.map((tier) => (
          <div key={tier} className="flex-1 text-center">
            <span
              className="text-[10px] font-semibold leading-tight block"
              style={{ color: MENU_TIER_COLORS[tier] }}
            >
              {MENU_TIER_LABELS[tier]}
            </span>
          </div>
        ))}
      </div>

      {/* Category rows */}
      <div className="space-y-1.5">
        {categoryData.map((cat) => (
          <div key={cat.id} className="flex items-center gap-2">
            <div className="w-[100px] shrink-0 text-right pr-2">
              <span className="text-[11px] font-medium leading-tight" style={{ color: 'rgba(0,0,0,0.65)' }}>
                {cat.name}
              </span>
            </div>
            <div className="flex-1 flex gap-1">
              {TIER_ORDER.map((tier) => {
                const count = cat.tierCounts[tier];
                const intensity = count / maxCount;
                const tierColor = MENU_TIER_COLORS[tier];
                return (
                  <button
                    key={tier}
                    onClick={() => handleCellTap(tier, cat.id, count)}
                    className="flex-1 rounded-lg flex items-center justify-center transition-transform active:scale-95"
                    style={{
                      height: 38,
                      background: count > 0
                        ? `${tierColor}${Math.round(intensity * 200 + 20).toString(16).padStart(2, '0')}`
                        : 'rgba(0,0,0,0.03)',
                      transition: 'background 0.3s ease',
                      cursor: count > 0 ? 'pointer' : 'default',
                    }}
                  >
                    {count > 0 && (
                      <span
                        className="text-xs font-bold"
                        style={{
                          color: intensity > 0.5 ? 'white' : 'rgba(0,0,0,0.6)',
                        }}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Totals row */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-black/5">
        <div className="w-[100px] shrink-0 text-right pr-2">
          <span className="text-[10px] font-medium" style={{ color: 'rgba(0,0,0,0.4)' }}>Total</span>
        </div>
        <div className="flex-1 flex gap-1">
          {TIER_ORDER.map((tier) => {
            const total = categoryData.reduce((sum, c) => sum + c.tierCounts[tier], 0);
            return (
              <button
                key={tier}
                onClick={() => handleTotalTap(tier, total)}
                className="flex-1 text-center py-1.5 rounded-lg transition-all active:scale-95"
                style={{
                  cursor: total > 0 ? 'pointer' : 'default',
                  background: total > 0 ? `${MENU_TIER_COLORS[tier]}12` : 'transparent',
                  border: total > 0 ? `1.5px dashed ${MENU_TIER_COLORS[tier]}50` : '1.5px dashed transparent',
                }}
              >
                <span className="text-xs font-bold" style={{ color: MENU_TIER_COLORS[tier] }}>
                  {total}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail popup — same heatmap style */}
      {popup && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            style={{ backdropFilter: 'blur(2px)' }}
            onClick={() => { setPopup(null); setPeekRow(null); }}
          />
          <div
            className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-md max-h-[75vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-black/5"
            style={{ animation: 'tooltip-enter 0.2s ease-out' }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 px-4 py-3 border-b border-black/5 bg-white/95 backdrop-blur-sm flex items-center justify-between">
              <p className="text-sm font-semibold" style={{ color: 'rgba(0,0,0,0.75)' }}>{getPopupTitle()}</p>
              <button
                onClick={() => { setPopup(null); setPeekRow(null); }}
                className="text-sm opacity-30 hover:opacity-60 p-1"
              >
                ✕
              </button>
            </div>

            {/* Tier column headers inside popup */}
            <div className="sticky top-[49px] z-10 bg-white/95 backdrop-blur-sm px-4 pt-2 pb-1">
              <div className="flex pl-[110px]">
                {TIER_ORDER.map((tier) => (
                  <div key={tier} className="flex-1 text-center">
                    <span
                      className="text-[9px] font-semibold leading-tight block"
                      style={{ color: MENU_TIER_COLORS[tier] }}
                    >
                      {MENU_TIER_LABELS[tier]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Detail rows */}
            <div className="px-4 pb-4 pt-1">
              {getPopupRows().map(({ categoryName, color, items }) => (
                <div key={categoryName} className="mb-3">
                  {/* Category label (only show if viewing across categories) */}
                  {!popup.categoryId && (
                    <p className="text-[10px] font-semibold mb-1.5 mt-1" style={{ color }}>
                      {categoryName}
                    </p>
                  )}

                  {/* Each dimension as a heatmap row */}
                  <div className="space-y-1">
                    {items.map(({ name, tier }) => (
                      <div key={name}>
                        <button
                          onClick={() => setPeekRow(peekRow === name ? null : name)}
                          className="w-full flex items-center gap-1.5 transition-transform active:scale-[0.99]"
                        >
                          {/* Dimension name */}
                          <div className="w-[110px] shrink-0 text-right pr-2">
                            <span className="text-[10px] leading-tight font-medium" style={{ color: 'rgba(0,0,0,0.6)' }}>
                              {name}
                            </span>
                          </div>

                          {/* Tier cells — one filled, rest empty */}
                          <div className="flex-1 flex gap-1">
                            {TIER_ORDER.map((t) => (
                              <div
                                key={t}
                                className="flex-1 rounded"
                                style={{
                                  height: 22,
                                  background: t === tier
                                    ? `${MENU_TIER_COLORS[t]}BB`
                                    : 'rgba(0,0,0,0.025)',
                                  transition: 'all 0.2s ease',
                                }}
                              />
                            ))}
                          </div>
                        </button>

                        {/* Definition peek */}
                        {peekRow === name && SUBCATEGORY_DEFINITIONS[name] && (
                          <div
                            className="ml-[110px] mt-1 mb-1.5 px-3 py-2 rounded-xl text-[11px] leading-relaxed"
                            style={{
                              background: `${MENU_TIER_COLORS[tier]}10`,
                              color: 'rgba(0,0,0,0.5)',
                              animation: 'tooltip-enter 0.15s ease-out',
                            }}
                          >
                            {SUBCATEGORY_DEFINITIONS[name]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
