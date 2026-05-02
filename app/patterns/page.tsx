'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Connection, Tier } from '../lib/types';
import { getConnections } from '../lib/storage';
import { DEFAULT_CATEGORIES } from '../lib/categories';
import { type MenuTier } from '../lib/menu-categories';
import { ConnectionCircle } from '../components/ColorPicker';
import { SUBCATEGORY_DEFINITIONS } from '../lib/definitions';

// ── constants ─────────────────────────────────────────────────────────────────

const COMPARE_A_COLOR = '#7B68B0';
const COMPARE_B_COLOR = '#80C9C1';

// ── types ─────────────────────────────────────────────────────────────────────

type WantItem = { item: string; tier: MenuTier; categoryId: string };

// ── helpers ──────────────────────────────────────────────────────────────────

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b] as const;
}

function isPositive(t: Tier) { return t === 'must-have' || t === 'open'; }

function getMyMap(): WantItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('rl_my_menu');
    if (!data) return [];
    const profiles: { categoryId: string; ratings: { item: string; tier: MenuTier }[] }[] = JSON.parse(data);
    const seen = new Set<string>();
    const items: WantItem[] = [];
    for (const p of profiles) {
      for (const r of p.ratings) {
        if (!seen.has(r.item)) { seen.add(r.item); items.push({ item: r.item, tier: r.tier, categoryId: p.categoryId }); }
      }
    }
    return items;
  } catch { return []; }
}

const TIER_COLORS_DARK: Record<string, string> = {
  'must-have': '#007A6B', 'open': '#5BA84D', 'maybe': '#B8A520', 'off-limits': '#D47020',
};

const SLIDE_UP_STYLE = `@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`;

// ── UnmetSheet — dimensions missing coverage ──────────────────────────────────

type BarRow = { catDef: typeof DEFAULT_CATEGORIES[0]; unmet: WantItem[]; covered: WantItem[]; total: number };

function UnmetSheet({ catDef, unmet, onClose }: {
  catDef: typeof DEFAULT_CATEGORIES[0]; unmet: WantItem[]; onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden" style={{ background: 'var(--background)', boxShadow: '0 -8px 40px rgba(0,0,0,0.12)', maxHeight: '72vh', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.28s cubic-bezier(0.34,1.2,0.64,1)' }}>
        <div className="px-6 pt-4 pb-4 shrink-0" style={{ background: 'linear-gradient(135deg, rgba(212,112,32,0.12), rgba(212,112,32,0.06))' }}>
          <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'rgba(212,112,32,0.3)' }} />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold" style={{ color: 'rgba(0,0,0,0.75)' }}>{catDef.name}</h3>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(0,0,0,0.35)' }}>
                {unmet.length} unmet want{unmet.length !== 1 ? 's' : ''} in this area
              </p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: 'rgba(212,112,32,0.12)', color: 'rgba(0,0,0,0.4)' }}>✕</button>
          </div>
        </div>
        <div className="overflow-y-auto px-5 pb-8 pt-3 space-y-2">
          {unmet.map((want) => {
            const def = SUBCATEGORY_DEFINITIONS[want.item];
            return (
              <div key={want.item} className="rounded-2xl px-4 py-3" style={{ background: 'rgba(212,112,32,0.07)', border: '1.5px solid rgba(212,112,32,0.18)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold" style={{ color: 'rgba(0,0,0,0.72)' }}>{want.item}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full ml-auto font-medium shrink-0" style={{ background: want.tier === 'must-have' ? 'rgba(212,112,32,0.25)' : 'rgba(212,112,32,0.12)', color: '#D47020' }}>
                    {want.tier === 'must-have' ? 'Must-Have' : 'Want'}
                  </span>
                </div>
                {def && <p className="text-[11px] leading-relaxed" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: 'rgba(0,0,0,0.4)' }}>{def}</p>}
              </div>
            );
          })}
        </div>
      </div>
      <style>{SLIDE_UP_STYLE}</style>
    </>
  );
}

// ── UnmetBarChart — bar graph of gaps per category ────────────────────────────

function UnmetBarChart({ unmetByCategory, coveredByCategory }: {
  unmetByCategory: Map<string, WantItem[]>;
  coveredByCategory: Map<string, WantItem[]>;
}) {
  const [activeSheet, setActiveSheet] = useState<BarRow | null>(null);

  const rows = useMemo((): BarRow[] => {
    const allCatIds = new Set([...unmetByCategory.keys(), ...coveredByCategory.keys()]);
    const result: BarRow[] = [];
    for (const catId of allCatIds) {
      const catDef = DEFAULT_CATEGORIES.find((c) => c.id === catId);
      if (!catDef) continue;
      const unmet = unmetByCategory.get(catId) || [];
      const covered = coveredByCategory.get(catId) || [];
      result.push({ catDef, unmet, covered, total: unmet.length + covered.length });
    }
    return result.sort((a, b) => b.unmet.length - a.unmet.length);
  }, [unmetByCategory, coveredByCategory]);

  const maxUnmet = Math.max(...rows.map((r) => r.unmet.length), 1);
  const BAR_MAX_H = 100;

  return (
    <>
      <div className="flex items-end gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', paddingLeft: 2, paddingRight: 2 }}>
        {rows.map((row) => {
          const { catDef, unmet, covered } = row;
          const [r, g, b] = hexToRgb(catDef.color);
          const hasGap = unmet.length > 0;
          const coveredH = row.total > 0 ? (covered.length / row.total) * BAR_MAX_H : 0;
          const unmetH = hasGap ? Math.max((unmet.length / maxUnmet) * BAR_MAX_H, 14) : 0;

          return (
            <button
              key={catDef.id}
              onClick={() => hasGap ? setActiveSheet(row) : undefined}
              className="flex flex-col items-center gap-1.5 shrink-0 transition-all active:scale-95"
              style={{ width: 46, cursor: hasGap ? 'pointer' : 'default' }}
            >
              <span className="text-[11px] font-extrabold leading-none" style={{ color: hasGap ? '#D47020' : `rgba(${r},${g},${b},0.6)` }}>
                {hasGap ? unmet.length : '✓'}
              </span>
              <div className="w-full rounded-xl relative overflow-hidden" style={{ height: BAR_MAX_H, background: 'rgba(0,0,0,0.04)' }}>
                {covered.length > 0 && (
                  <div className="absolute bottom-0 w-full" style={{ height: coveredH, background: `rgba(${r},${g},${b},0.22)`, borderRadius: '8px 8px 0 0' }} />
                )}
                {hasGap && (
                  <div className="absolute bottom-0 w-full" style={{ height: unmetH, background: 'linear-gradient(to top, rgba(212,112,32,0.9), rgba(212,112,32,0.6))', borderRadius: unmetH >= BAR_MAX_H ? 8 : '8px 8px 0 0' }} />
                )}
                {hasGap && (
                  <div className="absolute inset-x-0 top-2 flex justify-center">
                    <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.7)' }}>tap</span>
                  </div>
                )}
              </div>
              <span className="text-center leading-tight" style={{ fontSize: 8, color: 'rgba(0,0,0,0.4)', maxWidth: 46, wordBreak: 'break-word' }}>
                {catDef.name.length > 9 ? catDef.name.slice(0, 8) + '…' : catDef.name}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex gap-4 mt-3 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(212,112,32,0.75)' }} />
          <span className="text-[9px]" style={{ color: 'rgba(0,0,0,0.35)' }}>Unmet — tap to see</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(0,148,131,0.3)' }} />
          <span className="text-[9px]" style={{ color: 'rgba(0,0,0,0.35)' }}>Covered</span>
        </div>
      </div>
      {activeSheet && (
        <UnmetSheet catDef={activeSheet.catDef} unmet={activeSheet.unmet} onClose={() => setActiveSheet(null)} />
      )}
    </>
  );
}

// ── CoverageCarousel — swipeable category accordion ───────────────────────────

function CoverageCarousel({ coveredByCategory, unmetByCategory, connectionCoverage }: {
  coveredByCategory: Map<string, WantItem[]>;
  unmetByCategory: Map<string, WantItem[]>;
  connectionCoverage: Map<string, { connName: string; connId: string; connColor: string; tier: Tier }[]>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  type CatData = { catDef: typeof DEFAULT_CATEGORIES[0]; covered: WantItem[]; unmet: WantItem[]; total: number; ratio: number };
  const categories = useMemo((): CatData[] => {
    const allCatIds = new Set([...coveredByCategory.keys(), ...unmetByCategory.keys()]);
    const result: CatData[] = [];
    for (const catId of allCatIds) {
      const catDef = DEFAULT_CATEGORIES.find((c) => c.id === catId);
      if (!catDef) continue;
      const covered = coveredByCategory.get(catId) || [];
      const unmet = unmetByCategory.get(catId) || [];
      const total = covered.length + unmet.length;
      result.push({ catDef, covered, unmet, total, ratio: total > 0 ? covered.length / total : 0 });
    }
    return result;
  }, [coveredByCategory, unmetByCategory]);

  function scrollTo(idx: number) {
    const el = scrollRef.current;
    if (!el) return;
    const child = el.children[idx] as HTMLElement;
    if (child) el.scrollTo({ left: child.offsetLeft, behavior: 'smooth' });
    setActiveIdx(idx);
    setExpandedItem(null);
  }

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== activeIdx) { setActiveIdx(idx); setExpandedItem(null); }
  }

  const activeCat = categories[activeIdx];

  return (
    <div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto"
        style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
      >
        {categories.map((cat) => {
          const { catDef, covered, unmet, total, ratio } = cat;
          const [r, g, b] = hexToRgb(catDef.color);
          const CX = 28, CY = 28, R = 20, STROKE = 7;
          const circ = 2 * Math.PI * R;
          const dash = ratio * circ;
          const allItems = [...covered, ...unmet];

          return (
            <div key={catDef.id} style={{ scrollSnapAlign: 'start', flexShrink: 0, width: '100%' }}>
              <div className="rounded-2xl px-4 py-4 mx-0.5" style={{ background: `rgba(${r},${g},${b},0.05)`, border: `1.5px solid rgba(${r},${g},${b},0.18)` }}>
                {/* Category header */}
                <div className="flex items-center gap-3 mb-3">
                  <svg width={56} height={56} viewBox="0 0 56 56" style={{ flexShrink: 0 }}>
                    <circle cx={CX} cy={CY} r={R} fill="none" stroke={`rgba(${r},${g},${b},0.12)`} strokeWidth={STROKE} />
                    <circle
                      cx={CX} cy={CY} r={R} fill="none"
                      stroke={`rgba(${r},${g},${b},0.85)`} strokeWidth={STROKE}
                      strokeLinecap="round"
                      strokeDasharray={`${dash.toFixed(2)} ${circ.toFixed(2)}`}
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '28px 28px' }}
                    />
                    <text x={CX} y={CY + 4} textAnchor="middle" fontSize="9" fontWeight="700" fill={`rgba(${r},${g},${b},0.9)`} fontFamily="system-ui">
                      {Math.round(ratio * 100)}%
                    </text>
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: catDef.color }}>{catDef.name}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(0,0,0,0.35)' }}>
                      {covered.length} of {total} want{total !== 1 ? 's' : ''} covered
                    </p>
                  </div>
                </div>

                {/* Items with inline accordion */}
                <div className="space-y-1.5">
                  {allItems.map((want) => {
                    const coveringConns = (connectionCoverage.get(want.item) || []).filter((c) => isPositive(c.tier));
                    const isCovered = coveringConns.length > 0;
                    const isOpen = expandedItem === want.item;
                    const def = SUBCATEGORY_DEFINITIONS[want.item];

                    return (
                      <div
                        key={want.item}
                        className="rounded-xl overflow-hidden"
                        style={{
                          background: isCovered ? `rgba(${r},${g},${b},0.08)` : 'rgba(212,112,32,0.06)',
                          border: `1px solid ${isCovered ? `rgba(${r},${g},${b},0.2)` : 'rgba(212,112,32,0.18)'}`,
                        }}
                      >
                        <button
                          onClick={() => isCovered ? setExpandedItem(isOpen ? null : want.item) : undefined}
                          className="w-full flex items-center gap-2.5 px-3 py-2 transition-all active:scale-[0.99]"
                          style={{ cursor: isCovered ? 'pointer' : 'default' }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isCovered ? catDef.color : '#D47020' }} />
                          <span className="flex-1 text-left text-xs font-medium" style={{ color: 'rgba(0,0,0,0.68)' }}>{want.item}</span>
                          {isCovered ? (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <div className="flex -space-x-1">
                                {coveringConns.slice(0, 4).map((c, i) => (
                                  <div key={i}><ConnectionCircle color={c.connColor} size={16} /></div>
                                ))}
                                {coveringConns.length > 4 && <span className="text-[9px] opacity-30 ml-1">+{coveringConns.length - 4}</span>}
                              </div>
                              <span className="text-[9px]" style={{ color: `rgba(${r},${g},${b},0.6)` }}>{isOpen ? '▲' : '▼'}</span>
                            </div>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(212,112,32,0.12)', color: '#D47020' }}>gap</span>
                          )}
                        </button>

                        {/* Inline accordion content */}
                        {isCovered && isOpen && (
                          <div
                            className="px-3 pb-3 pt-0"
                            style={{ borderTop: `1px solid rgba(${r},${g},${b},0.15)`, animation: 'tooltip-enter 0.15s ease-out' }}
                          >
                            {def && (
                              <p className="text-[11px] leading-relaxed pt-2 mb-2" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: 'rgba(0,0,0,0.45)' }}>
                                {def}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-1.5">
                              {coveringConns.map((c) => (
                                <Link
                                  key={c.connId}
                                  href={`/connection/${c.connId}`}
                                  className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium transition-opacity hover:opacity-80"
                                  style={{ background: `rgba(${hexToRgb(c.connColor).join(',')},0.12)`, color: 'rgba(0,0,0,0.6)', border: `1px solid rgba(${hexToRgb(c.connColor).join(',')},0.22)` }}
                                >
                                  <ConnectionCircle color={c.connColor} size={12} />
                                  {c.connName}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dot indicators + nav */}
      <div className="flex items-center justify-center gap-3 mt-3">
        <button
          onClick={() => scrollTo(Math.max(0, activeIdx - 1))}
          className="w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all"
          style={{ background: activeIdx > 0 ? `rgba(${hexToRgb(activeCat?.catDef.color || '#000').join(',')},0.12)` : 'rgba(0,0,0,0.04)', color: activeIdx > 0 ? activeCat?.catDef.color : 'rgba(0,0,0,0.2)', cursor: activeIdx > 0 ? 'pointer' : 'default' }}
        >
          ‹
        </button>
        <div className="flex gap-1.5">
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className="rounded-full transition-all"
              style={{ height: 6, width: activeIdx === i ? 18 : 6, background: activeIdx === i ? cat.catDef.color : 'rgba(0,0,0,0.12)' }}
            />
          ))}
        </div>
        <button
          onClick={() => scrollTo(Math.min(categories.length - 1, activeIdx + 1))}
          className="w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all"
          style={{ background: activeIdx < categories.length - 1 ? `rgba(${hexToRgb(activeCat?.catDef.color || '#000').join(',')},0.12)` : 'rgba(0,0,0,0.04)', color: activeIdx < categories.length - 1 ? activeCat?.catDef.color : 'rgba(0,0,0,0.2)', cursor: activeIdx < categories.length - 1 ? 'pointer' : 'default' }}
        >
          ›
        </button>
      </div>
    </div>
  );
}

// ── CoverageByPerson — pick a connection, see their coverage ──────────────────

function CoverageByPerson({ myWants, connections, connectionCoverage, overallPct }: {
  myWants: WantItem[];
  connections: Connection[];
  connectionCoverage: Map<string, { connName: string; connId: string; connColor: string; tier: Tier }[]>;
  overallPct: number | null;
}) {
  const [selectedId, setSelectedId] = useState(connections[0]?.id || '');

  const conn = connections.find((c) => c.id === selectedId);
  const [r, g, b] = hexToRgb(conn?.color || '#C5A3CF');

  const covered = useMemo(() => myWants.filter((want) => {
    const coverage = connectionCoverage.get(want.item);
    return coverage?.some((c) => c.connId === selectedId && isPositive(c.tier));
  }), [myWants, connectionCoverage, selectedId]);

  const gaps = useMemo(() => myWants.filter((want) => {
    const coverage = connectionCoverage.get(want.item);
    return !coverage?.some((c) => c.connId === selectedId && isPositive(c.tier));
  }), [myWants, connectionCoverage, selectedId]);

  const pct = myWants.length > 0 ? Math.round((covered.length / myWants.length) * 100) : 0;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid rgba(${r},${g},${b},0.22)` }}>
      {/* Picker */}
      <div className="px-4 pt-4 pb-3" style={{ background: `rgba(${r},${g},${b},0.04)` }}>
        {overallPct !== null && (
          <p className="text-[10px] mb-2.5" style={{ color: 'rgba(0,0,0,0.35)' }}>
            {overallPct}% covered across all connections
          </p>
        )}
        <div className="flex gap-1.5 flex-wrap">
          {connections.map((c) => {
            const [cr, cg, cb] = hexToRgb(c.color || '#C5A3CF');
            return (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
                style={{
                  background: selectedId === c.id ? `rgba(${cr},${cg},${cb},0.85)` : 'rgba(0,0,0,0.06)',
                  color: selectedId === c.id ? 'white' : 'rgba(0,0,0,0.5)',
                }}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {conn && (
        <div className="px-4 py-4">
          {/* Big % + label */}
          <div className="flex items-end gap-3 mb-3">
            <span className="text-4xl font-extrabold leading-none" style={{ fontFamily: 'Georgia, serif', color: 'rgba(0,0,0,0.72)' }}>{pct}%</span>
            <p className="text-sm pb-0.5" style={{ color: 'rgba(0,0,0,0.45)' }}>
              of your wants<br />{conn.name} covers
            </p>
          </div>

          {/* Bar */}
          <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: 'rgba(0,0,0,0.07)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: `rgba(${r},${g},${b},0.8)` }} />
          </div>

          {/* Covered chips */}
          {covered.length > 0 && (
            <div className="mb-3">
              <p className="text-[9px] uppercase tracking-wide font-semibold mb-1.5" style={{ color: 'rgba(0,0,0,0.3)' }}>
                Covers ({covered.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {covered.map((want) => (
                  <span key={want.item} className="text-[10px] px-2.5 py-1 rounded-full font-medium" style={{ background: `rgba(${r},${g},${b},0.1)`, color: `rgba(${r},${g},${b},1)`, border: `1px solid rgba(${r},${g},${b},0.22)` }}>
                    {want.item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Gap chips */}
          {gaps.length > 0 && (
            <div>
              <p className="text-[9px] uppercase tracking-wide font-semibold mb-1.5" style={{ color: 'rgba(0,0,0,0.3)' }}>
                Doesn&apos;t cover ({gaps.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {gaps.map((want) => (
                  <span key={want.item} className="text-[10px] px-2.5 py-1 rounded-full font-medium" style={{ background: 'rgba(212,112,32,0.08)', color: '#D47020', border: '1px solid rgba(212,112,32,0.18)' }}>
                    {want.item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── RadarChart ────────────────────────────────────────────────────────────────

function RadarChart({ connA, connB }: { connA: Connection; connB: Connection }) {
  const SIZE = 260;
  const CX = SIZE / 2, CY = SIZE / 2;
  const R = 95;
  const cats = DEFAULT_CATEGORIES;
  const N = cats.length;

  function getPoint(catId: string, conn: Connection): [number, number] {
    const cat = conn.categories.find((c) => c.categoryId === catId);
    if (!cat || cat.ratings.length === 0) return [CX, CY];
    const pos = cat.ratings.filter((r) => isPositive(r.tier)).length;
    const ratio = pos / cat.ratings.length;
    const angle = -Math.PI / 2 + (2 * Math.PI * cats.findIndex((c) => c.id === catId)) / N;
    return [CX + R * ratio * Math.cos(angle), CY + R * ratio * Math.sin(angle)];
  }

  const axisPoints = cats.map((cat, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / N;
    return {
      cat,
      ax: CX + R * Math.cos(angle),
      ay: CY + R * Math.sin(angle),
      lx: CX + (R + 18) * Math.cos(angle),
      ly: CY + (R + 18) * Math.sin(angle),
    };
  });

  const polyA = cats.map((cat) => getPoint(cat.id, connA).join(',')).join(' ');
  const polyB = cats.map((cat) => getPoint(cat.id, connB).join(',')).join(' ');
  const [arA, agA, abA] = hexToRgb(COMPARE_A_COLOR);
  const [arB, agB, abB] = hexToRgb(COMPARE_B_COLOR);

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
      {[0.25, 0.5, 0.75, 1].map((pct) => (
        <polygon
          key={pct}
          points={cats.map((cat, i) => {
            const angle = -Math.PI / 2 + (2 * Math.PI * i) / N;
            return `${(CX + R * pct * Math.cos(angle)).toFixed(1)},${(CY + R * pct * Math.sin(angle)).toFixed(1)}`;
          }).join(' ')}
          fill="none"
          stroke="rgba(0,0,0,0.07)"
          strokeWidth={pct === 1 ? 1.5 : 1}
        />
      ))}
      {axisPoints.map(({ cat, ax, ay }) => (
        <line key={cat.id} x1={CX} y1={CY} x2={ax.toFixed(1)} y2={ay.toFixed(1)} stroke="rgba(0,0,0,0.07)" strokeWidth="1" />
      ))}
      <polygon points={polyB} fill={`rgba(${arB},${agB},${abB},0.15)`} stroke={`rgba(${arB},${agB},${abB},0.85)`} strokeWidth={2} strokeLinejoin="round" />
      <polygon points={polyA} fill={`rgba(${arA},${agA},${abA},0.15)`} stroke={`rgba(${arA},${agA},${abA},0.85)`} strokeWidth={2} strokeLinejoin="round" />
      {axisPoints.map(({ cat, lx, ly }) => {
        const words = cat.name.split(' ');
        return (
          <text key={cat.id} x={lx.toFixed(1)} y={ly.toFixed(1)} textAnchor="middle" fontSize="7.5" fontWeight="600" fill="rgba(0,0,0,0.45)" fontFamily="system-ui">
            {words.length === 1 ? (
              <tspan>{cat.name}</tspan>
            ) : words.length === 2 ? (
              <>
                <tspan x={lx.toFixed(1)} dy="-4">{words[0]}</tspan>
                <tspan x={lx.toFixed(1)} dy="10">{words[1]}</tspan>
              </>
            ) : (
              <>
                <tspan x={lx.toFixed(1)} dy="-7">{words[0]}</tspan>
                <tspan x={lx.toFixed(1)} dy="9">{words[1]}</tspan>
                <tspan x={lx.toFixed(1)} dy="9">{words.slice(2).join(' ')}</tspan>
              </>
            )}
          </text>
        );
      })}
      <circle cx={CX} cy={CY} r={3} fill="rgba(0,0,0,0.15)" />
    </svg>
  );
}

function ConnectionCompare({ connections }: { connections: Connection[] }) {
  const [selA, setSelA] = useState<string>(connections[0]?.id || '');
  const [selB, setSelB] = useState<string>(connections[1]?.id || '');

  const connA = connections.find((c) => c.id === selA);
  const connB = connections.find((c) => c.id === selB);

  const similarity = useMemo(() => {
    if (!connA || !connB) return null;
    let match = 0, total = 0;
    for (const catA of connA.categories) {
      const catB = connB.categories.find((c) => c.categoryId === catA.categoryId);
      if (!catB) continue;
      const mapB = new Map(catB.ratings.map((r) => [r.subcategory, r.tier]));
      for (const r of catA.ratings) {
        const tb = mapB.get(r.subcategory);
        if (!tb) continue;
        total++;
        if (isPositive(r.tier) === isPositive(tb)) match++;
      }
    }
    return total > 0 ? Math.round((match / total) * 100) : null;
  }, [connA, connB]);

  if (connections.length < 2) return null;

  const [rA, gA, bA] = hexToRgb(COMPARE_A_COLOR);
  const [rB, gB, bB] = hexToRgb(COMPARE_B_COLOR);

  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.02)', border: '1.5px solid rgba(0,0,0,0.07)' }}>
      <div className="px-5 pt-5 pb-4 space-y-3">
        {(['A', 'B'] as const).map((slot) => {
          const sel = slot === 'A' ? selA : selB;
          const otherSel = slot === 'A' ? selB : selA;
          const setSel = slot === 'A' ? setSelA : setSelB;
          const slotColor = slot === 'A' ? COMPARE_A_COLOR : COMPARE_B_COLOR;
          const [sr, sg, sb] = hexToRgb(slotColor);
          return (
            <div key={slot}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: slotColor }} />
                <p className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(0,0,0,0.3)' }}>
                  {slot === 'A' ? 'First connection' : 'Second connection'}
                </p>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {connections.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSel(c.id)}
                    disabled={c.id === otherSel}
                    className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all disabled:opacity-25"
                    style={{
                      background: sel === c.id ? `rgba(${sr},${sg},${sb},0.85)` : 'rgba(0,0,0,0.06)',
                      color: sel === c.id ? 'white' : 'rgba(0,0,0,0.5)',
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {connA && connB && connA.id !== connB.id && (
        <>
          {similarity !== null && (
            <div className="mx-5 mb-4 rounded-2xl px-4 py-3" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex items-end gap-3 mb-2">
                <span className="text-xl font-extrabold" style={{ fontFamily: 'Georgia, serif', color: 'rgba(0,0,0,0.72)' }}>{similarity}%</span>
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'rgba(0,0,0,0.55)' }}>openness alignment</p>
                  <p className="text-[10px]" style={{ color: 'rgba(0,0,0,0.32)' }}>shared dimensions where both are open — or both not</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COMPARE_A_COLOR }} />
                <span className="text-xs font-medium" style={{ color: 'rgba(0,0,0,0.5)' }}>{connA.name}</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden mx-1" style={{ background: 'rgba(0,0,0,0.06)' }}>
                  <div className="h-full rounded-full" style={{ width: `${similarity}%`, background: `linear-gradient(90deg, ${COMPARE_A_COLOR}, ${COMPARE_B_COLOR})` }} />
                </div>
                <span className="text-xs font-medium" style={{ color: 'rgba(0,0,0,0.5)' }}>{connB.name}</span>
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COMPARE_B_COLOR }} />
              </div>
            </div>
          )}
          <div className="px-4 pb-5">
            <RadarChart connA={connA} connB={connB} />
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-1.5 rounded-full" style={{ background: `rgba(${rA},${gA},${bA},0.85)` }} />
                <span className="text-[10px] font-medium" style={{ color: 'rgba(0,0,0,0.5)' }}>{connA.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-1.5 rounded-full" style={{ background: `rgba(${rB},${gB},${bB},0.85)` }} />
                <span className="text-[10px] font-medium" style={{ color: 'rgba(0,0,0,0.5)' }}>{connB.name}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PatternsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [myMapItems, setMyMapItems] = useState<WantItem[]>([]);

  useEffect(() => {
    setConnections(getConnections());
    setMyMapItems(getMyMap());
  }, []);

  if (connections.length === 0) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-8">
        <p className="text-lg opacity-40 mb-4">No connections yet</p>
        <Link href="/new" className="px-6 py-3 rounded-2xl text-white font-medium" style={{ background: 'var(--peach)' }}>
          Create your first connection
        </Link>
      </div>
    );
  }

  const hasMyMap = myMapItems.length > 0;

  const connectionCoverage = new Map<string, { connName: string; connId: string; connColor: string; tier: Tier }[]>();
  for (const conn of connections) {
    for (const cat of conn.categories) {
      for (const r of cat.ratings) {
        if (!connectionCoverage.has(r.subcategory)) connectionCoverage.set(r.subcategory, []);
        connectionCoverage.get(r.subcategory)!.push({ connName: conn.name, connId: conn.id, connColor: conn.color || conn.emoji || '#C5A3CF', tier: r.tier });
      }
    }
  }

  const myWants = myMapItems.filter((i) => i.tier === 'must-have' || i.tier === 'open');

  const unmetWants = myWants.filter((want) => {
    const coverage = connectionCoverage.get(want.item);
    return !coverage || !coverage.some((c) => isPositive(c.tier));
  });

  const coveredWants = myWants.filter((want) => {
    const coverage = connectionCoverage.get(want.item);
    return coverage && coverage.some((c) => isPositive(c.tier));
  });

  const groupByCategory = (items: WantItem[]) => {
    const map = new Map<string, WantItem[]>();
    for (const item of items) {
      if (!map.has(item.categoryId)) map.set(item.categoryId, []);
      map.get(item.categoryId)!.push(item);
    }
    return map;
  };

  const unmetByCategory = groupByCategory(unmetWants);
  const coveredByCategory = groupByCategory(coveredWants);

  const coveragePct = myWants.length > 0 ? Math.round((coveredWants.length / myWants.length) * 100) : null;

  const mutualMustHaves = myMapItems
    .filter((i) => i.tier === 'must-have')
    .filter((want) => {
      if (connections.length === 0) return false;
      return connections.every((conn) => {
        const coverage = connectionCoverage.get(want.item);
        return coverage?.some((c) => c.connId === conn.id && isPositive(c.tier));
      });
    });

  return (
    <div className="page-enter min-h-dvh pb-10">
      <div className="px-5 pt-5 pb-3">
        <Link href="/" className="text-sm opacity-60 hover:opacity-100 transition-opacity">&larr; Home</Link>
      </div>

      <div className="px-5 pt-2 pb-6">
        <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: 'Georgia, serif' }}>Patterns</h1>
        <p className="text-sm opacity-50">Across {connections.length} connection{connections.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="space-y-8">

        {/* ── Unmet Wants ── */}
        {hasMyMap && (
          <div className="mx-5">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full" style={{ background: '#D47020' }} />
                <h2 className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.4)' }}>Unmet Wants</h2>
              </div>
              <p className="text-xs" style={{ color: 'rgba(0,0,0,0.35)' }}>
                {unmetWants.length === 0
                  ? 'All your wants are covered across your connections'
                  : `${unmetWants.length} thing${unmetWants.length !== 1 ? 's' : ''} you want that no connection covers — tap a bar to see which`}
              </p>
            </div>
            <UnmetBarChart unmetByCategory={unmetByCategory} coveredByCategory={coveredByCategory} />
          </div>
        )}

        {/* ── Coverage Map ── */}
        {hasMyMap && myWants.length > 0 && (
          <div className="mx-5">
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full" style={{ background: '#007A6B' }} />
                <h2 className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.4)' }}>Coverage Map</h2>
              </div>
              <p className="text-xs" style={{ color: 'rgba(0,0,0,0.35)' }}>Swipe through categories — tap covered items to expand</p>
            </div>
            <CoverageCarousel
              coveredByCategory={coveredByCategory}
              unmetByCategory={unmetByCategory}
              connectionCoverage={connectionCoverage}
            />
          </div>
        )}

        {/* ── Coverage by Person ── */}
        {hasMyMap && myWants.length > 0 && connections.length > 0 && (
          <div className="mx-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full" style={{ background: '#5BA84D' }} />
              <h2 className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.4)' }}>Coverage by Person</h2>
            </div>
            <CoverageByPerson
              myWants={myWants}
              connections={connections}
              connectionCoverage={connectionCoverage}
              overallPct={coveragePct}
            />
          </div>
        )}

        {/* ── Compare Connections ── */}
        {connections.length >= 2 && (
          <div className="mx-5">
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full" style={{ background: '#7B68B0' }} />
                <h2 className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.4)' }}>Compare Connections</h2>
              </div>
              <p className="text-xs" style={{ color: 'rgba(0,0,0,0.35)' }}>See how two connections map onto each other</p>
            </div>
            <ConnectionCompare connections={connections} />
          </div>
        )}

        {/* ── Mutual Must-Haves ── */}
        {hasMyMap && connections.length >= 2 && mutualMustHaves.length > 0 && (
          <div className="mx-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full" style={{ background: '#009483' }} />
              <h2 className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.4)' }}>Mutual Must-Haves</h2>
            </div>
            <div className="rounded-2xl px-4 py-4" style={{ background: 'rgba(0,148,131,0.04)', border: '1.5px solid rgba(0,148,131,0.16)' }}>
              <p className="text-xs mb-3" style={{ color: 'rgba(0,0,0,0.4)' }}>
                Things you must-have that every connection covers — your relational bedrock
              </p>
              <div className="flex flex-wrap gap-2">
                {mutualMustHaves.map((want) => {
                  const catDef = DEFAULT_CATEGORIES.find((c) => c.id === want.categoryId);
                  const color = catDef?.color || '#009483';
                  const [r, g, b] = hexToRgb(color);
                  return (
                    <span key={want.item} className="text-xs px-3 py-1.5 rounded-full font-semibold" style={{ background: `rgba(${r},${g},${b},0.12)`, color, border: `1.5px solid rgba(${r},${g},${b},0.28)` }}>
                      ✦ {want.item}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* No My Map notice */}
        {!hasMyMap && (
          <div className="mx-5 watercolor-card bg-white/50 p-5">
            <p className="text-sm opacity-50 mb-2">Complete your personal map to see blind spots and coverage analysis.</p>
            <Link href="/menu" className="text-sm font-medium" style={{ color: '#007A6B' }}>
              Create My Map →
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
