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
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
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
    const newToken = btoa(encodeURIComponent(JSON.stringify(combined)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    router.push(`/map-compare/${newToken}`);
  };

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
          Tap any category to fill in your side
        </p>
      </div>

      {/* Progress */}
      {totalMyRated > 0 && (
        <div className="mx-5 mb-4 px-4 py-2 rounded-xl text-center" style={{ background: 'rgba(0,0,0,0.04)' }}>
          <p className="text-xs" style={{ color: 'rgba(0,0,0,0.4)' }}>
            You&apos;ve filled in {totalMyRated} of {totalSharerItems} items {sharerData.name} rated
          </p>
        </div>
      )}

      {/* Category accordion cards */}
      <div className="px-5 space-y-3">
        {MENU_CATEGORIES.map((cat) => {
          const isExpanded = expandedCategory === cat.id;

          // Sharer's counts for this category
          const sharerCounts: Record<MenuTier, number> = { 'must-have': 0, 'open': 0, 'maybe': 0, 'off-limits': 0 };
          for (const item of cat.items) {
            const t = sharerRatings.get(item);
            if (t) sharerCounts[t]++;
          }
          const sharerTotal = Object.values(sharerCounts).reduce((a, b) => a + b, 0);

          // My counts for this category
          const myTotal = cat.items.filter((i) => myRatings.has(i)).length;

          return (
            <div key={cat.id} className="rounded-2xl overflow-hidden shadow-sm">
              {/* Card header */}
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                className="w-full text-left px-5 py-4 transition-all active:scale-[0.99]"
                style={{ background: `${cat.color}28` }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base leading-tight" style={{ color: cat.color }}>
                      {cat.name}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(0,0,0,0.38)' }}>
                      {sharerTotal > 0
                        ? `${sharerData.name} rated ${sharerTotal} item${sharerTotal !== 1 ? 's' : ''}${myTotal > 0 ? ` · You filled in ${myTotal}` : ''}`
                        : `${sharerData.name} hasn't filled this in yet`}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Mini tier dots showing sharer's distribution */}
                    {sharerTotal > 0 && (
                      <div className="flex gap-1 items-center">
                        {TIER_ORDER.map((t) => sharerCounts[t] > 0 && (
                          <div
                            key={t}
                            className="rounded-full flex items-center justify-center"
                            style={{
                              width: 18, height: 18,
                              background: `${MENU_TIER_COLORS[t]}CC`,
                            }}
                          >
                            <span className="text-[9px] font-bold text-white/80">{sharerCounts[t]}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {myTotal === 0 && (
                      <span className="text-[10px] font-medium" style={{ color: cat.color, opacity: 0.7 }}>
                        Fill in →
                      </span>
                    )}
                    <span className="text-xs" style={{ color: 'rgba(0,0,0,0.25)' }}>{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>
              </button>

              {/* Expanded items */}
              {isExpanded && (
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

                  {/* Items */}
                  <div className="px-4 pb-4 pt-1 space-y-1">
                    {cat.items.map((item) => {
                      const sharerTier = sharerRatings.get(item);
                      const myTier = myRatings.get(item);
                      const isSharerRated = !!sharerTier;

                      return (
                        <div key={item} className="flex items-center gap-2 py-0.5" style={{ opacity: isSharerRated ? 1 : 0.45 }}>
                          <div className="w-[116px] shrink-0 text-right pr-2">
                            <span className="text-[11px] leading-tight font-medium" style={{ color: 'rgba(0,0,0,0.7)' }}>
                              {item}
                            </span>
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
                                    height: 24,
                                    background: isSharer
                                      ? `${MENU_TIER_COLORS[t]}CC`
                                      : isMine
                                      ? `${MENU_TIER_COLORS[t]}50`
                                      : 'rgba(0,0,0,0.04)',
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

                  {/* Legend inside card */}
                  <div className="mx-4 mb-4 pt-2 border-t border-black/5 flex items-center gap-5 text-[10px]" style={{ color: 'rgba(0,0,0,0.35)' }}>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-3 rounded" style={{ background: `${cat.color}CC` }} />
                      <span>{sharerData.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-3 rounded border-2" style={{ borderColor: TIER_COLORS_DARK['must-have'], background: `${MENU_TIER_COLORS['must-have']}50` }} />
                      <span>You (tap to select)</span>
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
}
