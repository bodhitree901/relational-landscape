'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Connection, Tier } from '../lib/types';
import { getConnections } from '../lib/storage';
import { DEFAULT_CATEGORIES } from '../lib/categories';
import { MENU_TIER_COLORS, type MenuTier } from '../lib/menu-categories';
import { ConnectionCircle } from '../components/ColorPicker';

const PILL_LABELS: Record<string, string> = {
  'must-have': 'Actively Want',
  'open': 'Open To',
  'maybe': 'Not Sure',
  'off-limits': 'Not Relevant',
};

const TIER_COLORS_DARK: Record<string, string> = {
  'must-have': '#007A6B',
  'open': '#5BA84D',
  'maybe': '#B8A520',
  'off-limits': '#D47020',
};

// Load My Map from localStorage — deduplicated by item name
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
        if (!seen.has(r.item)) {
          seen.add(r.item);
          items.push({ item: r.item, tier: r.tier, categoryId: p.categoryId });
        }
      }
    }
    return items;
  } catch { return []; }
}


export default function PatternsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [expandedUnmetCat, setExpandedUnmetCat] = useState<string | null>(null);
  const [expandedCoverageCat, setExpandedCoverageCat] = useState<string | null>(null);
  const [expandedUnmet, setExpandedUnmet] = useState<string | null>(null);
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

  // Build a lookup: item → which connections cover it and at what tier
  const connectionCoverage = new Map<string, { connName: string; connId: string; connColor: string; tier: Tier }[]>();
  for (const conn of connections) {
    for (const cat of conn.categories) {
      for (const r of cat.ratings) {
        if (!connectionCoverage.has(r.subcategory)) connectionCoverage.set(r.subcategory, []);
        connectionCoverage.get(r.subcategory)!.push({
          connName: conn.name, connId: conn.id,
          connColor: conn.color || conn.emoji || '#C5A3CF', tier: r.tier,
        });
      }
    }
  }

  // --- UNMET WANTS (#3): Things you Actively Want that no connection fulfills ---
  const myWants = myMapItems.filter((i) => i.tier === 'must-have' || i.tier === 'open');
  const unmetWants = myWants.filter((want) => {
    const coverage = connectionCoverage.get(want.item);
    if (!coverage) return true; // no connection has it at all
    // Unmet if no connection rates it positively
    return !coverage.some((c) => c.tier === 'must-have' || c.tier === 'open');
  });

  // Group unmet wants by category
  const unmetByCategory = new Map<string, typeof unmetWants>();
  for (const u of unmetWants) {
    if (!unmetByCategory.has(u.categoryId)) unmetByCategory.set(u.categoryId, []);
    unmetByCategory.get(u.categoryId)!.push(u);
  }

  // --- COVERAGE MAP (#6): For each want, which connections cover it ---
  const coveredWants = myWants.filter((want) => {
    const coverage = connectionCoverage.get(want.item);
    return coverage && coverage.some((c) => c.tier === 'must-have' || c.tier === 'open');
  });

  // Group covered wants by category
  const coveredByCategory = new Map<string, typeof coveredWants>();
  for (const c of coveredWants) {
    if (!coveredByCategory.has(c.categoryId)) coveredByCategory.set(c.categoryId, []);
    coveredByCategory.get(c.categoryId)!.push(c);
  }


  return (
    <div className="page-enter min-h-dvh pb-8">
      <div className="px-5 pt-5 pb-3">
        <Link href="/" className="text-sm opacity-60 hover:opacity-100 transition-opacity">&larr; Home</Link>
      </div>

      <div className="px-5 pt-2 pb-6">
        <h1 className="text-2xl font-semibold mb-1">Patterns</h1>
        <p className="text-sm opacity-50">Across {connections.length} connection{connections.length !== 1 ? 's' : ''}</p>
      </div>

      {/* UNMET WANTS — accordion cards per category */}
      {hasMyMap && unmetWants.length > 0 && (
        <div className="mx-5 mb-6">
          <div className="px-1 mb-3">
            <h2 className="text-lg font-bold uppercase tracking-wide" style={{ color: '#D47020' }}>
              Unmet Wants
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(0,0,0,0.4)' }}>
              {unmetWants.length} thing{unmetWants.length !== 1 ? 's' : ''} you want that no connection covers
            </p>
          </div>
          <div className="space-y-3">
            {[...unmetByCategory.entries()].map(([catId, items]) => {
              const catDef = DEFAULT_CATEGORIES.find((c) => c.id === catId);
              if (!catDef) return null;
              const isExpanded = expandedUnmetCat === catId;
              return (
                <div key={catId} className="rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedUnmetCat(isExpanded ? null : catId)}
                    className="w-full text-left px-5 py-4 transition-all active:scale-[0.99]"
                    style={{ background: '#FF9448' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-extrabold uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.75)' }}>
                          {catDef.name}
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(0,0,0,0.4)' }}>
                          {items.length} unmet want{items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <span className="text-sm" style={{ color: 'rgba(0,0,0,0.3)' }}>
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="bg-white border-x border-b border-black/5 rounded-b-2xl" style={{ animation: 'tooltip-enter 0.2s ease-out' }}>
                      <div className="px-4 py-3 space-y-0.5">
                        {items.map((item) => (
                          <div key={item.item} className="flex items-center gap-2.5 py-2 px-2 rounded-lg">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: '#D47020' }} />
                            <span className="flex-1 text-sm" style={{ color: 'rgba(0,0,0,0.7)' }}>{item.item}</span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                              style={{ background: `${MENU_TIER_COLORS[item.tier]}25`, color: TIER_COLORS_DARK[item.tier] }}>
                              You: {PILL_LABELS[item.tier]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* COVERAGE MAP — accordion cards per category */}
      {hasMyMap && coveredWants.length > 0 && (
        <div className="mx-5 mb-6">
          <div className="px-1 mb-3">
            <h2 className="text-lg font-bold uppercase tracking-wide" style={{ color: '#007A6B' }}>
              Coverage Map
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(0,0,0,0.4)' }}>
              Who covers what you want across your connections
            </p>
          </div>
          <div className="space-y-3">
            {[...coveredByCategory.entries()].map(([catId, items]) => {
              const catDef = DEFAULT_CATEGORIES.find((c) => c.id === catId);
              if (!catDef) return null;
              const isExpanded = expandedCoverageCat === catId;
              return (
                <div key={catId} className="rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedCoverageCat(isExpanded ? null : catId)}
                    className="w-full text-left px-5 py-4 transition-all active:scale-[0.99]"
                    style={{ background: '#009483' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-extrabold uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.75)' }}>
                          {catDef.name}
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(0,0,0,0.4)' }}>
                          {items.length} covered want{items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <span className="text-sm" style={{ color: 'rgba(0,0,0,0.3)' }}>
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="bg-white border-x border-b border-black/5 rounded-b-2xl" style={{ animation: 'tooltip-enter 0.2s ease-out' }}>
                      <div className="px-4 py-3 space-y-0.5">
                        {items.map((want) => {
                          const coveringConns = (connectionCoverage.get(want.item) || [])
                            .filter((c) => c.tier === 'must-have' || c.tier === 'open');
                          const isItemExpanded = expandedUnmet === want.item;
                          return (
                            <div key={want.item}>
                              <button
                                onClick={() => setExpandedUnmet(isItemExpanded ? null : want.item)}
                                className="w-full flex items-center gap-2.5 py-2 px-2 rounded-lg transition-all active:scale-[0.99]"
                              >
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: '#007A6B' }} />
                                <span className="flex-1 text-left text-sm" style={{ color: 'rgba(0,0,0,0.7)' }}>
                                  {want.item}
                                </span>
                                <div className="flex -space-x-1.5 shrink-0">
                                  {coveringConns.slice(0, 4).map((c, i) => (
                                    <div key={i}><ConnectionCircle color={c.connColor} size={16} /></div>
                                  ))}
                                  {coveringConns.length > 4 && (
                                    <span className="text-xs opacity-40 ml-1">+{coveringConns.length - 4}</span>
                                  )}
                                </div>
                              </button>
                              {isItemExpanded && (
                                <div className="ml-6 mb-2 flex flex-wrap gap-1.5" style={{ animation: 'tooltip-enter 0.15s ease-out' }}>
                                  {coveringConns.map((c, i) => (
                                    <Link key={i} href={`/connection/${c.connId}`}
                                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 text-xs border border-black/5">
                                      <ConnectionCircle color={c.connColor} size={14} />
                                      <span>{c.connName}</span>
                                    </Link>
                                  ))}
                                </div>
                              )}
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
        </div>
      )}

      {/* No My Map notice */}
      {!hasMyMap && (
        <div className="mx-5 mb-6 watercolor-card bg-white/50 p-5">
          <p className="text-sm opacity-50 mb-2">Complete your personal map to see blind spots and coverage analysis.</p>
          <Link href="/menu" className="text-sm font-medium" style={{ color: '#007A6B' }}>
            Create My Map →
          </Link>
        </div>
      )}

    </div>
  );
}
