'use client';

import { useMemo, useState } from 'react';
import { Connection, Tier, TIER_ORDER } from '../lib/types';
import { DEFAULT_CATEGORIES } from '../lib/categories';
import { SUBCATEGORY_DEFINITIONS } from '../lib/definitions';

// ── helpers ─────────────────────────────────────────────────────────────────

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
const TIER_POSITION: Record<Tier, number> = {
  'must-have': 0, 'open': 1, 'maybe': 2, 'off-limits': 3,
};

function isPositive(t: Tier) { return t === 'must-have' || t === 'open'; }

// ── types ────────────────────────────────────────────────────────────────────

interface DimData {
  subcategory: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  myTier: Tier;
  theirTier: Tier;
}
interface CatScore {
  id: string; name: string; color: string;
  alignedCount: number; totalCount: number; ratio: number;
  dims: DimData[];
}

// ── sentence ─────────────────────────────────────────────────────────────────

function generateSentence(greenZone: DimData[], tension: DimData[], catScores: CatScore[], myName: string, theirName: string): string {
  const sorted = [...catScores].sort((a, b) => b.ratio - a.ratio);
  const topCat = sorted[0]; const bottomCat = sorted[sorted.length - 1];
  const totalDims = catScores.reduce((s, c) => s + c.totalCount, 0);
  const totalAligned = catScores.reduce((s, c) => s + c.alignedCount, 0);
  const pct = totalDims > 0 ? Math.round((totalAligned / totalDims) * 100) : 0;
  const mutual = greenZone.filter(d => d.myTier === 'must-have' && d.theirTier === 'must-have');
  const anchor = mutual[0]?.subcategory; const anchor2 = mutual[1]?.subcategory;
  if (pct >= 68) return `${myName} and ${theirName} are deeply aligned — especially in ${topCat?.name || 'most areas'}. ${anchor && anchor2 ? `${anchor} and ${anchor2} stand out as shared anchors.` : anchor ? `${anchor} is a clear shared anchor.` : "There's a lot of mutual yes here."}`;
  if (pct >= 42) return `This connection has real depth in ${topCat?.name || 'several areas'}${anchor ? `, with ${anchor} as a touchstone both of you share` : ''}. ${bottomCat && bottomCat.id !== topCat?.id ? `${bottomCat.name} holds the most room for honest conversation.` : ''}`.trim();
  return `${myName} and ${theirName} are navigating real differences — the strongest common ground lives in ${topCat?.name || 'a few areas'}. ${tension.length > 0 ? 'A few honest conversations could open a lot of doors.' : ''}`;
}

// ── Bubble Map Overview ───────────────────────────────────────────────────────

function BubbleMapOverview({ catScores, myInitial, theirInitial, myColor, theirColor }: {
  catScores: CatScore[]; myInitial: string; theirInitial: string; myColor: string; theirColor: string;
}) {
  const [activeCatId, setActiveCatId] = useState<string | null>(null);

  const VW = 320; const VH = 290;
  const CX = 160; const CY = 145;
  const BASE_ORBIT = 100;
  const ORBIT_OFFSETS = [0, 14, -8, 16, -12, 10, -6, 14];

  const positioned = useMemo(() => catScores.map((cat, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / catScores.length;
    const orbit = BASE_ORBIT + (ORBIT_OFFSETS[i % ORBIT_OFFSETS.length] ?? 0);
    const x = CX + orbit * Math.cos(angle);
    const y = CY + orbit * Math.sin(angle);
    const r = Math.max(22, Math.min(42, 16 + Math.sqrt(cat.totalCount) * 5));
    const [rv, gv, bv] = hexToRgb(cat.color);
    const alpha = 0.38 + cat.ratio * 0.52;
    return { cat, x, y, r, rv, gv, bv, alpha, angle };
  }), [catScores]);

  const activeCat = catScores.find(c => c.id === activeCatId) ?? null;
  const [myR, myG, myB] = hexToRgb(myColor);
  const [thR, thG, thB] = hexToRgb(theirColor);

  return (
    <>
      <div className="flex flex-col items-center">
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          width="100%"
          style={{ maxWidth: 360, overflow: 'visible' }}
        >
          <defs>
            {positioned.map(({ cat, rv, gv, bv, alpha }) => (
              <radialGradient key={cat.id} id={`bubble-${cat.id}`} cx="38%" cy="35%" r="65%">
                <stop offset="0%" stopColor={`rgba(${rv},${gv},${bv},${(alpha * 0.55).toFixed(2)})`} />
                <stop offset="100%" stopColor={`rgba(${rv},${gv},${bv},${alpha.toFixed(2)})`} />
              </radialGradient>
            ))}
            <radialGradient id="center-grad" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor={`rgba(${myR},${myG},${myB},0.25)`} />
              <stop offset="100%" stopColor={`rgba(${thR},${thG},${thB},0.25)`} />
            </radialGradient>
          </defs>

          {/* Connecting lines between adjacent bubbles */}
          {positioned.map((p, i) => {
            const next = positioned[(i + 1) % positioned.length];
            return (
              <line
                key={i}
                x1={p.x.toFixed(1)} y1={p.y.toFixed(1)}
                x2={next.x.toFixed(1)} y2={next.y.toFixed(1)}
                stroke="rgba(0,0,0,0.07)" strokeWidth="1.5" strokeDasharray="3 5"
              />
            );
          })}

          {/* Spoke lines from center to each bubble */}
          {positioned.map(({ cat, x, y, r }) => (
            <line
              key={`spoke-${cat.id}`}
              x1={CX.toFixed(1)} y1={CY.toFixed(1)}
              x2={(CX + (x - CX) * 0.45).toFixed(1)}
              y2={(CY + (y - CY) * 0.45).toFixed(1)}
              stroke="rgba(0,0,0,0.05)" strokeWidth="1"
            />
          ))}

          {/* Center bubble */}
          <circle cx={CX} cy={CY} r={30} fill="url(#center-grad)" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
          <text x={CX} y={CY - 5} textAnchor="middle" fontSize="9" fontWeight="700" fill="rgba(0,0,0,0.5)" fontFamily="system-ui">{myInitial}</text>
          <text x={CX} y={CY + 7} textAnchor="middle" fontSize="7" fontWeight="600" fill="rgba(0,0,0,0.3)" fontFamily="system-ui">&amp;</text>
          <text x={CX} y={CY + 18} textAnchor="middle" fontSize="9" fontWeight="700" fill="rgba(0,0,0,0.5)" fontFamily="system-ui">{theirInitial}</text>

          {/* Category bubbles */}
          {positioned.map(({ cat, x, y, r, rv, gv, bv }) => {
            const pct = Math.round(cat.ratio * 100);
            const labelY = y + r + 13;
            const words = cat.name.split(' ');

            return (
              <g
                key={cat.id}
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveCatId(cat.id)}
              >
                {/* Glow halo */}
                <circle cx={x.toFixed(1)} cy={y.toFixed(1)} r={r + 7}
                  fill={`rgba(${rv},${gv},${bv},0.15)`}
                />
                {/* Main bubble */}
                <circle
                  cx={x.toFixed(1)} cy={y.toFixed(1)} r={r}
                  fill={`url(#bubble-${cat.id})`}
                  stroke="rgba(255,255,255,0.65)" strokeWidth="2.5"
                  style={{ filter: `drop-shadow(0 3px 6px rgba(${rv},${gv},${bv},0.35))` }}
                />
                {/* % inside */}
                <text x={x.toFixed(1)} y={(y + 4).toFixed(1)} textAnchor="middle" fontSize="11" fontWeight="800" fill="rgba(0,0,0,0.65)" fontFamily="Georgia, serif">
                  {pct}%
                </text>
                {/* Category name below */}
                {words.length <= 1 ? (
                  <text x={x.toFixed(1)} y={labelY.toFixed(1)} textAnchor="middle" fontSize="8" fontWeight="600" fill="rgba(0,0,0,0.42)" fontFamily="system-ui">
                    {cat.name}
                  </text>
                ) : (
                  <>
                    <text x={x.toFixed(1)} y={labelY.toFixed(1)} textAnchor="middle" fontSize="8" fontWeight="600" fill="rgba(0,0,0,0.42)" fontFamily="system-ui">
                      {words[0]}
                    </text>
                    <text x={x.toFixed(1)} y={(labelY + 10).toFixed(1)} textAnchor="middle" fontSize="8" fontWeight="600" fill="rgba(0,0,0,0.42)" fontFamily="system-ui">
                      {words.slice(1).join(' ')}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
        <p className="text-[10px] mt-1" style={{ color: 'rgba(0,0,0,0.25)' }}>tap a bubble to explore</p>
      </div>

      {activeCat && (
        <CategoryHeatmapPopup
          cat={activeCat} myInitial={myInitial} theirInitial={theirInitial}
          onClose={() => setActiveCatId(null)}
        />
      )}
    </>
  );
}

// ── Green Zone Ring ───────────────────────────────────────────────────────────

function GreenZonePopup({ catName, catColor, dims, myInitial, theirInitial, onClose }: {
  catName: string; catColor: string; dims: DimData[]; myInitial: string; theirInitial: string; onClose: () => void;
}) {
  const [peekItem, setPeekItem] = useState<string | null>(null);
  const [r, g, b] = hexToRgb(catColor);
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden" style={{ background: 'var(--background)', boxShadow: '0 -8px 40px rgba(0,0,0,0.12)', maxHeight: '78vh', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.28s cubic-bezier(0.34,1.2,0.64,1)' }}>
        <div className="px-6 pt-4 pb-4 shrink-0" style={{ background: `linear-gradient(135deg, rgba(${r},${g},${b},0.22), rgba(${r},${g},${b},0.10))` }}>
          <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: `rgba(${r},${g},${b},0.4)` }} />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.75)' }}>{catName}</h3>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(0,0,0,0.35)' }}>{dims.length} shared yes&apos;s in this area</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: `rgba(${r},${g},${b},0.15)`, color: 'rgba(0,0,0,0.4)' }}>✕</button>
          </div>
        </div>
        <div className="overflow-y-auto px-5 pb-8 pt-3 space-y-2">
          {dims.map((d) => {
            const both = d.myTier === 'must-have' && d.theirTier === 'must-have';
            return (
              <div key={d.subcategory}>
                <button onClick={() => setPeekItem(peekItem === d.subcategory ? null : d.subcategory)} className="w-full flex items-center gap-3 py-2.5 px-3 rounded-2xl transition-all active:scale-[0.98]" style={{ background: peekItem === d.subcategory ? `rgba(${r},${g},${b},0.12)` : `rgba(${r},${g},${b},0.06)`, border: `1.5px solid rgba(${r},${g},${b},${both ? 0.35 : 0.15})` }}>
                  <span className="text-[10px] px-1 py-0.5 rounded-full shrink-0" style={{ background: `rgba(${r},${g},${b},0.15)`, color: `rgba(${r},${g},${b},1)` }}>ⓘ</span>
                  <span className="flex-1 text-left text-sm font-medium" style={{ color: 'rgba(0,0,0,0.72)' }}>{d.subcategory}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: TIER_COLORS[d.myTier] }}>{myInitial}</span>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2" style={{ borderColor: TIER_COLORS[d.theirTier], color: TIER_COLORS[d.theirTier], background: TIER_BG[d.theirTier] }}>{theirInitial}</span>
                  </div>
                  {both && <span className="text-[#007A6B] text-xs shrink-0">✦</span>}
                </button>
                {peekItem === d.subcategory && SUBCATEGORY_DEFINITIONS[d.subcategory] && (
                  <div className="ml-2 mr-1 mb-1 px-3 py-2 rounded-xl text-xs leading-relaxed" style={{ background: `rgba(${r},${g},${b},0.08)`, color: 'rgba(0,0,0,0.5)', animation: 'tooltip-enter 0.15s ease-out' }}>{SUBCATEGORY_DEFINITIONS[d.subcategory]}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </>
  );
}

function GreenZoneRing({ greenZone, myInitial, theirInitial }: { greenZone: DimData[]; myInitial: string; theirInitial: string }) {
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const cats = useMemo(() => {
    const map = new Map<string, { id: string; name: string; color: string; dims: DimData[] }>();
    for (const d of greenZone) {
      if (!map.has(d.categoryId)) map.set(d.categoryId, { id: d.categoryId, name: d.categoryName, color: d.categoryColor, dims: [] });
      map.get(d.categoryId)!.dims.push(d);
    }
    return [...map.values()];
  }, [greenZone]);
  const total = greenZone.length;
  const CX = 110, CY = 110, R = 85, STROKE = 28;
  const GAP = cats.length > 1 ? 0.06 : 0;
  const available = 2 * Math.PI - GAP * cats.length;
  const segments = useMemo(() => {
    let angle = -Math.PI / 2;
    return cats.map((cat) => {
      const span = (cat.dims.length / total) * available;
      const start = angle + GAP / 2; const end = start + span;
      angle = end + GAP / 2;
      const x1 = CX + R * Math.cos(start), y1 = CY + R * Math.sin(start);
      const x2 = CX + R * Math.cos(end), y2 = CY + R * Math.sin(end);
      return { cat, path: `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${span > Math.PI ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}` };
    });
  }, [cats, total, available]);
  const activeCatData = cats.find(c => c.id === activeCatId);
  return (
    <>
      <svg viewBox="0 0 220 220" width="100%" style={{ display: 'block' }}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={STROKE} />
        {segments.map(({ cat, path }) => {
          const [r, g, b] = hexToRgb(cat.color);
          const isActive = activeCatId === cat.id;
          return <path key={cat.id} d={path} fill="none" stroke={`rgba(${r},${g},${b},${isActive ? 1 : 0.85})`} strokeWidth={isActive ? STROKE + 7 : STROKE} strokeLinecap="round" style={{ cursor: 'pointer', transition: 'stroke-width 0.2s ease, stroke 0.2s ease' }} onClick={() => setActiveCatId(isActive ? null : cat.id)} />;
        })}
        <text x={CX} y={CY - 10} textAnchor="middle" fontSize="44" fontWeight="800" fill="rgba(0,0,0,0.72)" fontFamily="Georgia, serif">{total}</text>
        <text x={CX} y={CY + 12} textAnchor="middle" fontSize="11" fontWeight="600" fill="rgba(0,0,0,0.30)" letterSpacing="1">SHARED YES&apos;S</text>
        <text x={CX} y={CY + 28} textAnchor="middle" fontSize="9" fontWeight="500" fill="rgba(0,0,0,0.18)" letterSpacing="0.3">tap to explore</text>
      </svg>
      {activeCatData && <GreenZonePopup catName={activeCatData.name} catColor={activeCatData.color} dims={activeCatData.dims} myInitial={myInitial} theirInitial={theirInitial} onClose={() => setActiveCatId(null)} />}
    </>
  );
}

// ── Red Zone ──────────────────────────────────────────────────────────────────

function RedZonePopup({ catName, catColor, dims, myInitial, theirInitial, onClose }: {
  catName: string; catColor: string; dims: DimData[]; myInitial: string; theirInitial: string; onClose: () => void;
}) {
  const [peekItem, setPeekItem] = useState<string | null>(null);
  const [r, g, b] = hexToRgb(catColor);
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden" style={{ background: 'var(--background)', boxShadow: '0 -8px 40px rgba(0,0,0,0.12)', maxHeight: '78vh', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.28s cubic-bezier(0.34,1.2,0.64,1)' }}>
        <div className="px-6 pt-4 pb-4 shrink-0" style={{ background: `linear-gradient(135deg, rgba(${r},${g},${b},0.18), rgba(${r},${g},${b},0.08))` }}>
          <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: `rgba(${r},${g},${b},0.35)` }} />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.75)' }}>{catName}</h3>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(0,0,0,0.35)' }}>{dims.length} shared no&apos;s in this area</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: `rgba(${r},${g},${b},0.12)`, color: 'rgba(0,0,0,0.4)' }}>✕</button>
          </div>
        </div>
        <div className="overflow-y-auto px-5 pb-8 pt-3 space-y-2">
          {dims.map((d) => {
            const bothOff = d.myTier === 'off-limits' && d.theirTier === 'off-limits';
            return (
              <div key={d.subcategory}>
                <button onClick={() => setPeekItem(peekItem === d.subcategory ? null : d.subcategory)} className="w-full flex items-center gap-3 py-2.5 px-3 rounded-2xl transition-all active:scale-[0.98]" style={{ background: peekItem === d.subcategory ? `rgba(${r},${g},${b},0.1)` : `rgba(${r},${g},${b},0.05)`, border: `1.5px solid rgba(${r},${g},${b},${bothOff ? 0.3 : 0.12})` }}>
                  <span className="text-[10px] px-1 py-0.5 rounded-full shrink-0" style={{ background: `rgba(${r},${g},${b},0.12)`, color: `rgba(${r},${g},${b},1)` }}>ⓘ</span>
                  <span className="flex-1 text-left text-sm font-medium" style={{ color: 'rgba(0,0,0,0.65)' }}>{d.subcategory}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: TIER_COLORS[d.myTier] }}>{myInitial}</span>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2" style={{ borderColor: TIER_COLORS[d.theirTier], color: TIER_COLORS[d.theirTier], background: TIER_BG[d.theirTier] }}>{theirInitial}</span>
                  </div>
                  {bothOff && <span className="text-xs shrink-0" style={{ color: TIER_COLORS['off-limits'] }}>✕</span>}
                </button>
                {peekItem === d.subcategory && SUBCATEGORY_DEFINITIONS[d.subcategory] && (
                  <div className="ml-2 mr-1 mb-1 px-3 py-2 rounded-xl text-xs leading-relaxed" style={{ background: `rgba(${r},${g},${b},0.07)`, color: 'rgba(0,0,0,0.5)', animation: 'tooltip-enter 0.15s ease-out' }}>{SUBCATEGORY_DEFINITIONS[d.subcategory]}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </>
  );
}

function RedZonePentagon({ redZone, myInitial, theirInitial }: { redZone: DimData[]; myInitial: string; theirInitial: string }) {
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const cats = useMemo(() => {
    const map = new Map<string, { id: string; name: string; color: string; dims: DimData[] }>();
    for (const d of redZone) {
      if (!map.has(d.categoryId)) map.set(d.categoryId, { id: d.categoryId, name: d.categoryName, color: d.categoryColor, dims: [] });
      map.get(d.categoryId)!.dims.push(d);
    }
    return [...map.values()];
  }, [redZone]);
  const total = redZone.length;

  const CX = 120, CY = 115, R = 90, STROKE = 28;
  const vertices = Array.from({ length: 5 }, (_, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / 5;
    return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
  });
  const pentagonPath = vertices.map((v, i) => `${i === 0 ? 'M' : 'L'} ${v.x.toFixed(2)} ${v.y.toFixed(2)}`).join(' ') + ' Z';

  const segments = useMemo(() => {
    const gap = cats.length > 1 ? 2 : 0;
    const available = 100 - gap * cats.length;
    let offset = 0;
    return cats.map((cat) => {
      const len = (cat.dims.length / total) * available;
      const start = offset + gap / 2;
      offset += len + gap;
      return { cat, startPct: start, lenPct: len };
    });
  }, [cats, total]);

  const activeCatData = cats.find(c => c.id === activeCatId);
  return (
    <>
      <svg viewBox="0 0 240 230" width="100%" style={{ display: 'block' }}>
        <path d={pentagonPath} pathLength="100" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={STROKE} strokeLinejoin="round" strokeLinecap="round" />
        {segments.map(({ cat, startPct, lenPct }) => {
          const [r, g, b] = hexToRgb(cat.color);
          const isActive = activeCatId === cat.id;
          return (
            <path
              key={cat.id}
              d={pentagonPath}
              pathLength="100"
              fill="none"
              stroke={`rgba(${r},${g},${b},${isActive ? 1 : 0.85})`}
              strokeWidth={isActive ? STROKE + 7 : STROKE}
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray={`${lenPct.toFixed(2)} 9999`}
              strokeDashoffset={(-startPct).toFixed(2)}
              style={{ cursor: 'pointer', transition: 'stroke-width 0.2s ease, stroke 0.2s ease' }}
              onClick={() => setActiveCatId(isActive ? null : cat.id)}
            />
          );
        })}
        <text x={CX} y={CY - 10} textAnchor="middle" fontSize="44" fontWeight="800" fill="rgba(0,0,0,0.72)" fontFamily="Georgia, serif">{total}</text>
        <text x={CX} y={CY + 12} textAnchor="middle" fontSize="11" fontWeight="600" fill="rgba(0,0,0,0.30)" letterSpacing="1">SHARED NO&apos;S</text>
        <text x={CX} y={CY + 28} textAnchor="middle" fontSize="9" fontWeight="500" fill="rgba(0,0,0,0.18)" letterSpacing="0.3">tap to explore</text>
      </svg>
      {activeCatData && <RedZonePopup catName={activeCatData.name} catColor={activeCatData.color} dims={activeCatData.dims} myInitial={myInitial} theirInitial={theirInitial} onClose={() => setActiveCatId(null)} />}
    </>
  );
}

// ── Category Heatmap Popup ────────────────────────────────────────────────────

function CategoryHeatmapPopup({ cat, myInitial, theirInitial, onClose }: { cat: CatScore; myInitial: string; theirInitial: string; onClose: () => void }) {
  const [peekItem, setPeekItem] = useState<string | null>(null);
  const [r, g, b] = hexToRgb(cat.color);
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden" style={{ background: 'var(--background)', boxShadow: '0 -8px 40px rgba(0,0,0,0.12)', maxHeight: '80vh', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.28s cubic-bezier(0.34,1.2,0.64,1)' }}>
        <div className="px-6 pt-4 pb-4 shrink-0" style={{ background: `linear-gradient(135deg, rgba(${r},${g},${b},0.22), rgba(${r},${g},${b},0.10))` }}>
          <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: `rgba(${r},${g},${b},0.4)` }} />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.75)' }}>{cat.name}</h3>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(0,0,0,0.35)' }}>{cat.alignedCount} of {cat.totalCount} aligned · {Math.round(cat.ratio * 100)}%</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: `rgba(${r},${g},${b},0.15)`, color: 'rgba(0,0,0,0.4)' }}>✕</button>
          </div>
        </div>
        <div className="px-5 pt-3 pb-1 shrink-0">
          <div className="flex items-center">
            <div className="flex-1" />
            {TIER_ORDER.map(tier => (
              <div key={tier} className="w-11 text-center"><span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: TIER_COLORS[tier] }}>{TIER_SHORT[tier]}</span></div>
            ))}
          </div>
        </div>
        <div className="overflow-y-auto px-5 pb-8 pt-1 space-y-1.5">
          {cat.dims.map(dim => {
            const aligned = isPositive(dim.myTier) === isPositive(dim.theirTier);
            return (
              <div key={dim.subcategory}>
                <button onClick={() => setPeekItem(peekItem === dim.subcategory ? null : dim.subcategory)} className="w-full flex items-center py-1.5 px-2 rounded-xl transition-all active:scale-[0.98]" style={{ background: peekItem === dim.subcategory ? `rgba(${r},${g},${b},0.12)` : aligned ? `rgba(91,168,77,0.06)` : `rgba(${r},${g},${b},0.04)`, border: `1.5px solid ${aligned ? 'rgba(91,168,77,0.2)' : `rgba(${r},${g},${b},0.12)`}` }}>
                  <span className="text-[10px] font-semibold mr-1.5 shrink-0 px-1 py-0.5 rounded-full" style={{ background: `rgba(${r},${g},${b},0.15)`, color: `rgba(${r},${g},${b},1)` }}>ⓘ</span>
                  <span className="flex-1 text-left text-xs font-medium pr-2" style={{ color: 'rgba(0,0,0,0.72)' }}>{dim.subcategory}</span>
                  <div className="flex">
                    {TIER_ORDER.map(tier => (
                      <div key={tier} className="w-11 flex items-center justify-center gap-0.5">
                        {dim.myTier === tier && <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: TIER_COLORS[tier] }}>{myInitial}</span>}
                        {dim.theirTier === tier && <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border-2" style={{ borderColor: TIER_COLORS[tier], color: TIER_COLORS[tier], background: TIER_BG[tier] }}>{theirInitial}</span>}
                      </div>
                    ))}
                  </div>
                </button>
                {peekItem === dim.subcategory && SUBCATEGORY_DEFINITIONS[dim.subcategory] && (
                  <div className="ml-2 mr-1 mb-1 px-3 py-2 rounded-xl text-xs leading-relaxed" style={{ background: `rgba(${r},${g},${b},0.08)`, color: 'rgba(0,0,0,0.5)', animation: 'tooltip-enter 0.15s ease-out' }}>{SUBCATEGORY_DEFINITIONS[dim.subcategory]}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </>
  );
}

// ── Tension Explorer ──────────────────────────────────────────────────────────

function TensionSpectrumBar({ dim, myInitial, theirInitial }: { dim: DimData; myInitial: string; theirInitial: string }) {
  const myPos = TIER_POSITION[dim.myTier] / 3;
  const theirPos = TIER_POSITION[dim.theirTier] / 3;
  const minPos = Math.min(myPos, theirPos);
  const maxPos = Math.max(myPos, theirPos);
  return (
    <div className="relative h-8 flex items-center mx-1 mt-1">
      <div className="absolute inset-x-0 top-3 flex justify-between px-0.5">
        {(['must-have', 'open', 'maybe', 'off-limits'] as Tier[]).map(t => (
          <span key={t} className="text-[8px] font-semibold" style={{ color: TIER_COLORS[t], opacity: 0.65 }}>{TIER_SHORT[t]}</span>
        ))}
      </div>
      <div className="absolute inset-x-0 h-1.5 rounded-full mt-5" style={{ background: 'rgba(0,0,0,0.08)', top: '14px' }} />
      <div className="absolute h-1.5 rounded-full" style={{ left: `${minPos * 100}%`, width: `${(maxPos - minPos) * 100}%`, background: 'linear-gradient(90deg, rgba(91,168,77,0.45), rgba(212,112,32,0.45))', top: '14px' }} />
      {[0, 1 / 3, 2 / 3, 1].map((pos, i) => (
        <div key={i} className="absolute w-px h-2.5 rounded-full" style={{ left: `${pos * 100}%`, background: 'rgba(0,0,0,0.1)', top: '13px', transform: 'translateX(-0.5px)' }} />
      ))}
      <div className="absolute w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white z-10" style={{ left: `calc(${myPos * 100}% - 12px)`, top: '5px', background: TIER_COLORS[dim.myTier], boxShadow: `0 2px 6px ${TIER_COLORS[dim.myTier]}60` }}>{myInitial}</div>
      <div className="absolute w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 border-2" style={{ left: `calc(${theirPos * 100}% - 12px)`, top: '5px', borderColor: TIER_COLORS[dim.theirTier], color: TIER_COLORS[dim.theirTier], background: TIER_BG[dim.theirTier], boxShadow: `0 2px 6px ${TIER_COLORS[dim.theirTier]}40` }}>{theirInitial}</div>
    </div>
  );
}

function TensionCategorySheet({ catScore, dims, myName, theirName, myInitial, theirInitial, onClose }: {
  catScore: CatScore; dims: DimData[]; myName: string; theirName: string; myInitial: string; theirInitial: string; onClose: () => void;
}) {
  const [r, g, b] = hexToRgb(catScore.color);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl"
        style={{ background: 'var(--background)', boxShadow: '0 -8px 40px rgba(0,0,0,0.12)', maxHeight: '84vh', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.28s cubic-bezier(0.34,1.2,0.64,1)' }}
      >
        {/* Header */}
        <div className="px-6 pt-4 pb-4 shrink-0" style={{ background: `linear-gradient(135deg, rgba(${r},${g},${b},0.22), rgba(${r},${g},${b},0.10))` }}>
          <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: `rgba(${r},${g},${b},0.4)` }} />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.75)' }}>{catScore.name}</h3>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(0,0,0,0.38)' }}>{dims.length} tension point{dims.length !== 1 ? 's' : ''} · swipe to explore</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: `rgba(${r},${g},${b},0.15)`, color: 'rgba(0,0,0,0.4)' }}>✕</button>
          </div>
        </div>

        {/* Horizontal scroll cards */}
        <div
          className="overflow-x-auto flex-1"
          style={{ display: 'flex', gap: 12, padding: '20px 20px 28px', scrollSnapType: 'x mandatory' }}
        >
          {dims.map((dim) => {
            const isWorthConvo = (dim.myTier === 'must-have' && dim.theirTier === 'off-limits') || (dim.theirTier === 'must-have' && dim.myTier === 'off-limits');
            const wantsName = dim.myTier === 'must-have' ? myName : theirName;
            const wantsInitial = dim.myTier === 'must-have' ? myInitial : theirInitial;
            const wantsTier = dim.myTier === 'must-have' ? dim.myTier : dim.theirTier;
            const otherName = dim.myTier === 'must-have' ? theirName : myName;
            const otherInitial = dim.myTier === 'must-have' ? theirInitial : myInitial;
            const otherTier = dim.myTier === 'must-have' ? dim.theirTier : dim.myTier;

            return (
              <div
                key={dim.subcategory}
                style={{ minWidth: 'calc(100vw - 56px)', maxWidth: 340, scrollSnapAlign: 'start', flexShrink: 0 }}
              >
                <div className="rounded-3xl overflow-hidden" style={{ border: `1.5px solid rgba(${r},${g},${b},0.22)`, background: `rgba(${r},${g},${b},0.05)` }}>
                  {/* Header */}
                  <div className="px-5 pt-5 pb-3">
                    <p className="text-base font-semibold" style={{ color: 'rgba(0,0,0,0.75)' }}>{dim.subcategory}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(0,0,0,0.35)' }}>{catScore.name}</p>
                  </div>

                  {/* Spectrum bar */}
                  <div className="px-5 pb-4">
                    <TensionSpectrumBar dim={dim} myInitial={myInitial} theirInitial={theirInitial} />
                    <div className="flex justify-between mt-4">
                      <span className="text-[11px] font-semibold" style={{ color: TIER_COLORS[dim.myTier] }}>{myInitial}: {TIER_SHORT[dim.myTier]}</span>
                      <span className="text-[11px] font-semibold" style={{ color: TIER_COLORS[dim.theirTier] }}>{theirInitial}: {TIER_SHORT[dim.theirTier]}</span>
                    </div>
                  </div>

                  {/* Conversation starter — only for biggest gaps */}
                  {isWorthConvo && (
                    <div className="px-5 py-4 mx-0" style={{ borderTop: `1px solid rgba(${r},${g},${b},0.15)`, background: 'rgba(155,110,175,0.07)' }}>
                      <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(155,110,175,0.7)' }}>Conversation starter</p>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(0,0,0,0.6)', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                        &ldquo;{wantsName} really wants {dim.subcategory} in this connection. {otherName}, what makes this feel off the table — or is there a version of it that could work?&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dot indicators */}
        {dims.length > 1 && (
          <div className="flex justify-center gap-1.5 pb-5 shrink-0">
            {dims.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i === 0 ? `rgba(${r},${g},${b},0.6)` : 'rgba(0,0,0,0.15)' }} />
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </>
  );
}

function TensionExplorer({ tension, catScores, myName, theirName, myInitial, theirInitial }: {
  tension: DimData[]; catScores: CatScore[]; myName: string; theirName: string; myInitial: string; theirInitial: string;
}) {
  const [activeCatId, setActiveCatId] = useState<string | null>(null);

  const tensionByCat = useMemo(() => {
    const map = new Map<string, { catScore: CatScore; dims: DimData[] }>();
    for (const d of tension) {
      if (!map.has(d.categoryId)) {
        const cs = catScores.find(c => c.id === d.categoryId);
        if (cs) map.set(d.categoryId, { catScore: cs, dims: [] });
      }
      map.get(d.categoryId)?.dims.push(d);
    }
    return [...map.values()].sort((a, b) => b.dims.length - a.dims.length);
  }, [tension, catScores]);

  const activeCatData = tensionByCat.find(t => t.catScore.id === activeCatId);

  const VW = 320;
  const CAT_CX = 44;
  const CAT_R = 30;
  const PILL_X = 108;
  const PILL_W = VW - PILL_X - 6;
  const ROW_H = 46;
  const MAX_SHOWN = 5;

  function trunc(s: string, max: number) {
    return s.length > max ? s.slice(0, max - 1) + '…' : s;
  }

  const groups = tensionByCat.map(({ catScore, dims }) => {
    const shown = dims.slice(0, MAX_SHOWN);
    const spreadH = Math.max(0, (shown.length - 1) * ROW_H);
    const groupH = Math.max(CAT_R * 2 + 28, spreadH + 56);
    return { catScore, dims, shown, groupH };
  });

  let cursor = 0;
  const groupYs = groups.map(g => { const y = cursor; cursor += g.groupH; return y; });
  const totalH = cursor;

  return (
    <>
      <svg viewBox={`0 0 ${VW} ${totalH}`} width="100%" style={{ overflow: 'visible', display: 'block' }}>
        {groups.map((group, gi) => {
          const gy = groupYs[gi];
          const catCY = gy + group.groupH / 2;
          const [r, g, b] = hexToRgb(group.catScore.color);
          const n = group.shown.length;
          const spreadH = Math.max(0, (n - 1) * ROW_H);
          const firstDimY = catCY - spreadH / 2;
          const words = group.catScore.name.split(' ');
          const angleSpread = Math.min((n - 1) * 18, 72);

          return (
            <g key={group.catScore.id} style={{ cursor: 'pointer' }} onClick={() => setActiveCatId(group.catScore.id)}>
              {/* Glow */}
              <circle cx={CAT_CX} cy={catCY} r={CAT_R + 7} fill={`rgba(${r},${g},${b},0.1)`} />
              {/* Circle */}
              <circle cx={CAT_CX} cy={catCY} r={CAT_R} fill={`rgba(${r},${g},${b},0.15)`} stroke={`rgba(${r},${g},${b},0.6)`} strokeWidth={2.5} />
              {/* Label lines */}
              {words.length === 1 ? (
                <text x={CAT_CX} y={catCY + 4} textAnchor="middle" fontSize="9" fontWeight="800" fill={`rgba(${r},${g},${b},1)`} fontFamily="system-ui">{words[0].toUpperCase()}</text>
              ) : words.length === 2 ? (
                <>
                  <text x={CAT_CX} y={catCY - 2} textAnchor="middle" fontSize="8.5" fontWeight="800" fill={`rgba(${r},${g},${b},1)`} fontFamily="system-ui">{words[0].toUpperCase()}</text>
                  <text x={CAT_CX} y={catCY + 9} textAnchor="middle" fontSize="8.5" fontWeight="800" fill={`rgba(${r},${g},${b},1)`} fontFamily="system-ui">{words[1].toUpperCase()}</text>
                </>
              ) : (
                <>
                  <text x={CAT_CX} y={catCY - 5} textAnchor="middle" fontSize="8" fontWeight="800" fill={`rgba(${r},${g},${b},1)`} fontFamily="system-ui">{words[0].toUpperCase()}</text>
                  <text x={CAT_CX} y={catCY + 5} textAnchor="middle" fontSize="8" fontWeight="800" fill={`rgba(${r},${g},${b},1)`} fontFamily="system-ui">{words.slice(1).join(' ').toUpperCase()}</text>
                </>
              )}
              {/* Count */}
              <text x={CAT_CX} y={catCY + 20} textAnchor="middle" fontSize="7.5" fontWeight="600" fill={`rgba(${r},${g},${b},0.65)`} fontFamily="system-ui">{group.dims.length} pts</text>

              {/* Branches */}
              {group.shown.map((dim, di) => {
                const dimY = firstDimY + di * ROW_H;
                const angleRad = ((-angleSpread / 2 + di * (n > 1 ? angleSpread / (n - 1) : 0)) * Math.PI) / 180;
                const depX = CAT_CX + CAT_R * Math.cos(angleRad);
                const depY = catCY + CAT_R * Math.sin(angleRad);
                const isWorth = (dim.myTier === 'must-have' && dim.theirTier === 'off-limits') || (dim.theirTier === 'must-have' && dim.myTier === 'off-limits');
                const hasMust = dim.myTier === 'must-have' || dim.theirTier === 'must-have';
                const lineColor = isWorth ? '#D47020' : hasMust ? '#B8A520' : `rgba(${r},${g},${b},0.75)`;
                const pillH = 30;
                const pillR = pillH / 2;

                return (
                  <g key={dim.subcategory}>
                    {/* Bezier branch */}
                    <path
                      d={`M ${depX.toFixed(1)} ${depY.toFixed(1)} C ${(depX + 28).toFixed(1)} ${depY.toFixed(1)}, ${(PILL_X - 18).toFixed(1)} ${dimY.toFixed(1)}, ${PILL_X.toFixed(1)} ${dimY.toFixed(1)}`}
                      fill="none" stroke={lineColor} strokeWidth={1.8} opacity={0.7}
                    />
                    {/* Departure dot on circle */}
                    <circle cx={depX.toFixed(1)} cy={depY.toFixed(1)} r={4.5} fill={lineColor} />
                    {/* Pill */}
                    <rect x={PILL_X} y={(dimY - pillR).toFixed(1)} width={PILL_W} height={pillH} rx={pillR} fill={`rgba(${r},${g},${b},0.1)`} stroke={`rgba(${r},${g},${b},0.28)`} strokeWidth={1.5} />
                    {/* Entry dot on pill */}
                    <circle cx={(PILL_X + pillR).toFixed(1)} cy={dimY.toFixed(1)} r={3.5} fill={lineColor} />
                    {/* Dimension label */}
                    <text x={(PILL_X + pillR * 2 + 4).toFixed(1)} y={(dimY + 4).toFixed(1)} fontSize="10" fontWeight="600" fill="rgba(0,0,0,0.68)" fontFamily="system-ui">
                      {trunc(dim.subcategory, 20)}
                    </text>
                    {/* Tier dots — right end of pill */}
                    <circle cx={(PILL_X + PILL_W - 14).toFixed(1)} cy={(dimY - 4).toFixed(1)} r={4} fill={TIER_COLORS[dim.myTier]} opacity={0.9} />
                    <circle cx={(PILL_X + PILL_W - 14).toFixed(1)} cy={(dimY + 5).toFixed(1)} r={4} fill="none" stroke={TIER_COLORS[dim.theirTier]} strokeWidth={1.5} opacity={0.9} />
                  </g>
                );
              })}

              {group.dims.length > MAX_SHOWN && (
                <text x={(PILL_X + 8).toFixed(1)} y={(gy + group.groupH - 6).toFixed(1)} fontSize="8" fontWeight="600" fill={`rgba(${r},${g},${b},0.55)`} fontFamily="system-ui">
                  +{group.dims.length - MAX_SHOWN} more · tap to see all
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <p className="text-[10px] mt-2" style={{ color: 'rgba(0,0,0,0.25)' }}>tap any category to swipe through</p>

      {activeCatData && (
        <TensionCategorySheet
          catScore={activeCatData.catScore}
          dims={activeCatData.dims}
          myName={myName} theirName={theirName}
          myInitial={myInitial} theirInitial={theirInitial}
          onClose={() => setActiveCatId(null)}
        />
      )}
    </>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

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
  const [activeZone, setActiveZone] = useState(0);

  const { catScores, greenZone, tension, sharedNonWants } = useMemo(() => {
    const theirMap = new Map<string, Map<string, Tier>>();
    for (const cat of theirConnection.categories) {
      const m = new Map<string, Tier>();
      for (const r of cat.ratings) m.set(r.subcategory, r.tier);
      theirMap.set(cat.categoryId, m);
    }
    const allDims: DimData[] = [];
    const catScores: CatScore[] = [];
    for (const cat of myConnection.categories) {
      const catDef = DEFAULT_CATEGORIES.find(c => c.id === cat.categoryId);
      if (!catDef) continue;
      const theirCat = theirMap.get(cat.categoryId) || new Map<string, Tier>();
      const myMap = new Map<string, Tier>();
      for (const r of cat.ratings) myMap.set(r.subcategory, r.tier);
      const allKeys = new Set<string>();
      cat.ratings.forEach(r => allKeys.add(r.subcategory));
      theirCat.forEach((_, k) => allKeys.add(k));
      const dims: DimData[] = [];
      let aligned = 0;
      for (const dim of allKeys) {
        const myTier = myMap.get(dim) || 'off-limits';
        const theirTier = theirCat.get(dim) || 'off-limits';
        if (isPositive(myTier) === isPositive(theirTier)) aligned++;
        const d: DimData = { subcategory: dim, categoryId: catDef.id, categoryName: catDef.name, categoryColor: catDef.color, myTier, theirTier };
        dims.push(d); allDims.push(d);
      }
      dims.sort((a, b) => {
        const aA = isPositive(a.myTier) === isPositive(a.theirTier);
        const bA = isPositive(b.myTier) === isPositive(b.theirTier);
        if (aA !== bA) return aA ? -1 : 1;
        return ((isPositive(b.myTier) ? 2 : 0) + (isPositive(b.theirTier) ? 2 : 0)) - ((isPositive(a.myTier) ? 2 : 0) + (isPositive(a.theirTier) ? 2 : 0));
      });
      if (allKeys.size > 0) catScores.push({ id: catDef.id, name: catDef.name, color: catDef.color, alignedCount: aligned, totalCount: allKeys.size, ratio: aligned / allKeys.size, dims });
    }
    const greenZone = allDims.filter(d => isPositive(d.myTier) && isPositive(d.theirTier));
    const tension = allDims.filter(d => isPositive(d.myTier) !== isPositive(d.theirTier)).sort((a, b) => {
      const score = (d: DimData) => (d.myTier === 'must-have' || d.theirTier === 'must-have' ? 2 : 0) + (d.myTier === 'off-limits' || d.theirTier === 'off-limits' ? 1 : 0);
      return score(b) - score(a);
    });
    const sharedNonWants = allDims.filter(d => !isPositive(d.myTier) && !isPositive(d.theirTier));
    return { catScores, greenZone, tension, sharedNonWants };
  }, [myConnection, theirConnection]);

  const sentence = generateSentence(greenZone, tension, catScores, myName, theirName);
  const myColorRgb = hexToRgb(myConnection.color || '#C5A3CF');
  const theirColorRgb = hexToRgb(theirConnection.color || '#89CFF0');

  return (
    <>
    <div className="space-y-7 pb-8">

      {/* ── AI Sentence ── */}
      <div className="mx-5 rounded-3xl px-6 py-7 relative overflow-hidden" style={{ background: `linear-gradient(135deg, rgba(${myColorRgb[0]},${myColorRgb[1]},${myColorRgb[2]},0.18) 0%, rgba(${theirColorRgb[0]},${theirColorRgb[1]},${theirColorRgb[2]},0.18) 100%)`, border: '1.5px solid rgba(255,255,255,0.7)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <span className="absolute top-3 left-5 text-6xl leading-none select-none" style={{ color: `rgba(${myColorRgb[0]},${myColorRgb[1]},${myColorRgb[2]},0.2)`, fontFamily: 'Georgia, serif' }}>&ldquo;</span>
        <p className="text-base leading-relaxed text-center relative z-10 pt-3" style={{ fontFamily: 'Georgia, serif', color: 'rgba(0,0,0,0.72)', fontStyle: 'italic' }}>{sentence}</p>
        <p className="text-center text-xs mt-4 font-medium" style={{ color: 'rgba(0,0,0,0.3)' }}>{myName} &amp; {theirName}</p>
      </div>

      {/* ── Alignment by Area (% cards) ── */}
      <div>
        <p className="px-6 text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(0,0,0,0.3)' }}>Alignment by Area · tap to explore</p>
        <div className="flex gap-3 px-5 overflow-x-auto pb-1">
          {[...catScores].sort((a, b) => b.ratio - a.ratio).map((cat) => {
            const [r, g, b] = hexToRgb(cat.color);
            const pct = Math.round(cat.ratio * 100);
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCatId(cat.id)}
                className="shrink-0 flex flex-col items-center justify-center rounded-2xl px-3 py-4 transition-all active:scale-95"
                style={{ width: 80, background: `rgba(${r},${g},${b},${0.12 + (1 - cat.ratio) * 0.12})`, border: `1.5px solid rgba(${r},${g},${b},0.25)`, boxShadow: `0 2px 10px rgba(${r},${g},${b},0.12)` }}
              >
                <span className="text-2xl font-extrabold leading-none" style={{ color: `rgba(${r},${g},${b},1)` }}>{pct}<span className="text-xs font-bold">%</span></span>
                <span className="text-[9px] font-semibold uppercase tracking-wide text-center mt-1.5 leading-tight" style={{ color: 'rgba(0,0,0,0.45)' }}>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Green Zone / Red Zone card ── */}
      {(greenZone.length > 0 || sharedNonWants.length > 0) && (
        <div className="mx-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full" style={{ background: activeZone === 0 ? '#5BA84D' : '#D47020' }} />
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.3)' }}>
              {activeZone === 0 ? 'Green Zone' : 'Red Zone — our shared no’s'}
            </p>
            <span className="text-[10px]" style={{ color: 'rgba(0,0,0,0.2)' }}>tap a segment</span>
          </div>
          <div
            className="rounded-3xl px-5 py-6"
            style={{
              background: activeZone === 0 ? 'rgba(91,168,77,0.06)' : 'rgba(212,112,32,0.06)',
              border: `1.5px solid ${activeZone === 0 ? 'rgba(91,168,77,0.18)' : 'rgba(212,112,32,0.18)'}`,
              transition: 'background 0.3s ease, border-color 0.3s ease',
            }}
          >
            {activeZone === 0
              ? (greenZone.length > 0
                  ? <GreenZoneRing greenZone={greenZone} myInitial={myInitial} theirInitial={theirInitial} />
                  : <p className="text-center text-sm py-8 opacity-30">No shared yes&apos;s yet</p>
                )
              : (sharedNonWants.length > 0
                  ? <RedZonePentagon redZone={sharedNonWants} myInitial={myInitial} theirInitial={theirInitial} />
                  : <p className="text-center text-sm py-8 opacity-30">No shared no&apos;s yet</p>
                )
            }
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setActiveZone(activeZone === 0 ? 1 : 0)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95"
                style={{
                  background: activeZone === 0 ? 'rgba(212,112,32,0.1)' : 'rgba(91,168,77,0.1)',
                  color: activeZone === 0 ? '#D47020' : '#5BA84D',
                  border: `1px solid ${activeZone === 0 ? 'rgba(212,112,32,0.22)' : 'rgba(91,168,77,0.22)'}`,
                }}
              >
                {activeZone === 0 ? <>Red Zone →</> : <><span>←</span> Green Zone</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tension Explorer ── */}
      {tension.length > 0 && (
        <div className="mx-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full" style={{ background: '#D47020' }} />
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.3)' }}>Tension Points</p>
            <span className="text-[10px]" style={{ color: 'rgba(0,0,0,0.2)' }}>{tension.length} differences</span>
          </div>
          <TensionExplorer
            tension={tension} catScores={catScores}
            myName={myName} theirName={theirName}
            myInitial={myInitial} theirInitial={theirInitial}
          />
        </div>
      )}

    </div>

    {activeCatId && (() => {
      const cat = catScores.find(c => c.id === activeCatId);
      return cat ? <CategoryHeatmapPopup cat={cat} myInitial={myInitial} theirInitial={theirInitial} onClose={() => setActiveCatId(null)} /> : null;
    })()}
    </>
  );
}
