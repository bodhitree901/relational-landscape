'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MENU_CATEGORIES, MenuTier, MENU_TIER_COLORS } from '../../lib/menu-categories';
import { SUBCATEGORY_DEFINITIONS } from '../../lib/definitions';

interface SharerData {
  name: string;
  profiles: { categoryId: string; ratings: { item: string; tier: MenuTier }[] }[];
}

const TIER_ORDER: MenuTier[] = ['must-have', 'open', 'maybe', 'off-limits'];

const SHORT_LABELS: Record<MenuTier, string> = {
  'must-have': 'Want', 'open': 'Open', 'maybe': 'Maybe', 'off-limits': 'No',
};

const TIER_COLORS_DARK: Record<MenuTier, string> = {
  'must-have': '#007A6B', 'open': '#5BA84D', 'maybe': '#B8A520', 'off-limits': '#D47020',
};

const TIER_CONFIG: { key: MenuTier; label: string; gradient: string; shadowColor: string; includeUnrated?: boolean }[] = [
  { key: 'must-have',  label: "Easy Yes's",                  gradient: 'linear-gradient(135deg, #80C9C1 0%, #95CFA0 100%)', shadowColor: '#80C9C1' },
  { key: 'open',       label: "Open For's",                   gradient: 'linear-gradient(135deg, #89CFF0 0%, #80C9C1 100%)', shadowColor: '#89CFF0' },
  { key: 'maybe',      label: "Maybe's",                      gradient: 'linear-gradient(135deg, #F5D06E 0%, #F4A89A 100%)', shadowColor: '#F5D06E' },
  { key: 'off-limits', label: "Not Available / Not Selected", gradient: 'linear-gradient(135deg, #F4A89A 0%, #C5A3CF 100%)', shadowColor: '#F4A89A', includeUnrated: true },
];

export default function MapSharePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [myRatings, setMyRatings] = useState<Map<string, MenuTier>>(new Map());
  const [expandedTier, setExpandedTier] = useState<MenuTier | null>(null);
  const [peekItem, setPeekItem] = useState<string | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [defItem, setDefItem] = useState<string | null>(null);
  const [myName, setMyName] = useState('');

  const fromUrlSafeBase64 = (s: string) =>
    decodeURIComponent(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice(0, (4 - s.length % 4) % 4)));

  const sharerData = useMemo<SharerData | null>(() => {
    try { return JSON.parse(fromUrlSafeBase64(token)); }
    catch { return null; }
  }, [token]);

  const sharerRatings = useMemo(() => {
    const map = new Map<string, MenuTier>();
    if (!sharerData) return map;
    for (const p of sharerData.profiles)
      for (const r of p.ratings) map.set(r.item, r.tier);
    return map;
  }, [sharerData]);

  if (!sharerData) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-8">
        <p className="text-lg opacity-40">Invalid link</p>
      </div>
    );
  }

  const handleSetMyTier = (item: string, tier: MenuTier) => {
    setMyRatings((prev) => {
      const next = new Map(prev);
      if (prev.get(item) === tier) next.delete(item); else next.set(item, tier);
      return next;
    });
    setPeekItem(null);
  };

  // For a given tier, get items grouped by MENU_CATEGORY
  const getTierGroups = (tier: MenuTier, includeUnrated = false) =>
    MENU_CATEGORIES.map((cat) => {
      const items = cat.items
        .filter((item) => includeUnrated
          ? (sharerRatings.get(item) === tier || !sharerRatings.has(item))
          : sharerRatings.get(item) === tier)
        .map((item) => ({ item, isUnrated: !sharerRatings.has(item) }));
      return items.length > 0
        ? { categoryId: cat.id, categoryName: cat.name, categoryColor: cat.color, items }
        : null;
    }).filter(Boolean) as { categoryId: string; categoryName: string; categoryColor: string; items: { item: string; isUnrated: boolean }[] }[];

  const totalMyRated = myRatings.size;
  const totalSharerItems = sharerRatings.size;

  return (
    <div className="page-enter min-h-dvh pb-16">
      {/* Header */}
      <div className="px-5 pt-8 pb-5 text-center">
        <h1 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
          Here&apos;s {sharerData.name}&apos;s Map
        </h1>
        <p className="text-sm font-semibold" style={{ color: 'rgba(0,0,0,0.45)' }}>
          Tap a section to fill in your side
        </p>
      </div>

      {/* Progress */}
      {totalMyRated > 0 && (
        <div className="mx-5 mb-4 px-4 py-2 rounded-xl text-center" style={{ background: 'rgba(0,0,0,0.04)' }}>
          <p className="text-xs" style={{ color: 'rgba(0,0,0,0.4)' }}>
            You&apos;ve filled in {totalMyRated} of {totalSharerItems} items
          </p>
        </div>
      )}

      {/* Tier accordion cards */}
      <div className="px-5 space-y-3">
        {TIER_CONFIG.map(({ key, label, gradient, shadowColor, includeUnrated }) => {
          const groups = getTierGroups(key, includeUnrated);
          const totalItems = groups.reduce((sum, g) => sum + g.items.filter(i => !i.isUnrated).length, 0);
          const totalWithUnrated = groups.reduce((sum, g) => sum + g.items.length, 0);
          const myCount = groups.reduce((sum, g) => sum + g.items.filter(({ item }) => myRatings.has(item)).length, 0);
          const isExp = expandedTier === key;

          if (totalWithUnrated === 0) return null;

          return (
            <div key={key} className="rounded-2xl overflow-hidden">
              {/* Card header */}
              <button
                onClick={() => { setExpandedTier(isExp ? null : key); setPeekItem(null); }}
                className="w-full text-left px-5 py-5 transition-all active:scale-[0.99] rounded-2xl"
                style={{
                  background: gradient,
                  boxShadow: `0 4px 18px ${shadowColor}55, inset 0 -2px 6px ${shadowColor}40`,
                  border: '2px solid rgba(255,255,255,0.5)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.65)' }}>
                      {label}
                    </h3>
                    <p className="text-xs mt-1" style={{ color: 'rgba(0,0,0,0.35)' }}>
                      {key === 'off-limits'
                        ? `${totalItems} not available · ${totalWithUnrated - totalItems} not selected`
                        : `${sharerData.name} has ${totalItems} item${totalItems !== 1 ? 's' : ''} here`}
                      {myCount > 0 ? ` · You filled in ${myCount}` : ''}
                    </p>
                  </div>
                  <span className="text-sm" style={{ color: 'rgba(0,0,0,0.25)' }}>{isExp ? '▲' : '▼'}</span>
                </div>
              </button>

              {/* Expanded items */}
              {isExp && (
                <div
                  className="border-x border-b border-black/5 rounded-b-2xl"
                  style={{ background: 'rgba(255,255,255,0.97)', animation: 'tooltip-enter 0.2s ease-out' }}
                >
                  {/* Tier column headers */}
                  <div className="flex pl-[120px] pr-4 pt-3 pb-1">
                    {TIER_ORDER.map((t) => (
                      <div key={t} className="flex-1 text-center">
                        <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: TIER_COLORS_DARK[t] }}>
                          {SHORT_LABELS[t]}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Items grouped by sub-category */}
                  <div className="px-4 pb-4 pt-1 space-y-3">
                    {groups.map((group) => (
                      <div
                        key={group.categoryId}
                        className="rounded-xl px-3 pt-2.5 pb-2"
                        style={{ background: `${group.categoryColor}10`, border: `1.5px solid ${group.categoryColor}30` }}
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: group.categoryColor }}>
                          {group.categoryName}
                        </p>
                        <div className="space-y-0.5">
                          {group.items.map(({ item, isUnrated }) => {
                            const sharerTier = sharerRatings.get(item);
                            const myTier = myRatings.get(item);
                            const hasDef = !!SUBCATEGORY_DEFINITIONS[item];
                            const isDefOpen = defItem === item;
                            return (
                              <div key={item} style={{ opacity: isUnrated ? 0.5 : 1 }}>
                                <div className="flex items-center gap-2 py-0.5">
                                  <button
                                    className="w-[116px] shrink-0 text-right pr-2"
                                    onClick={() => hasDef && setDefItem(isDefOpen ? null : item)}
                                    style={{ cursor: hasDef ? 'pointer' : 'default' }}
                                  >
                                    <span
                                      className="text-[11.5px] leading-tight font-semibold"
                                      style={{
                                        color: isDefOpen ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.75)',
                                        textDecoration: hasDef ? 'underline dotted' : 'none',
                                        textUnderlineOffset: '2px',
                                      }}
                                    >
                                      {item}
                                    </span>
                                  </button>
                                  <div className="flex-1 flex gap-1">
                                    {TIER_ORDER.map((t) => {
                                      const isSharer = sharerTier === t;
                                      const isMine = myTier === t;
                                      return (
                                        <button
                                          key={t}
                                          onClick={() => handleSetMyTier(item, t)}
                                          className="flex-1 rounded transition-all active:scale-95"
                                          style={{
                                            height: 24,
                                            background: isSharer
                                              ? `${MENU_TIER_COLORS[t]}CC`
                                              : isMine
                                              ? `${MENU_TIER_COLORS[t]}55`
                                              : 'rgba(0,0,0,0.04)',
                                            border: isMine ? `2px solid ${TIER_COLORS_DARK[t]}` : '2px solid transparent',
                                            boxSizing: 'border-box',
                                          }}
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                                {isDefOpen && SUBCATEGORY_DEFINITIONS[item] && (
                                  <div
                                    className="ml-[120px] mr-1 mb-1.5 px-3 py-2 rounded-xl text-xs leading-relaxed"
                                    style={{
                                      background: `${group.categoryColor}18`,
                                      color: 'rgba(0,0,0,0.55)',
                                      animation: 'tooltip-enter 0.15s ease-out',
                                    }}
                                  >
                                    {SUBCATEGORY_DEFINITIONS[item]}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="mx-4 mb-4 pt-2 border-t border-black/5 flex items-center gap-5 text-[10px]" style={{ color: 'rgba(0,0,0,0.35)' }}>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-3 rounded" style={{ background: `${MENU_TIER_COLORS[key]}CC` }} />
                      <span>{sharerData.name}&apos;s pick</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-3 rounded border-2" style={{ borderColor: TIER_COLORS_DARK['must-have'], background: `${MENU_TIER_COLORS['must-have']}55` }} />
                      <span>Your pick (tap to select)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* See Our Map Together */}
      <div className="px-5 mt-8">
        <button
          onClick={() => setShowNameModal(true)}
          className="w-full py-4 rounded-2xl text-white font-semibold text-base transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, var(--peach), var(--lavender))' }}
        >
          See Our Map Together
        </button>
        {totalMyRated > 0 && (
          <p className="text-center text-xs mt-2" style={{ color: 'rgba(0,0,0,0.3)' }}>
            {totalMyRated} item{totalMyRated !== 1 ? 's' : ''} filled in
          </p>
        )}
      </div>

      {/* Name bottom sheet */}
      {showNameModal && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/30"
            style={{ backdropFilter: 'blur(4px)' }}
            onClick={() => setShowNameModal(false)}
          />
          <div
            className="fixed z-50 left-0 right-0 bottom-0 px-6 pt-8 pb-10 rounded-t-3xl bg-white"
            style={{ animation: 'tooltip-enter 0.2s ease-out' }}
          >
            <h3 className="text-lg font-semibold text-center mb-1" style={{ fontFamily: 'Georgia, serif' }}>
              What&apos;s your name?
            </h3>
            <p className="text-xs text-center mb-6" style={{ color: 'rgba(0,0,0,0.4)' }}>
              So {sharerData.name} knows who mapped with them
            </p>
            <input
              type="text"
              value={myName}
              onChange={(e) => setMyName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && myName.trim()) handleGoToMap(); }}
              placeholder="Your name..."
              className="w-full text-center text-lg bg-transparent border-b-2 border-black/10 focus:border-black/30 outline-none pb-2 placeholder:opacity-30 transition-colors mb-6"
              autoFocus
            />
            <button
              onClick={handleGoToMap}
              className="w-full py-4 rounded-2xl text-white font-semibold text-base transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, var(--peach), var(--lavender))' }}
            >
              See Our Map Together
            </button>
          </div>
        </>
      )}
    </div>
  );

  function handleGoToMap() {
    const profileMap = new Map<string, { item: string; tier: MenuTier }[]>();
    for (const [item, tier] of myRatings) {
      for (const cat of MENU_CATEGORIES) {
        if (cat.items.includes(item)) {
          if (!profileMap.has(cat.id)) profileMap.set(cat.id, []);
          profileMap.get(cat.id)!.push({ item, tier });
          break;
        }
      }
    }
    const personBProfiles = [...profileMap.entries()].map(([categoryId, ratings]) => ({ categoryId, ratings }));
    const combined = {
      personA: { name: sharerData!.name, profiles: sharerData!.profiles },
      personB: { name: myName.trim() || 'You', profiles: personBProfiles },
    };
    const newToken = btoa(encodeURIComponent(JSON.stringify(combined)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    router.push(`/map-compare/${newToken}`);
  }
}
