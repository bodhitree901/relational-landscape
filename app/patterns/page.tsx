'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Connection, Tier } from '../lib/types';
import { getConnections } from '../lib/storage';
import { DEFAULT_CATEGORIES } from '../lib/categories';
import { MENU_TIER_COLORS, type MenuTier } from '../lib/menu-categories';
import { ConnectionCircle } from '../components/ColorPicker';
import { SUBCATEGORY_DEFINITIONS } from '../lib/definitions';

// ── helpers ──────────────────────────────────────────────────────────────────

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b] as const;
}

function isPositive(t: Tier) { return t === 'must-have' || t === 'open'; }

function getMyMap(): { item: string; tier: MenuTier; categoryId: string }[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('rl_my_menu');
    if (!data) return [];
    const profiles: { categoryId: string; ratings: { item: string; tier: MenuTier }[] }[] = JSON.parse(data);
    const seen = new Set<string>();
    const items: { item: string; tier: MenuTier; categoryId: string }[] = [];
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

// ── CoverageSheet — who covers a dimension ───────────────────────────────────

function CoverageSheet({ item, categoryColor, coveringConns, onClose }: {
  item: string; categoryColor: string; coveringConns: { connName: string; connId: string; connColor: string; tier: Tier }[]; onClose: () => void;
}) {
  const [r, g, b] = hexToRgb(categoryColor);
  const def = SUBCATEGORY_DEFINITIONS[item];
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden" style={{ background: 'var(--background)', boxShadow: '0 -8px 40px rgba(0,0,0,0.12)', maxHeight: '72vh', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.28s cubic-bezier(0.34,1.2,0.64,1)' }}>
        <div className="px-6 pt-4 pb-4 shrink-0" style={{ background: `linear-gradient(135deg, rgba(${r},${g},${b},0.18), rgba(${r},${g},${b},0.08))` }}>
          <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: `rgba(${r},${g},${b},0.4)` }} />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold" style={{ color: 'rgba(0,0,0,0.75)' }}>{item}</h3>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(0,0,0,0.35)' }}>{coveringConns.length} connection{coveringConns.length !== 1 ? 's' : ''} cover this</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: `rgba(${r},${g},${b},0.15)`, color: 'rgba(0,0,0,0.4)' }}>✕</button>
          </div>
        </div>
        <div className="overflow-y-auto px-5 pb-8 pt-3 space-y-3">
          {def && <p className="text-sm leading-relaxed px-1 pb-1" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: 'rgba(0,0,0,0.5)' }}>{def}</p>}
          {coveringConns.map((c) => (
            <Link key={c.connId} href={`/connection/${c.connId}`} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: `rgba(${hexToRgb(c.connColor).join(',')},0.08)`, border: `1.5px solid rgba(${hexToRgb(c.connColor).join(',')},0.2)` }}>
              <ConnectionCircle color={c.connColor} size={28} />
              <div className="flex-1">
                <p className="text-sm font-semibold">{c.connName}</p>
                <p className="text-[10px] mt-0.5" style={{ color: TIER_COLORS_DARK[c.tier] }}>{c.tier === 'must-have' ? 'Actively wants this' : 'Open to this'}</p>
              </div>
              <span className="text-xs opacity-30">→</span>
            </Link>
          ))}
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </>
  );
}

// ── GapBars — Unmet Wants ─────────────────────────────────────────────────────

function GapBars({ unmetByCategory, coveredByCategory }: {
  unmetByCategory: Map<string, { item: string; tier: MenuTier; categoryId: string }[]>;
  coveredByCategory: Map<string, { item: string; tier: MenuTier; categoryId: string }[]>;
}) {
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  type WantItem = { item: string; tier: MenuTier; categoryId: string };
  type RowData = { catDef: typeof DEFAULT_CATEGORIES[0]; unmet: WantItem[]; covered: WantItem[]; total: number; coverPct: number };
  const rows = useMemo((): RowData[] => {
    const allCatIds = new Set([...unmetByCategory.keys(), ...coveredByCategory.keys()]);
    const result: RowData[] = [];
    for (const catId of allCatIds) {
      const catDef = DEFAULT_CATEGORIES.find((c) => c.id === catId);
      if (!catDef) continue;
      const unmet = unmetByCategory.get(catId) || [];
      const covered = coveredByCategory.get(catId) || [];
      const total = unmet.length + covered.length;
      const coverPct = total > 0 ? (covered.length / total) * 100 : 0;
      result.push({ catDef, unmet, covered, total, coverPct });
    }
    return result;
  }, [unmetByCategory, coveredByCategory]);

  return (
    <div className="space-y-3">
      {rows.map(({ catDef, unmet, covered, total, coverPct }) => {
        const [r, g, b] = hexToRgb(catDef.color);
        const isExpanded = expandedCat === catDef.id;
        const gapPct = 100 - coverPct;
        return (
          <button
            key={catDef.id}
            onClick={() => setExpandedCat(isExpanded ? null : catDef.id)}
            className="w-full text-left rounded-2xl px-4 pt-4 pb-3 transition-all active:scale-[0.99]"
            style={{ background: `rgba(${r},${g},${b},0.06)`, border: `1.5px solid rgba(${r},${g},${b},0.2)` }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: catDef.color }}>{catDef.name}</p>
              <p className="text-[10px]" style={{ color: 'rgba(0,0,0,0.35)' }}>
                {unmet.length} gap{unmet.length !== 1 ? 's' : ''} · {covered.length} covered
              </p>
            </div>
            {/* Bar */}
            <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(0,0,0,0.06)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${coverPct}%`,
                  background: `rgba(${r},${g},${b},0.7)`,
                }}
              />
            </div>
            {/* Unmet chips — always visible */}
            <div className="flex flex-wrap gap-1.5">
              {unmet.map((item) => (
                <span
                  key={item.item}
                  className="text-[10px] px-2.5 py-1 rounded-full font-medium"
                  style={{
                    background: item.tier === 'must-have' ? 'rgba(212,112,32,0.12)' : 'rgba(212,112,32,0.07)',
                    color: '#D47020',
                    border: `1px solid rgba(212,112,32,${item.tier === 'must-have' ? 0.3 : 0.15})`,
                    fontWeight: item.tier === 'must-have' ? 700 : 500,
                  }}
                >
                  {item.item}
                </span>
              ))}
            </div>
            {/* Covered chips — only when expanded */}
            {isExpanded && covered.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-black/5" style={{ animation: 'tooltip-enter 0.15s ease-out' }}>
                <p className="w-full text-[9px] uppercase tracking-wide font-semibold mb-0.5" style={{ color: 'rgba(0,0,0,0.25)' }}>Covered</p>
                {covered.map((item) => (
                  <span
                    key={item.item}
                    className="text-[10px] px-2.5 py-1 rounded-full font-medium"
                    style={{ background: `rgba(${r},${g},${b},0.1)`, color: catDef.color, border: `1px solid rgba(${r},${g},${b},0.2)` }}
                  >
                    {item.item}
                  </span>
                ))}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Coverage Rings — who covers what ─────────────────────────────────────────

function CoverageRings({ coveredByCategory, unmetByCategory, connectionCoverage }: {
  coveredByCategory: Map<string, { item: string; tier: MenuTier; categoryId: string }[]>;
  unmetByCategory: Map<string, { item: string; tier: MenuTier; categoryId: string }[]>;
  connectionCoverage: Map<string, { connName: string; connId: string; connColor: string; tier: Tier }[]>;
}) {
  const [activeItem, setActiveItem] = useState<{ item: string; catColor: string; conns: { connName: string; connId: string; connColor: string; tier: Tier }[] } | null>(null);

  type WantItem2 = { item: string; tier: MenuTier; categoryId: string };
  type CatData = { catDef: typeof DEFAULT_CATEGORIES[0]; covered: WantItem2[]; unmet: WantItem2[]; total: number; ratio: number };
  const categories = useMemo((): CatData[] => {
    const allCatIds = new Set([...coveredByCategory.keys(), ...unmetByCategory.keys()]);
    const result: CatData[] = [];
    for (const catId of allCatIds) {
      const catDef = DEFAULT_CATEGORIES.find((c) => c.id === catId);
      if (!catDef) continue;
      const covered = coveredByCategory.get(catId) || [];
      const unmet = unmetByCategory.get(catId) || [];
      const total = covered.length + unmet.length;
      const ratio = total > 0 ? covered.length / total : 0;
      result.push({ catDef, covered, unmet, total, ratio });
    }
    return result;
  }, [coveredByCategory, unmetByCategory]);

  return (
    <div className="space-y-3">
      {categories.map(({ catDef, covered, unmet, total, ratio }) => {
        const [r, g, b] = hexToRgb(catDef.color);
        const CX = 28, CY = 28, R = 20, STROKE = 7;
        const circ = 2 * Math.PI * R;
        const dash = ratio * circ;
        const allItems = [...covered, ...unmet];

        return (
          <div key={catDef.id} className="rounded-2xl px-4 py-4" style={{ background: `rgba(${r},${g},${b},0.05)`, border: `1.5px solid rgba(${r},${g},${b},0.18)` }}>
            {/* Category header with mini ring */}
            <div className="flex items-center gap-3 mb-3">
              <svg width={56} height={56} viewBox="0 0 56 56" style={{ flexShrink: 0 }}>
                <circle cx={CX} cy={CY} r={R} fill="none" stroke={`rgba(${r},${g},${b},0.12)`} strokeWidth={STROKE} />
                <circle
                  cx={CX} cy={CY} r={R} fill="none"
                  stroke={`rgba(${r},${g},${b},0.85)`} strokeWidth={STROKE}
                  strokeLinecap="round"
                  strokeDasharray={`${dash.toFixed(2)} ${circ.toFixed(2)}`}
                  strokeDashoffset={(circ / 4).toFixed(2)}
                  transform="rotate(-90 28 28) scale(-1 1) translate(-56 0)"
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
            {/* Items */}
            <div className="space-y-1.5">
              {allItems.map((want) => {
                const coveringConns = (connectionCoverage.get(want.item) || []).filter((c) => isPositive(c.tier));
                const isCovered = coveringConns.length > 0;
                return (
                  <button
                    key={want.item}
                    onClick={() => isCovered ? setActiveItem({ item: want.item, catColor: catDef.color, conns: coveringConns }) : undefined}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all active:scale-[0.98]"
                    style={{
                      background: isCovered ? `rgba(${r},${g},${b},0.08)` : 'rgba(212,112,32,0.06)',
                      border: `1px solid ${isCovered ? `rgba(${r},${g},${b},0.2)` : 'rgba(212,112,32,0.18)'}`,
                      cursor: isCovered ? 'pointer' : 'default',
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isCovered ? catDef.color : '#D47020' }} />
                    <span className="flex-1 text-left text-xs font-medium" style={{ color: 'rgba(0,0,0,0.68)' }}>{want.item}</span>
                    {isCovered ? (
                      <div className="flex -space-x-1 shrink-0">
                        {coveringConns.slice(0, 4).map((c, i) => (
                          <div key={i}><ConnectionCircle color={c.connColor} size={16} /></div>
                        ))}
                        {coveringConns.length > 4 && <span className="text-[9px] opacity-30 ml-1">+{coveringConns.length - 4}</span>}
                      </div>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(212,112,32,0.12)', color: '#D47020' }}>gap</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {activeItem && (
        <CoverageSheet
          item={activeItem.item}
          categoryColor={activeItem.catColor}
          coveringConns={activeItem.conns}
          onClose={() => setActiveItem(null)}
        />
      )}
    </div>
  );
}

// ── Radar Chart ───────────────────────────────────────────────────────────────

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
  const [arA, agA, abA] = hexToRgb(connA.color || '#C5A3CF');
  const [arB, agB, abB] = hexToRgb(connB.color || '#89CFF0');

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
      {/* Grid rings */}
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
      {/* Axis lines */}
      {axisPoints.map(({ cat, ax, ay }) => (
        <line key={cat.id} x1={CX} y1={CY} x2={ax.toFixed(1)} y2={ay.toFixed(1)} stroke="rgba(0,0,0,0.07)" strokeWidth="1" />
      ))}
      {/* Connection B polygon (behind) */}
      <polygon points={polyB} fill={`rgba(${arB},${agB},${abB},0.15)`} stroke={`rgba(${arB},${agB},${abB},0.8)`} strokeWidth={2} strokeLinejoin="round" />
      {/* Connection A polygon (front) */}
      <polygon points={polyA} fill={`rgba(${arA},${agA},${abA},0.15)`} stroke={`rgba(${arA},${agA},${abA},0.8)`} strokeWidth={2} strokeLinejoin="round" />
      {/* Axis labels */}
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
      {/* Center dot */}
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

  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.02)', border: '1.5px solid rgba(0,0,0,0.07)' }}>
      {/* Pickers */}
      <div className="px-5 pt-5 pb-4 space-y-3">
        {(['A', 'B'] as const).map((slot) => {
          const sel = slot === 'A' ? selA : selB;
          const otherSel = slot === 'A' ? selB : selA;
          const setSel = slot === 'A' ? setSelA : setSelB;
          const conn = connections.find((c) => c.id === sel);
          return (
            <div key={slot}>
              <p className="text-[9px] uppercase tracking-widest font-semibold mb-1.5" style={{ color: 'rgba(0,0,0,0.3)' }}>
                {slot === 'A' ? 'First connection' : 'Second connection'}
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {connections.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSel(c.id)}
                    disabled={c.id === otherSel}
                    className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all disabled:opacity-25"
                    style={{
                      background: sel === c.id ? (c.color || '#C5A3CF') : 'rgba(0,0,0,0.06)',
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
          {/* Similarity score */}
          {similarity !== null && (
            <div className="mx-5 mb-4 rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: connA.color || '#C5A3CF' }} />
                <span className="text-xs font-semibold">{connA.name}</span>
              </div>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden mx-2" style={{ background: 'rgba(0,0,0,0.06)' }}>
                <div className="h-full rounded-full" style={{ width: `${similarity}%`, background: `linear-gradient(90deg, ${connA.color || '#C5A3CF'}, ${connB.color || '#89CFF0'})` }} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">{connB.name}</span>
                <div className="w-3 h-3 rounded-full" style={{ background: connB.color || '#89CFF0' }} />
              </div>
              <span className="text-sm font-bold ml-2" style={{ color: 'rgba(0,0,0,0.55)' }}>{similarity}%</span>
            </div>
          )}
          {/* Radar */}
          <div className="px-4 pb-5">
            <RadarChart connA={connA} connB={connB} />
            {/* Legend */}
            <div className="flex justify-center gap-5 mt-2">
              {[connA, connB].map((c) => {
                const [r, g, b] = hexToRgb(c.color || '#C5A3CF');
                return (
                  <div key={c.id} className="flex items-center gap-1.5">
                    <div className="w-8 h-1.5 rounded-full" style={{ background: `rgba(${r},${g},${b},0.8)` }} />
                    <span className="text-[10px] font-medium" style={{ color: 'rgba(0,0,0,0.5)' }}>{c.name}</span>
                  </div>
                );
              })}
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
  const [myMapItems, setMyMapItems] = useState<{ item: string; tier: MenuTier; categoryId: string }[]>([]);

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

  // Build connection coverage map
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

  const groupByCategory = (items: typeof myWants) => {
    const map = new Map<string, typeof myWants>();
    for (const item of items) {
      if (!map.has(item.categoryId)) map.set(item.categoryId, []);
      map.get(item.categoryId)!.push(item);
    }
    return map;
  };

  const unmetByCategory = groupByCategory(unmetWants);
  const coveredByCategory = groupByCategory(coveredWants);

  // ── Coverage fullness ──
  const coveragePct = myWants.length > 0 ? Math.round((coveredWants.length / myWants.length) * 100) : null;

  // ── Who covers you most ──
  const coverageByConn = connections.map((conn) => {
    const count = myWants.filter((want) => {
      const coverage = connectionCoverage.get(want.item);
      return coverage?.some((c) => c.connId === conn.id && isPositive(c.tier));
    }).length;
    return { conn, count, pct: myWants.length > 0 ? Math.round((count / myWants.length) * 100) : 0 };
  }).sort((a, b) => b.count - a.count);

  // ── Unique coverage ──
  const uniqueByConn = connections.map((conn) => {
    const unique = myWants.filter((want) => {
      const covering = (connectionCoverage.get(want.item) || []).filter((c) => isPositive(c.tier));
      return covering.length === 1 && covering[0].connId === conn.id;
    });
    return { conn, items: unique };
  }).filter((c) => c.items.length > 0).sort((a, b) => b.items.length - a.items.length);

  // ── Mutual must-haves ──
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
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full" style={{ background: '#D47020' }} />
                <h2 className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.4)' }}>Unmet Wants</h2>
              </div>
              <p className="text-xs" style={{ color: 'rgba(0,0,0,0.35)' }}>
                {unmetWants.length === 0
                  ? 'All your wants are covered across your connections'
                  : `${unmetWants.length} thing${unmetWants.length !== 1 ? 's' : ''} you want that no connection covers`}
              </p>
            </div>
            <GapBars unmetByCategory={unmetByCategory} coveredByCategory={coveredByCategory} />
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
              <p className="text-xs" style={{ color: 'rgba(0,0,0,0.35)' }}>Who covers what across your connections</p>
            </div>
            <CoverageRings
              coveredByCategory={coveredByCategory}
              unmetByCategory={unmetByCategory}
              connectionCoverage={connectionCoverage}
            />
          </div>
        )}

        {/* ── Radar Comparison ── */}
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

        {/* ── Coverage Fullness ── */}
        {hasMyMap && coveragePct !== null && (
          <div className="mx-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full" style={{ background: '#5BA84D' }} />
              <h2 className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.4)' }}>Coverage Fullness</h2>
            </div>
            <div className="rounded-2xl px-5 py-5" style={{ background: 'rgba(91,168,77,0.05)', border: '1.5px solid rgba(91,168,77,0.18)' }}>
              <div className="flex items-end gap-3 mb-3">
                <span className="text-5xl font-extrabold leading-none" style={{ fontFamily: 'Georgia, serif', color: 'rgba(0,0,0,0.72)' }}>{coveragePct}%</span>
                <p className="text-sm pb-1" style={{ color: 'rgba(0,0,0,0.45)' }}>of your wants are covered<br />by at least one connection</p>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${coveragePct}%`, background: 'linear-gradient(90deg, #80C9C1, #81CC73)' }} />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[9px]" style={{ color: 'rgba(0,0,0,0.3)' }}>{coveredWants.length} covered</span>
                <span className="text-[9px]" style={{ color: 'rgba(0,0,0,0.3)' }}>{unmetWants.length} gaps</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Who Covers You Most ── */}
        {hasMyMap && coverageByConn.length > 0 && myWants.length > 0 && (
          <div className="mx-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full" style={{ background: '#89CFF0' }} />
              <h2 className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.4)' }}>Who Covers You Most</h2>
            </div>
            <div className="rounded-2xl px-5 py-4 space-y-3" style={{ background: 'rgba(137,207,240,0.05)', border: '1.5px solid rgba(137,207,240,0.22)' }}>
              {coverageByConn.map(({ conn, count, pct }, i) => {
                const [r, g, b] = hexToRgb(conn.color || '#89CFF0');
                return (
                  <div key={conn.id} className="flex items-center gap-3">
                    <span className="text-[10px] font-bold w-4 shrink-0 text-right" style={{ color: 'rgba(0,0,0,0.25)' }}>{i + 1}</span>
                    <ConnectionCircle color={conn.color || '#89CFF0'} size={24} />
                    <span className="text-sm font-medium flex-1 truncate">{conn.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `rgba(${r},${g},${b},0.8)` }} />
                      </div>
                      <span className="text-[10px] font-semibold w-8 text-right" style={{ color: `rgba(${r},${g},${b},1)` }}>{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Unique Coverage ── */}
        {hasMyMap && uniqueByConn.length > 0 && (
          <div className="mx-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full" style={{ background: '#C5A3CF' }} />
              <h2 className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.4)' }}>Unique Coverage</h2>
            </div>
            <div className="space-y-2">
              {uniqueByConn.map(({ conn, items }) => {
                const [r, g, b] = hexToRgb(conn.color || '#C5A3CF');
                return (
                  <div key={conn.id} className="rounded-2xl px-4 py-3" style={{ background: `rgba(${r},${g},${b},0.06)`, border: `1.5px solid rgba(${r},${g},${b},0.2)` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <ConnectionCircle color={conn.color || '#C5A3CF'} size={20} />
                      <span className="text-xs font-semibold">{conn.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full ml-auto" style={{ background: `rgba(${r},${g},${b},0.15)`, color: `rgba(${r},${g},${b},1)` }}>
                        only one
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((want) => (
                        <span key={want.item} className="text-[10px] px-2 py-1 rounded-full font-medium" style={{ background: `rgba(${r},${g},${b},0.1)`, color: `rgba(${r},${g},${b},1)`, border: `1px solid rgba(${r},${g},${b},0.2)` }}>
                          {want.item}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
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
