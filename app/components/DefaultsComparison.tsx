'use client';

import { useState, useEffect } from 'react';
import { Connection, Tier } from '../lib/types';
import { DEFAULT_CATEGORIES } from '../lib/categories';
import { MENU_TIER_COLORS } from '../lib/menu-categories';
import { SUBCATEGORY_DEFINITIONS } from '../lib/definitions';
import type { MenuTier } from '../lib/menu-categories';

interface DefaultsComparisonProps {
  connection: Connection;
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

function getMyMap(): Map<string, { tier: MenuTier; categoryId: string }> {
  if (typeof window === 'undefined') return new Map();
  try {
    const data = localStorage.getItem('rl_my_menu');
    if (!data) return new Map();
    const profiles: { categoryId: string; ratings: { item: string; tier: MenuTier }[] }[] = JSON.parse(data);
    const map = new Map<string, { tier: MenuTier; categoryId: string }>();
    for (const p of profiles) {
      for (const r of p.ratings) {
        if (!map.has(r.item)) {
          map.set(r.item, { tier: r.tier, categoryId: p.categoryId });
        }
      }
    }
    return map;
  } catch { return new Map(); }
}

interface AttentionItem {
  item: string;
  connectionTier: Tier;
  categoryName: string;
  categoryColor: string;
  categoryId: string;
}

export default function DefaultsComparison({ connection }: DefaultsComparisonProps) {
  const [myMap, setMyMap] = useState<Map<string, { tier: MenuTier; categoryId: string }>>(new Map());
  const [expanded, setExpanded] = useState(false);
  const [peekItem, setPeekItem] = useState<string | null>(null);

  useEffect(() => {
    setMyMap(getMyMap());
  }, []);

  if (myMap.size === 0) return null;

  // Only show: my defaults say "off-limits" (Not Available) but this connection says positive (must-have or open)
  const attentionItems: AttentionItem[] = [];
  for (const cat of connection.categories) {
    const catDef = DEFAULT_CATEGORIES.find((c) => c.id === cat.categoryId);
    if (!catDef) continue;
    for (const r of cat.ratings) {
      const mapEntry = myMap.get(r.subcategory);
      if (
        mapEntry &&
        mapEntry.tier === 'off-limits' &&
        (r.tier === 'must-have' || r.tier === 'open')
      ) {
        attentionItems.push({
          item: r.subcategory,
          connectionTier: r.tier,
          categoryName: catDef.name,
          categoryColor: catDef.color,
          categoryId: cat.categoryId,
        });
      }
    }
  }

  if (attentionItems.length === 0) return null;

  // Sort: Actively Want first, then Open To
  attentionItems.sort((a, b) => {
    if (a.connectionTier === 'must-have' && b.connectionTier !== 'must-have') return -1;
    if (b.connectionTier === 'must-have' && a.connectionTier !== 'must-have') return 1;
    return 0;
  });

  // Group by category
  const byCategory = new Map<string, AttentionItem[]>();
  for (const item of attentionItems) {
    if (!byCategory.has(item.categoryId)) byCategory.set(item.categoryId, []);
    byCategory.get(item.categoryId)!.push(item);
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl overflow-hidden">
        <button
          onClick={() => { setExpanded(!expanded); setPeekItem(null); }}
          className="w-full text-left px-5 py-5 transition-all active:scale-[0.99]"
          style={{ background: '#FF9448' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-extrabold uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.75)' }}>
                Attention Needed
              </h3>
              <p className="text-xs mt-1" style={{ color: 'rgba(0,0,0,0.4)' }}>
                {attentionItems.length} thing{attentionItems.length !== 1 ? 's' : ''} you said yes to here but not in your defaults
              </p>
            </div>
            <span className="text-sm" style={{ color: 'rgba(0,0,0,0.3)' }}>
              {expanded ? '▲' : '▼'}
            </span>
          </div>
        </button>

        {expanded && (
          <div className="bg-white border-x border-b border-black/5 rounded-b-2xl" style={{ animation: 'tooltip-enter 0.2s ease-out' }}>
            <div className="px-4 py-3 space-y-2.5">
              {[...byCategory.entries()].map(([catId, items]) => {
                const catDef = DEFAULT_CATEGORIES.find((c) => c.id === catId);
                if (!catDef) return null;
                return (
                  <div
                    key={catId}
                    className="rounded-xl px-3 py-2.5"
                    style={{ background: `${catDef.color}12` }}
                  >
                    <p
                      className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                      style={{ color: catDef.color }}
                    >
                      {catDef.name}
                    </p>
                    <div className="space-y-0.5">
                      {items.map((item) => (
                        <div key={item.item}>
                          <button
                            onClick={() => setPeekItem(peekItem === item.item ? null : item.item)}
                            className="w-full flex items-center gap-2.5 py-1.5 px-1 rounded-lg transition-all active:scale-[0.99]"
                          >
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: TIER_COLORS_DARK[item.connectionTier] }} />
                            <span className="flex-1 text-left text-sm" style={{ color: 'rgba(0,0,0,0.7)' }}>
                              {item.item}
                            </span>
                            <span
                              className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                              style={{ background: `${MENU_TIER_COLORS[item.connectionTier]}25`, color: TIER_COLORS_DARK[item.connectionTier] }}
                            >
                              {PILL_LABELS[item.connectionTier]}
                            </span>
                            <span className="text-[9px] opacity-30">default: Not Relevant</span>
                          </button>
                          {peekItem === item.item && SUBCATEGORY_DEFINITIONS[item.item] && (
                            <div className="ml-6 mr-1 mb-1.5 px-3 py-2 rounded-xl text-xs leading-relaxed"
                              style={{ background: 'rgba(0,0,0,0.03)', color: 'rgba(0,0,0,0.5)', animation: 'tooltip-enter 0.15s ease-out' }}>
                              {SUBCATEGORY_DEFINITIONS[item.item]}
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
    </div>
  );
}
