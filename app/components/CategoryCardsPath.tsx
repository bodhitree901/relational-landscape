'use client';

import { useState } from 'react';
import { Connection, Tier, TIER_ORDER } from '../lib/types';
import { DEFAULT_CATEGORIES } from '../lib/categories';
import { MENU_TIER_COLORS } from '../lib/menu-categories';
import { SUBCATEGORY_DEFINITIONS } from '../lib/definitions';

// ── helpers ────────────────────────────────────────────────────────────────

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b] as const;
}

const TIER_COLORS_DARK: Record<Tier, string> = {
  'must-have': '#007A6B',
  'open': '#5BA84D',
  'maybe': '#B8A520',
  'off-limits': '#D47020',
};

const PILL_LABELS: Record<Tier, string> = {
  'must-have': 'Actively Want',
  'open': 'Open To',
  'maybe': 'Not Sure',
  'off-limits': 'Not Relevant',
};

interface DimensionRow {
  subcategory: string;
  myTier: Tier;
  theirTier?: Tier;
  aligned?: boolean;
}

interface CatData {
  id: string;
  name: string;
  color: string;
  positiveRatio: number;
  totalRated: number;
  positiveCount: number;
  dimensions: DimensionRow[];
}

// ── props ──────────────────────────────────────────────────────────────────

interface Props {
  myConnection: Connection;
  theirConnection?: Connection;
  myName?: string;
  theirName?: string;
}

// ── popup heatmap ──────────────────────────────────────────────────────────

function CategoryPopup({
  cat,
  myName,
  theirName,
  onClose,
}: {
  cat: CatData;
  myName?: string;
  theirName?: string;
  onClose: () => void;
}) {
  const [peekItem, setPeekItem] = useState<string | null>(null);
  const [r, g, b] = hexToRgb(cat.color);
  const isShared = !!theirName;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
        style={{
          background: 'var(--background)',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
          maxHeight: '78vh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.28s cubic-bezier(0.34,1.2,0.64,1)',
        }}
      >
        {/* Handle + header */}
        <div
          className="px-6 pt-4 pb-4 shrink-0"
          style={{ background: `linear-gradient(135deg, rgba(${r},${g},${b},0.22), rgba(${r},${g},${b},0.10))` }}
        >
          <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: `rgba(${r},${g},${b},0.4)` }} />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.75)' }}>
                {cat.name}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(0,0,0,0.35)' }}>
                {isShared
                  ? `${cat.positiveCount} of ${cat.totalRated} aligned`
                  : `${cat.positiveCount} of ${cat.totalRated} positive`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
              style={{ background: `rgba(${r},${g},${b},0.15)`, color: 'rgba(0,0,0,0.4)' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-5 pb-8 pt-3 space-y-1.5">
          {isShared ? (
            // Shared heatmap: two initials
            <>
              <div className="flex items-center mb-3 pl-28">
                {TIER_ORDER.map((tier) => (
                  <div key={tier} className="w-12 text-center">
                    <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: TIER_COLORS_DARK[tier] }}>
                      {tier === 'must-have' ? 'Want' : tier === 'open' ? 'Open' : tier === 'maybe' ? 'Maybe' : 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
              {cat.dimensions.map((dim) => (
                <div key={dim.subcategory}>
                  <button
                    onClick={() => setPeekItem(peekItem === dim.subcategory ? null : dim.subcategory)}
                    className="w-full flex items-center py-1.5 px-2 rounded-xl transition-all active:scale-[0.98]"
                    style={{
                      background: peekItem === dim.subcategory ? `rgba(${r},${g},${b},0.12)` : `rgba(${r},${g},${b},0.06)`,
                      border: `1.5px solid rgba(${r},${g},${b},0.18)`,
                    }}
                  >
                    <span className="text-[10px] font-semibold mr-1.5 shrink-0 px-1 py-0.5 rounded-full" style={{ background: `rgba(${r},${g},${b},0.15)`, color: `rgba(${r},${g},${b},1)` }}>ⓘ</span>
                    <span className="flex-1 text-left text-xs font-medium pr-2" style={{ color: 'rgba(0,0,0,0.72)', width: 96 }}>
                      {dim.subcategory}
                    </span>
                    <div className="flex">
                      {TIER_ORDER.map((tier) => (
                        <div key={tier} className="w-12 flex items-center justify-center gap-0.5">
                          {dim.myTier === tier && (
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: TIER_COLORS_DARK[tier] }}>
                              {myName?.[0]?.toUpperCase() || 'A'}
                            </span>
                          )}
                          {dim.theirTier === tier && (
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border-2" style={{ borderColor: TIER_COLORS_DARK[tier], color: TIER_COLORS_DARK[tier], background: `${MENU_TIER_COLORS[tier]}20` }}>
                              {theirName?.[0]?.toUpperCase() || 'B'}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </button>
                  {peekItem === dim.subcategory && SUBCATEGORY_DEFINITIONS[dim.subcategory] && (
                    <div className="ml-2 mr-1 mb-1 px-3 py-2 rounded-xl text-xs leading-relaxed" style={{ background: `rgba(${r},${g},${b},0.08)`, color: 'rgba(0,0,0,0.5)', animation: 'tooltip-enter 0.15s ease-out' }}>
                      {SUBCATEGORY_DEFINITIONS[dim.subcategory]}
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            // Single-person tier groups
            TIER_ORDER.map((tier) => {
              const items = cat.dimensions.filter((d) => d.myTier === tier);
              if (items.length === 0) return null;
              return (
                <div key={tier} className="rounded-xl px-3 py-2.5 mb-2" style={{ background: `${MENU_TIER_COLORS[tier]}12` }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: TIER_COLORS_DARK[tier] }}>
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
                          <span className="flex-1 text-left text-sm font-medium" style={{ color: 'rgba(0,0,0,0.72)' }}>{subcategory}</span>
                          <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: `${MENU_TIER_COLORS[tier]}25`, color: TIER_COLORS_DARK[tier] }}>ⓘ</span>
                        </button>
                        {peekItem === subcategory && SUBCATEGORY_DEFINITIONS[subcategory] && (
                          <div className="ml-2 mr-1 mb-1 px-3 py-2 rounded-xl text-xs leading-relaxed" style={{ background: `${MENU_TIER_COLORS[tier]}18`, color: 'rgba(0,0,0,0.5)', animation: 'tooltip-enter 0.15s ease-out' }}>
                            {SUBCATEGORY_DEFINITIONS[subcategory]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
      `}</style>
    </>
  );
}

// ── main component ─────────────────────────────────────────────────────────

export default function CategoryCardsPath({ myConnection, theirConnection, myName, theirName }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const theirRatingsMap = new Map<string, Map<string, Tier>>();
  if (theirConnection) {
    for (const cat of theirConnection.categories) {
      const m = new Map<string, Tier>();
      for (const r of cat.ratings) m.set(r.subcategory, r.tier);
      theirRatingsMap.set(cat.categoryId, m);
    }
  }

  const categories: CatData[] = myConnection.categories
    .map((cat) => {
      const catDef = DEFAULT_CATEGORIES.find((c) => c.id === cat.categoryId);
      if (!catDef || cat.ratings.length === 0) return null;

      const theirCat = theirRatingsMap.get(cat.categoryId) || new Map<string, Tier>();
      const myMap = new Map<string, Tier>();
      cat.ratings.forEach((r) => myMap.set(r.subcategory, r.tier));

      const allDims = new Set<string>();
      cat.ratings.forEach((r) => allDims.add(r.subcategory));
      theirCat.forEach((_, k) => allDims.add(k));

      const dimensions: DimensionRow[] = [];
      for (const dim of allDims) {
        const myTier = myMap.get(dim) || 'off-limits';
        const theirTier = theirConnection ? (theirCat.get(dim) || 'off-limits') : undefined;
        const myPos = myTier === 'must-have' || myTier === 'open';
        const theirPos = theirTier ? (theirTier === 'must-have' || theirTier === 'open') : false;
        dimensions.push({ subcategory: dim, myTier, theirTier, aligned: theirTier !== undefined ? myPos === theirPos : myPos });
      }

      const positiveCount = theirConnection
        ? dimensions.filter((d) => d.aligned).length
        : dimensions.filter((d) => d.myTier === 'must-have' || d.myTier === 'open').length;
      const positiveRatio = dimensions.length > 0 ? positiveCount / dimensions.length : 0;

      return {
        id: cat.categoryId,
        name: catDef.name,
        color: catDef.color,
        positiveRatio,
        totalRated: dimensions.length,
        positiveCount,
        dimensions,
      };
    })
    .filter(Boolean) as CatData[];

  const activeCat = categories.find((c) => c.id === activeId) || null;

  return (
    <>
      <div className="relative px-4 py-2">
        {/* Winding path SVG */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
          style={{ zIndex: 0 }}
        >
          <defs>
            <linearGradient id="pathGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(0,0,0,0.04)" />
              <stop offset="50%" stopColor="rgba(0,0,0,0.08)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.04)" />
            </linearGradient>
          </defs>
          {/* Simple winding dotted centre line */}
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="url(#pathGrad)" strokeWidth="2" strokeDasharray="6 8" />
        </svg>

        <div className="relative" style={{ zIndex: 1 }}>
          {categories.map((cat, i) => {
            const isLeft = i % 2 === 0;
            const [r, g, b] = hexToRgb(cat.color);
            const alpha = 0.28 + (1 - cat.positiveRatio) * 0.58;
            const size = 88 + Math.round(cat.positiveRatio * 20); // bigger = more positive

            return (
              <div
                key={cat.id}
                className={`flex mb-6 ${isLeft ? 'justify-start pl-4' : 'justify-end pr-4'}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => setActiveId(cat.id)}
                    className="rounded-full flex flex-col items-center justify-center transition-all active:scale-95"
                    style={{
                      width: size,
                      height: size,
                      background: `radial-gradient(circle at 35% 35%, rgba(${r},${g},${b},${(alpha * 0.6).toFixed(2)}), rgba(${r},${g},${b},${alpha.toFixed(2)}))`,
                      boxShadow: `0 6px 24px rgba(${r},${g},${b},${(alpha * 0.55).toFixed(2)}), inset 0 -3px 8px rgba(${r},${g},${b},0.2), 0 0 0 2px rgba(255,255,255,0.7)`,
                    }}
                  >
                    {/* Alignment ring */}
                    <svg width={size} height={size} className="absolute" style={{ top: 0, left: 0 }}>
                      <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={size / 2 - 4}
                        fill="none"
                        stroke={`rgba(255,255,255,0.5)`}
                        strokeWidth="2"
                        strokeDasharray={`${Math.round(cat.positiveRatio * Math.PI * (size - 8))} ${Math.round(Math.PI * (size - 8))}`}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                      />
                    </svg>
                    <span
                      className="text-[10px] font-extrabold uppercase tracking-wide text-center leading-tight px-2 relative"
                      style={{ color: 'rgba(0,0,0,0.72)', maxWidth: size - 16 }}
                    >
                      {cat.name}
                    </span>
                    <span
                      className="text-[9px] mt-1 font-medium relative"
                      style={{ color: 'rgba(0,0,0,0.4)' }}
                    >
                      {cat.positiveCount}/{cat.totalRated}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Popup */}
      {activeCat && (
        <CategoryPopup
          cat={activeCat}
          myName={myName}
          theirName={theirName}
          onClose={() => setActiveId(null)}
        />
      )}
    </>
  );
}
