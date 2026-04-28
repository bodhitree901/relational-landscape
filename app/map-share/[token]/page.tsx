'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MENU_CATEGORIES, MenuTier, MENU_TIER_COLORS } from '../../lib/menu-categories';

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

export default function MapSharePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [myRatings, setMyRatings] = useState<Map<string, MenuTier>>(new Map());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [myName, setMyName] = useState('');

  const sharerData = useMemo<SharerData | null>(() => {
    try { return JSON.parse(decodeURIComponent(atob(token))); }
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

  // Build heatmap: category rows with tier counts for sharer + my counts
  const categoryData = MENU_CATEGORIES.map((cat) => {
    const sharerCounts: Record<MenuTier, number> = { 'must-have': 0, 'open': 0, 'maybe': 0, 'off-limits': 0 };
    const myCounts: Record<MenuTier, number> = { 'must-have': 0, 'open': 0, 'maybe': 0, 'off-limits': 0 };
    for (const item of cat.items) {
      const st = sharerRatings.get(item); if (st) sharerCounts[st]++;
      const mt = myRatings.get(item); if (mt) myCounts[mt]++;
    }
    const hasSharer = Object.values(sharerCounts).some((c) => c > 0);
    return { ...cat, sharerCounts, myCounts, hasSharer };
  }).filter((c) => c.hasSharer);

  const maxCount = Math.max(...categoryData.flatMap((c) => TIER_ORDER.map((t) => c.sharerCounts[t])), 1);

  const totalSharerItems = sharerRatings.size;
  const totalMyRated = myRatings.size;

  const handleSetMyTier = (item: string, tier: MenuTier) => {
    setMyRatings((prev) => {
      const next = new Map(prev);
      if (prev.get(item) === tier) next.delete(item); else next.set(item, tier);
      return next;
    });
  };

  const handleGoToMap = () => {
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
      personA: { name: sharerData.name, profiles: sharerData.profiles },
      personB: { name: myName.trim() || 'You', profiles: personBProfiles },
    };
    const newToken = btoa(encodeURIComponent(JSON.stringify(combined)));
    router.push(`/map-compare/${newToken}`);
  };

  const activeCat = categoryData.find((c) => c.id === activeCategory);
  // Items in active category that sharer has rated
  const activeCatItems = activeCat
    ? MENU_CATEGORIES.find((c) => c.id === activeCat.id)?.items.filter((i) => sharerRatings.has(i)) ?? []
    : [];

  return (
    <div className="page-enter min-h-dvh pb-12">
      {/* Header */}
      <div className="px-5 pt-8 pb-4 text-center">
        <p className="text-xs opacity-40 mb-1 uppercase tracking-wider">You&apos;ve been invited</p>
        <h1 className="text-2xl font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
          {sharerData.name}&apos;s Map
        </h1>
        <p className="text-sm opacity-50 mt-2">Tap a category to fill in your side</p>
      </div>

      {/* Progress pill */}
      {totalMyRated > 0 && (
        <div className="mx-5 mb-4 px-4 py-2 rounded-xl text-center" style={{ background: 'rgba(0,0,0,0.04)' }}>
          <p className="text-xs opacity-50">
            You&apos;ve rated {totalMyRated} of {totalSharerItems} items
          </p>
        </div>
      )}

      {/* Heatmap grid */}
      <div className="mx-5 watercolor-card bg-white/70 p-4">
        {/* Tier column headers */}
        <div className="flex mb-2 pl-[96px]">
          {TIER_ORDER.map((tier) => (
            <div key={tier} className="flex-1 text-center">
              <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: TIER_COLORS_DARK[tier] }}>
                {SHORT_LABELS[tier]}
              </span>
            </div>
          ))}
        </div>

        {/* Category rows */}
        <div className="space-y-1.5">
          {categoryData.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="w-full flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <div className="w-[96px] shrink-0 text-right pr-2">
                <span className="text-[10px] font-medium leading-tight" style={{ color: 'rgba(0,0,0,0.65)' }}>
                  {cat.name}
                </span>
              </div>
              <div className="flex-1 flex gap-1">
                {TIER_ORDER.map((tier) => {
                  const sc = cat.sharerCounts[tier];
                  const mc = cat.myCounts[tier];
                  const intensity = sc / maxCount;
                  return (
                    <div
                      key={tier}
                      className="flex-1 rounded relative flex items-center justify-center"
                      style={{
                        height: 36,
                        background: sc > 0
                          ? `${MENU_TIER_COLORS[tier]}${Math.round(intensity * 180 + 40).toString(16).padStart(2, '0')}`
                          : 'rgba(0,0,0,0.03)',
                      }}
                    >
                      {sc > 0 && (
                        <span className="text-[10px] font-bold" style={{ color: 'rgba(0,0,0,0.5)' }}>{sc}</span>
                      )}
                      {mc > 0 && (
                        <div
                          className="absolute bottom-1 right-1 w-2 h-2 rounded-full border-[1.5px]"
                          style={{ borderColor: TIER_COLORS_DARK[tier], background: 'white' }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-3 pt-3 border-t border-black/5 flex items-center gap-5 text-[10px] opacity-40">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-3 rounded" style={{ background: '#009483AA' }} />
            <span>{sharerData.name}&apos;s ratings</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full border-[1.5px]" style={{ borderColor: '#007A6B', background: 'white' }} />
            <span>Your ratings</span>
          </div>
        </div>
      </div>

      {/* Category detail popup */}
      {activeCategory && activeCat && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            style={{ backdropFilter: 'blur(2px)' }}
            onClick={() => setActiveCategory(null)}
          />
          <div
            className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-md max-h-[75vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-black/5"
            style={{ animation: 'tooltip-enter 0.2s ease-out' }}
          >
            {/* Popup header */}
            <div className="sticky top-0 z-10 px-4 py-3 border-b border-black/5 bg-white/95 backdrop-blur-sm flex items-center justify-between">
              <p className="text-sm font-semibold" style={{ color: activeCat.color }}>{activeCat.name}</p>
              <button onClick={() => setActiveCategory(null)} className="text-sm opacity-30 hover:opacity-60 p-1">✕</button>
            </div>

            {/* Tier column headers */}
            <div className="sticky top-[49px] z-10 bg-white/95 backdrop-blur-sm px-4 pt-2 pb-1">
              <div className="flex pl-[104px]">
                {TIER_ORDER.map((tier) => (
                  <div key={tier} className="flex-1 text-center">
                    <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: TIER_COLORS_DARK[tier] }}>
                      {SHORT_LABELS[tier]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Items */}
            <div className="px-4 pb-4 pt-1 space-y-1">
              {activeCatItems.map((item) => {
                const sharerTier = sharerRatings.get(item);
                const myTier = myRatings.get(item);
                return (
                  <div key={item} className="flex items-center gap-1.5 py-1">
                    <div className="w-[104px] shrink-0 text-right pr-2">
                      <span className="text-[10px] leading-tight font-medium" style={{ color: 'rgba(0,0,0,0.6)' }}>{item}</span>
                    </div>
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
                              height: 26,
                              background: isSharer
                                ? `${MENU_TIER_COLORS[t]}CC`
                                : isMine
                                ? `${MENU_TIER_COLORS[t]}60`
                                : 'rgba(0,0,0,0.03)',
                              border: isMine ? `2px solid ${TIER_COLORS_DARK[t]}` : '2px solid transparent',
                              boxSizing: 'border-box',
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Popup legend */}
            <div className="px-4 pb-4 flex items-center gap-5 text-[10px] opacity-40 border-t border-black/5 pt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-4 rounded" style={{ background: '#009483CC' }} />
                <span>{sharerData.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-4 rounded border-2" style={{ borderColor: '#007A6B', background: '#00948360' }} />
                <span>You (tap to select)</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* See Our Map Together */}
      <div className="px-5 mt-8">
        <button
          onClick={() => setShowNameModal(true)}
          className="w-full py-4 rounded-2xl text-white font-semibold text-base transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, var(--peach), var(--lavender))' }}
        >
          See Our Map Together
        </button>
        <p className="text-center text-xs opacity-30 mt-2">
          {totalMyRated} of {totalSharerItems} items rated
        </p>
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
            <p className="text-xs opacity-40 text-center mb-6">
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
}
