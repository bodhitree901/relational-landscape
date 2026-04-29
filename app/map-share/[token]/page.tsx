'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MENU_CATEGORIES, MenuTier, MENU_TIER_COLORS } from '../../lib/menu-categories';
import { SUBCATEGORY_DEFINITIONS } from '../../lib/definitions';
import {
  isSupabaseToken, getMyMapShare, submitMyMapResponse,
  type MyMapProfile,
} from '../../lib/supabase/my-map-shares';
import WelcomeScreen from '../../components/WelcomeScreen';

interface SharerData {
  name: string;
  profiles: { categoryId: string; ratings: { item: string; tier: MenuTier }[] }[];
  shareId?: string; // present for Supabase-backed shares
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

type PageMode = 'loading' | 'invalid' | 'welcome' | 'choose' | 'view' | 'fill';

export default function MapSharePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [pageMode, setPageMode] = useState<PageMode>('loading');
  const [sharerData, setSharerData] = useState<SharerData | null>(null);
  const [myRatings, setMyRatings] = useState<Map<string, MenuTier>>(new Map());
  const [expandedTier, setExpandedTier] = useState<MenuTier | null>(null);
  const [defItem, setDefItem] = useState<string | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [myName, setMyName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load share data — Supabase first, then URL decode fallback
  useEffect(() => {
    async function load() {
      if (isSupabaseToken(token)) {
        // Short token → load from Supabase
        const share = await getMyMapShare(token);
        if (!share) { setPageMode('invalid'); return; }
        setSharerData({
          name: share.sharer_name,
          profiles: (share.map_data as unknown as MyMapProfile[]).map((p) => ({
            categoryId: p.categoryId,
            ratings: p.ratings.map((r) => ({ item: r.item, tier: r.tier as MenuTier })),
          })),
          shareId: share.id,
        });
      } else {
        // Long URL-encoded base64 → legacy decode
        try {
          const padded = token.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice(0, (4 - token.length % 4) % 4);
          const parsed = JSON.parse(decodeURIComponent(atob(padded)));
          setSharerData({ name: parsed.name, profiles: parsed.profiles });
        } catch {
          setPageMode('invalid'); return;
        }
      }
      setPageMode('welcome');
    }
    load();
  }, [token]);

  const sharerRatings = useMemo(() => {
    const map = new Map<string, MenuTier>();
    if (!sharerData) return map;
    for (const p of sharerData.profiles)
      for (const r of p.ratings) map.set(r.item, r.tier);
    return map;
  }, [sharerData]);

  if (pageMode === 'loading') {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--lavender)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (pageMode === 'invalid' || !sharerData) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-8 text-center gap-3">
        <p className="text-lg opacity-40">Invalid or expired link</p>
        <a href="/" className="text-sm underline opacity-40">Go home</a>
      </div>
    );
  }

  if (pageMode === 'welcome') {
    return <WelcomeScreen onContinue={() => setPageMode('choose')} />;
  }

  // ── Choose screen ──────────────────────────────────────────────────────
  if (pageMode === 'choose') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-8">
        <div
          className="w-full max-w-sm rounded-3xl p-8 text-center"
          style={{
            background: 'white',
            boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
            border: '2px solid rgba(255,255,255,0.8)',
          }}
        >
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, var(--peach), var(--lavender))' }}
          >
            {sharerData.name[0]?.toUpperCase()}
          </div>
          <h1 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            {sharerData.name}&apos;s Map
          </h1>
          <p className="text-sm opacity-40 mb-8">
            What would you like to do?
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setPageMode('fill')}
              className="w-full py-3.5 rounded-2xl text-white font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, var(--peach), var(--lavender))' }}
            >
              ✏️ Fill in my side
            </button>
            <button
              onClick={() => setPageMode('view')}
              className="w-full py-3.5 rounded-2xl font-medium transition-all hover:opacity-80 active:scale-[0.98]"
              style={{ background: 'rgba(0,0,0,0.05)', color: 'rgba(0,0,0,0.6)' }}
            >
              👁 Just browse their map
            </button>
          </div>
          <p className="text-[10px] opacity-30 mt-5">No account needed</p>
        </div>
      </div>
    );
  }

  const handleSetMyTier = (item: string, tier: MenuTier) => {
    if (pageMode === 'view') return;
    setMyRatings((prev) => {
      const next = new Map(prev);
      if (prev.get(item) === tier) next.delete(item); else next.set(item, tier);
      return next;
    });
    setDefItem(null);
  };

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

  async function handleGoToMap() {
    if (!myName.trim()) return;
    setSubmitting(true);
    setShowNameModal(false);

    // Build Person B's profiles
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

    // If Supabase-backed share, save response and navigate by ID
    if (sharerData?.shareId) {
      const result = await submitMyMapResponse(sharerData.shareId, myName.trim(), personBProfiles);
      if ('id' in result) {
        router.push(`/map-compare/${result.id}`);
        return;
      }
      // Fall through to URL encode if Supabase save failed
    }

    // Legacy URL-encoded fallback
    const combined = {
      personA: { name: sharerData?.name ?? '', profiles: sharerData?.profiles ?? [] },
      personB: { name: myName.trim(), profiles: personBProfiles },
    };
    const newToken = btoa(encodeURIComponent(JSON.stringify(combined)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    router.push(`/map-compare/${newToken}`);
  }

  return (
    <div className="page-enter min-h-dvh pb-16">
      {/* Header */}
      <div className="px-5 pt-8 pb-5 text-center">
        <h1 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
          {sharerData.name}&apos;s Map
        </h1>
        <p className="text-sm font-semibold" style={{ color: 'rgba(0,0,0,0.45)' }}>
          {pageMode === 'fill' ? 'Tap a section to fill in your side' : 'Browse their map'}
        </p>
        {pageMode === 'fill' && (
          <button
            onClick={() => setPageMode('view')}
            className="mt-1 text-xs opacity-30 hover:opacity-50 transition-opacity"
          >
            Switch to view only
          </button>
        )}
      </div>

      {/* Progress (fill mode only) */}
      {pageMode === 'fill' && totalMyRated > 0 && (
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
              <button
                onClick={() => { setExpandedTier(isExp ? null : key); setDefItem(null); }}
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
                      {pageMode === 'fill' && myCount > 0 ? ` · You filled in ${myCount}` : ''}
                    </p>
                  </div>
                  <span className="text-sm" style={{ color: 'rgba(0,0,0,0.25)' }}>{isExp ? '▲' : '▼'}</span>
                </div>
              </button>

              {isExp && (
                <div
                  className="border-x border-b border-black/5 rounded-b-2xl"
                  style={{ background: 'rgba(255,255,255,0.97)', animation: 'tooltip-enter 0.2s ease-out' }}
                >
                  {/* Column headers */}
                  <div className="flex pl-[120px] pr-4 pt-3 pb-1">
                    {TIER_ORDER.map((t) => (
                      <div key={t} className="flex-1 text-center">
                        <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: TIER_COLORS_DARK[t] }}>
                          {SHORT_LABELS[t]}
                        </span>
                      </div>
                    ))}
                  </div>

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
                                          disabled={pageMode === 'view'}
                                          className="flex-1 rounded transition-all active:scale-95 disabled:cursor-default"
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
                    {pageMode === 'fill' && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-3 rounded border-2" style={{ borderColor: TIER_COLORS_DARK['must-have'], background: `${MENU_TIER_COLORS['must-have']}55` }} />
                        <span>Your pick</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="px-5 mt-8">
        {pageMode === 'fill' ? (
          <>
            <button
              onClick={() => setShowNameModal(true)}
              disabled={submitting}
              className="w-full py-4 rounded-2xl text-white font-semibold text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, var(--peach), var(--lavender))' }}
            >
              {submitting ? 'Saving…' : 'See Our Map Together →'}
            </button>
            {totalMyRated > 0 && (
              <p className="text-center text-xs mt-2" style={{ color: 'rgba(0,0,0,0.3)' }}>
                {totalMyRated} item{totalMyRated !== 1 ? 's' : ''} filled in
              </p>
            )}
          </>
        ) : (
          <button
            onClick={() => setPageMode('fill')}
            className="w-full py-4 rounded-2xl font-semibold text-base transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.6)' }}
          >
            ✏️ Fill in my side too
          </button>
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
              disabled={!myName.trim() || submitting}
              className="w-full py-4 rounded-2xl text-white font-semibold text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, var(--peach), var(--lavender))' }}
            >
              {submitting ? 'Saving…' : 'See Our Map Together →'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
