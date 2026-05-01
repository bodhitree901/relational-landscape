'use client';

import { useMemo, useState } from 'react';
import { Connection, Tier, TIER_ORDER } from '../lib/types';
import { DEFAULT_CATEGORIES } from '../lib/categories';
import { SUBCATEGORY_DEFINITIONS } from '../lib/definitions';

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b] as const;
}

const TIER_COLORS: Record<Tier, string> = {
  'must-have': '#007A6B',
  'open': '#5BA84D',
  'maybe': '#B8A520',
  'off-limits': '#D47020',
};

const TIER_BG: Record<Tier, string> = {
  'must-have': '#E6F4F1',
  'open': '#EBF5E8',
  'maybe': '#FAF6DC',
  'off-limits': '#FAF0E6',
};

const TIER_SHORT: Record<Tier, string> = {
  'must-have': 'Want',
  'open': 'Open',
  'maybe': 'Unsure',
  'off-limits': 'N/A',
};

interface DimData {
  subcategory: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  myTier: Tier;
  theirTier: Tier;
}

interface CatScore {
  id: string;
  name: string;
  color: string;
  alignedCount: number;
  totalCount: number;
  ratio: number;
  dims: DimData[];
}

function isPositive(t: Tier) {
  return t === 'must-have' || t === 'open';
}

function generateSentence(
  greenZone: DimData[],
  tension: DimData[],
  catScores: CatScore[],
  myName: string,
  theirName: string,
): string {
  const sorted = [...catScores].sort((a, b) => b.ratio - a.ratio);
  const topCat = sorted[0];
  const bottomCat = sorted[sorted.length - 1];
  const totalDims = catScores.reduce((s, c) => s + c.totalCount, 0);
  const totalAligned = catScores.reduce((s, c) => s + c.alignedCount, 0);
  const pct = totalDims > 0 ? Math.round((totalAligned / totalDims) * 100) : 0;

  const mutual = greenZone.filter((d) => d.myTier === 'must-have' && d.theirTier === 'must-have');
  const anchor = mutual[0]?.subcategory;
  const anchor2 = mutual[1]?.subcategory;

  if (pct >= 68) {
    return `${myName} and ${theirName} are deeply aligned — especially in ${topCat?.name || 'most areas'}. ${anchor && anchor2 ? `${anchor} and ${anchor2} stand out as shared anchors.` : anchor ? `${anchor} is a clear shared anchor.` : "There's a lot of mutual yes here."}`;
  } else if (pct >= 42) {
    return `This connection has real depth in ${topCat?.name || 'several areas'}${anchor ? `, with ${anchor} as a touchstone both of you share` : ''}. ${bottomCat && bottomCat.id !== topCat?.id ? `${bottomCat.name} holds the most room for honest conversation.` : ''}`.trim();
  } else {
    return `${myName} and ${theirName} are navigating real differences — the strongest common ground lives in ${topCat?.name || 'a few areas'}. ${tension.length > 0 ? 'A few honest conversations could open a lot of doors.' : ''}`;
  }
}

// ── Category Heatmap Popup ──────────────────────────────────────────────────

function CategoryHeatmapPopup({
  cat,
  myInitial,
  theirInitial,
  onClose,
}: {
  cat: CatScore;
  myInitial: string;
  theirInitial: string;
  onClose: () => void;
}) {
  const [peekItem, setPeekItem] = useState<string | null>(null);
  const [r, g, b] = hexToRgb(cat.color);
  const pct = Math.round(cat.ratio * 100);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
        style={{
          background: 'var(--background)',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.28s cubic-bezier(0.34,1.2,0.64,1)',
        }}
      >
        {/* Header */}
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
                {cat.alignedCount} of {cat.totalCount} aligned · {pct}%
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

        {/* Column headers */}
        <div className="px-5 pt-3 pb-1 shrink-0">
          <div className="flex items-center">
            <div className="flex-1" />
            {TIER_ORDER.map((tier) => (
              <div key={tier} className="w-11 text-center">
                <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: TIER_COLORS[tier] }}>
                  {TIER_SHORT[tier]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div className="overflow-y-auto px-5 pb-8 pt-1 space-y-1.5">
          {cat.dims.map((dim) => {
            const aligned = isPositive(dim.myTier) === isPositive(dim.theirTier);
            return (
              <div key={dim.subcategory}>
                <button
                  onClick={() => setPeekItem(peekItem === dim.subcategory ? null : dim.subcategory)}
                  className="w-full flex items-center py-1.5 px-2 rounded-xl transition-all active:scale-[0.98]"
                  style={{
                    background: peekItem === dim.subcategory
                      ? `rgba(${r},${g},${b},0.12)`
                      : aligned
                        ? `rgba(91,168,77,0.06)`
                        : `rgba(${r},${g},${b},0.04)`,
                    border: `1.5px solid ${aligned ? 'rgba(91,168,77,0.2)' : `rgba(${r},${g},${b},0.12)`}`,
                  }}
                >
                  <span
                    className="text-[10px] font-semibold mr-1.5 shrink-0 px-1 py-0.5 rounded-full"
                    style={{ background: `rgba(${r},${g},${b},0.15)`, color: `rgba(${r},${g},${b},1)` }}
                  >
                    ⓘ
                  </span>
                  <span className="flex-1 text-left text-xs font-medium pr-2" style={{ color: 'rgba(0,0,0,0.72)' }}>
                    {dim.subcategory}
                  </span>
                  <div className="flex">
                    {TIER_ORDER.map((tier) => (
                      <div key={tier} className="w-11 flex items-center justify-center gap-0.5">
                        {dim.myTier === tier && (
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                            style={{ background: TIER_COLORS[tier] }}
                          >
                            {myInitial}
                          </span>
                        )}
                        {dim.theirTier === tier && (
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border-2"
                            style={{
                              borderColor: TIER_COLORS[tier],
                              color: TIER_COLORS[tier],
                              background: TIER_BG[tier],
                            }}
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
                    className="ml-2 mr-1 mb-1 px-3 py-2 rounded-xl text-xs leading-relaxed"
                    style={{ background: `rgba(${r},${g},${b},0.08)`, color: 'rgba(0,0,0,0.5)', animation: 'tooltip-enter 0.15s ease-out' }}
                  >
                    {SUBCATEGORY_DEFINITIONS[dim.subcategory]}
                  </div>
                )}
              </div>
            );
          })}
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

// ── Main Component ──────────────────────────────────────────────────────────

interface Props {
  myConnection: Connection;
  theirConnection: Connection;
  myName: string;
  theirName: string;
}

export default function ComparisonSummaryProto({ myConnection, theirConnection, myName, theirName }: Props) {
  const myInitial = myName[0]?.toUpperCase() || 'A';
  const theirInitial = theirName[0]?.toUpperCase() || 'B';
  const [activeCatId, setActiveCatId] = useState<string | null>(null);

  const { catScores, greenZone, tension, worthConvo, sharedNonWants } = useMemo(() => {
    const theirMap = new Map<string, Map<string, Tier>>();
    for (const cat of theirConnection.categories) {
      const m = new Map<string, Tier>();
      for (const r of cat.ratings) m.set(r.subcategory, r.tier);
      theirMap.set(cat.categoryId, m);
    }

    const allDims: DimData[] = [];
    const catScores: CatScore[] = [];

    for (const cat of myConnection.categories) {
      const catDef = DEFAULT_CATEGORIES.find((c) => c.id === cat.categoryId);
      if (!catDef) continue;

      const theirCat = theirMap.get(cat.categoryId) || new Map<string, Tier>();
      const myMap = new Map<string, Tier>();
      for (const r of cat.ratings) myMap.set(r.subcategory, r.tier);

      const allKeys = new Set<string>();
      cat.ratings.forEach((r) => allKeys.add(r.subcategory));
      theirCat.forEach((_, k) => allKeys.add(k));

      const dims: DimData[] = [];
      let aligned = 0;
      for (const dim of allKeys) {
        const myTier = myMap.get(dim) || 'off-limits';
        const theirTier = theirCat.get(dim) || 'off-limits';
        if (isPositive(myTier) === isPositive(theirTier)) aligned++;
        const d: DimData = { subcategory: dim, categoryId: catDef.id, categoryName: catDef.name, categoryColor: catDef.color, myTier, theirTier };
        dims.push(d);
        allDims.push(d);
      }

      // Sort aligned first, then by combined tier score
      dims.sort((a, b) => {
        const aAligned = isPositive(a.myTier) === isPositive(a.theirTier);
        const bAligned = isPositive(b.myTier) === isPositive(b.theirTier);
        if (aAligned !== bAligned) return aAligned ? -1 : 1;
        const score = (d: DimData) => (isPositive(d.myTier) ? 2 : 0) + (isPositive(d.theirTier) ? 2 : 0);
        return score(b) - score(a);
      });

      if (allKeys.size > 0) {
        catScores.push({ id: catDef.id, name: catDef.name, color: catDef.color, alignedCount: aligned, totalCount: allKeys.size, ratio: aligned / allKeys.size, dims });
      }
    }

    const greenZone = allDims.filter((d) => isPositive(d.myTier) && isPositive(d.theirTier));
    const tension = allDims
      .filter((d) => isPositive(d.myTier) !== isPositive(d.theirTier))
      .sort((a, b) => {
        const score = (d: DimData) => (d.myTier === 'must-have' || d.theirTier === 'must-have' ? 2 : 0) + (d.myTier === 'off-limits' || d.theirTier === 'off-limits' ? 1 : 0);
        return score(b) - score(a);
      });
    const worthConvo = tension.filter(
      (d) => (d.myTier === 'must-have' && d.theirTier === 'off-limits') || (d.theirTier === 'must-have' && d.myTier === 'off-limits'),
    );
    const sharedNonWants = allDims.filter((d) => !isPositive(d.myTier) && !isPositive(d.theirTier));

    return { catScores, greenZone, tension, worthConvo, sharedNonWants };
  }, [myConnection, theirConnection]);

  const sentence = generateSentence(greenZone, tension, catScores, myName, theirName);
  const sortedCatScores = [...catScores].sort((a, b) => b.ratio - a.ratio);
  const activeCat = catScores.find((c) => c.id === activeCatId) || null;

  const myColorRgb = hexToRgb(myConnection.color || '#C5A3CF');
  const theirColorRgb = hexToRgb(theirConnection.color || '#89CFF0');

  return (
    <>
      <div className="space-y-5 pb-8">

        {/* ── AI Sentence ── */}
        <div
          className="mx-5 rounded-3xl px-6 py-7 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, rgba(${myColorRgb[0]},${myColorRgb[1]},${myColorRgb[2]},0.18) 0%, rgba(${theirColorRgb[0]},${theirColorRgb[1]},${theirColorRgb[2]},0.18) 100%)`,
            border: '1.5px solid rgba(255,255,255,0.7)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          <span
            className="absolute top-3 left-5 text-6xl leading-none select-none"
            style={{ color: `rgba(${myColorRgb[0]},${myColorRgb[1]},${myColorRgb[2]},0.2)`, fontFamily: 'Georgia, serif' }}
          >
            &ldquo;
          </span>
          <p
            className="text-base leading-relaxed text-center relative z-10 pt-3"
            style={{ fontFamily: 'Georgia, serif', color: 'rgba(0,0,0,0.72)', fontStyle: 'italic' }}
          >
            {sentence}
          </p>
          <p className="text-center text-xs mt-4 font-medium" style={{ color: 'rgba(0,0,0,0.3)' }}>
            {myName} &amp; {theirName}
          </p>
        </div>

        {/* ── Category Overlap Scores (tappable) ── */}
        <div>
          <p className="px-6 text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(0,0,0,0.3)' }}>
            Alignment by Area · tap to explore
          </p>
          <div className="flex gap-3 px-5 overflow-x-auto pb-1">
            {sortedCatScores.map((cat) => {
              const [r, g, b] = hexToRgb(cat.color);
              const pct = Math.round(cat.ratio * 100);
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCatId(cat.id)}
                  className="shrink-0 flex flex-col items-center justify-center rounded-2xl px-3 py-4 transition-all active:scale-95"
                  style={{
                    width: 80,
                    background: `rgba(${r},${g},${b},${0.12 + (1 - cat.ratio) * 0.12})`,
                    border: `1.5px solid rgba(${r},${g},${b},0.25)`,
                    boxShadow: `0 2px 10px rgba(${r},${g},${b},0.12)`,
                  }}
                >
                  <span className="text-2xl font-extrabold leading-none" style={{ color: `rgba(${r},${g},${b},1)` }}>
                    {pct}<span className="text-xs font-bold">%</span>
                  </span>
                  <span
                    className="text-[9px] font-semibold uppercase tracking-wide text-center mt-1.5 leading-tight"
                    style={{ color: 'rgba(0,0,0,0.45)' }}
                  >
                    {cat.name}
                  </span>
                  <span className="text-[9px] mt-1" style={{ color: `rgba(${r},${g},${b},0.7)` }}>tap ↓</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Green Zone ── */}
        {greenZone.length > 0 && (
          <div className="mx-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full" style={{ background: '#5BA84D' }} />
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.3)' }}>
                The Green Zone
              </p>
              <span className="text-[10px]" style={{ color: 'rgba(0,0,0,0.2)' }}>{greenZone.length} shared yes&apos;s</span>
            </div>
            <div
              className="rounded-3xl px-5 py-5"
              style={{ background: 'rgba(91,168,77,0.07)', border: '1.5px solid rgba(91,168,77,0.2)' }}
            >
              <div className="flex flex-wrap gap-2">
                {greenZone.map((d) => {
                  const [r, g, b] = hexToRgb(d.categoryColor);
                  const both = d.myTier === 'must-have' && d.theirTier === 'must-have';
                  return (
                    <div
                      key={`${d.categoryId}-${d.subcategory}`}
                      className="px-3 py-1.5 rounded-full text-xs font-medium"
                      style={{
                        background: both ? `rgba(${r},${g},${b},0.18)` : `rgba(${r},${g},${b},0.10)`,
                        border: `1.5px solid rgba(${r},${g},${b},${both ? 0.45 : 0.22})`,
                        color: 'rgba(0,0,0,0.65)',
                        boxShadow: both ? `0 2px 8px rgba(${r},${g},${b},0.18)` : 'none',
                      }}
                    >
                      {both && <span className="mr-1 text-[#007A6B]">✦</span>}
                      {d.subcategory}
                    </div>
                  );
                })}
              </div>
              {greenZone.some((d) => d.myTier === 'must-have' && d.theirTier === 'must-have') && (
                <p className="text-[10px] mt-3" style={{ color: 'rgba(0,0,0,0.3)' }}>✦ both actively want</p>
              )}
            </div>
          </div>
        )}

        {/* ── Tension Points ── */}
        {tension.length > 0 && (
          <div className="mx-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full" style={{ background: '#D47020' }} />
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.3)' }}>
                Tension Points
              </p>
              <span className="text-[10px]" style={{ color: 'rgba(0,0,0,0.2)' }}>{tension.length} differences</span>
            </div>
            <div
              className="rounded-3xl overflow-hidden"
              style={{ background: 'rgba(212,112,32,0.05)', border: '1.5px solid rgba(212,112,32,0.15)' }}
            >
              {tension.slice(0, 8).map((d, i) => {
                const [r, g, b] = hexToRgb(d.categoryColor);
                return (
                  <div
                    key={`${d.categoryId}-${d.subcategory}`}
                    className="flex items-center gap-3 px-5 py-3"
                    style={{ borderTop: i > 0 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: `rgba(${r},${g},${b},0.7)` }} />
                    <span className="flex-1 text-sm" style={{ color: 'rgba(0,0,0,0.65)' }}>{d.subcategory}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: TIER_BG[d.myTier], color: TIER_COLORS[d.myTier] }}
                      >
                        {myInitial}: {TIER_SHORT[d.myTier]}
                      </span>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: TIER_BG[d.theirTier], color: TIER_COLORS[d.theirTier] }}
                      >
                        {theirInitial}: {TIER_SHORT[d.theirTier]}
                      </span>
                    </div>
                  </div>
                );
              })}
              {tension.length > 8 && (
                <p className="text-center text-xs py-3" style={{ color: 'rgba(0,0,0,0.3)' }}>+{tension.length - 8} more</p>
              )}
            </div>
          </div>
        )}

        {/* ── Worth a Conversation ── */}
        {worthConvo.length > 0 && (
          <div className="mx-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full" style={{ background: '#9B6EAF' }} />
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.3)' }}>
                Worth a Conversation
              </p>
            </div>
            <div
              className="rounded-3xl px-5 py-4 space-y-2"
              style={{ background: 'rgba(155,110,175,0.06)', border: '1.5px solid rgba(155,110,175,0.18)' }}
            >
              <p className="text-xs mb-3" style={{ color: 'rgba(0,0,0,0.4)' }}>
                One of you actively wants this — the other isn&apos;t feeling it. Worth naming.
              </p>
              {worthConvo.slice(0, 4).map((d) => {
                const wantsIt = d.myTier === 'must-have' ? myName : theirName;
                const doesntInitial = d.myTier === 'must-have' ? theirInitial : myInitial;
                return (
                  <div
                    key={`${d.categoryId}-${d.subcategory}`}
                    className="flex items-start gap-3 py-2 px-3 rounded-2xl"
                    style={{ background: 'rgba(155,110,175,0.08)' }}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: 'rgba(0,0,0,0.7)' }}>{d.subcategory}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'rgba(0,0,0,0.38)' }}>{wantsIt} really wants this</p>
                    </div>
                    <div className="flex gap-1">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ background: TIER_COLORS[d.myTier] }}
                      >
                        {myInitial}
                      </span>
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{ border: `2px solid ${TIER_COLORS[d.theirTier]}`, color: TIER_COLORS[d.theirTier], background: TIER_BG[d.theirTier] }}
                      >
                        {doesntInitial}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── What Isn't This Connection ── */}
        {sharedNonWants.length > 0 && (
          <div className="mx-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full" style={{ background: 'rgba(0,0,0,0.2)' }} />
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.3)' }}>
                What Isn&apos;t This Connection
              </p>
              <span className="text-[10px]" style={{ color: 'rgba(0,0,0,0.2)' }}>you both passed</span>
            </div>
            <div
              className="rounded-3xl px-5 py-5"
              style={{ background: 'rgba(0,0,0,0.03)', border: '1.5px solid rgba(0,0,0,0.07)' }}
            >
              <p className="text-xs mb-3" style={{ color: 'rgba(0,0,0,0.35)' }}>
                Neither of you is looking for this here — and that&apos;s its own kind of clarity.
              </p>
              <div className="flex flex-wrap gap-2">
                {sharedNonWants.slice(0, 12).map((d) => (
                  <div
                    key={`${d.categoryId}-${d.subcategory}`}
                    className="px-3 py-1 rounded-full text-xs"
                    style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.08)', color: 'rgba(0,0,0,0.38)' }}
                  >
                    {d.subcategory}
                  </div>
                ))}
                {sharedNonWants.length > 12 && (
                  <div className="px-3 py-1 rounded-full text-xs" style={{ color: 'rgba(0,0,0,0.25)' }}>
                    +{sharedNonWants.length - 12} more
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Category Heatmap Popup ── */}
      {activeCat && (
        <CategoryHeatmapPopup
          cat={activeCat}
          myInitial={myInitial}
          theirInitial={theirInitial}
          onClose={() => setActiveCatId(null)}
        />
      )}
    </>
  );
}
