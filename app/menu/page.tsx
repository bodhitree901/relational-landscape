'use client';

import { useState, useEffect, useMemo } from 'react';
import { MENU_CATEGORIES, MenuTier, MenuRating, MenuProfile, MENU_TIER_COLORS } from '../lib/menu-categories';
import ComparisonSummaryProto from '../components/ComparisonSummaryProto';
import { Connection, Tier } from '../lib/types';
import ChipPool, { ChipRating } from '../components/ChipPool';
import { MENU_TIERS } from '../lib/tier-configs';
import Link from 'next/link';
import { SUBCATEGORY_DEFINITIONS } from '../lib/definitions';
import { useAuth } from '../components/AuthProvider';
import { createMyMapShare, getMyMapShareUrl } from '../lib/supabase/my-map-shares';
import { pushMyMap } from '../lib/supabase/sync';
import WelcomeScreen from '../components/WelcomeScreen';

const STORAGE_KEY = 'rl_my_menu';
const NAME_KEY = 'rl_my_name';

// My Map swipe order — Tones stays last (it's the culminating context)
const SWIPE_CATEGORIES = MENU_CATEGORIES;

function getStoredMenu(): MenuProfile[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveMenu(menu: MenuProfile[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(menu));
}

function getStoredName(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(NAME_KEY) || '';
}

function saveName(name: string) {
  localStorage.setItem(NAME_KEY, name);
}


type Step = 'name' | 'welcome' | 'intro' | 'swiping' | 'complete';

export default function MyMenuPage() {
  const [step, setStep] = useState<Step>('name');
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [menuProfiles, setMenuProfiles] = useState<MenuProfile[]>([]);
  const [currentRatings, setCurrentRatings] = useState<MenuRating[]>([]);
  const [myName, setMyName] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [expandedTier, setExpandedTier] = useState<MenuTier | null>(null);
  const [peekItem, setPeekItem] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  // Cross-device sync: push My Map to Supabase whenever it's saved
  useEffect(() => {
    if (user && menuProfiles.length > 0 && myName) {
      pushMyMap(user.id, myName, menuProfiles).catch(() => {});
    }
  }, [user, menuProfiles, myName]);

  useEffect(() => {
    const stored = getStoredMenu();
    const storedName = getStoredName();
    if (storedName) setMyName(storedName);
    if (stored.length > 0) {
      setMenuProfiles(stored);
      setStep('complete');
    } else if (storedName) {
      setStep('intro');
    }
    setLoaded(true);
  }, []);

  const category = SWIPE_CATEGORIES[categoryIndex];
  const totalCategories = SWIPE_CATEGORIES.length;

  const startNextCategory = () => {
    if (categoryIndex < totalCategories - 1) {
      setCategoryIndex(categoryIndex + 1);
      setCurrentRatings([]);
      setStep('swiping');
    } else {
      setStep('complete');
    }
  };

  if (!loaded) return null;

  // Name step
  if (step === 'name') {
    return (
      <div className="page-enter flex flex-col min-h-dvh">
        <div className="px-5 pt-5 pb-3">
          <Link href="/" className="text-sm opacity-60 hover:opacity-100 transition-opacity">
            &larr; Home
          </Link>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <h1
            className="text-2xl font-semibold mb-2 text-center"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            My Map
          </h1>
          <p className="text-sm opacity-50 mb-8 text-center">
            What&rsquo;s your name? This is how you&rsquo;ll appear when you share.
          </p>
          <input
            type="text"
            value={myName}
            onChange={(e) => setMyName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && myName.trim()) {
                saveName(myName.trim());
                setStep('welcome');
              }
            }}
            placeholder="Your name..."
            className="w-full max-w-xs text-center text-xl bg-transparent border-b-2 border-black/10 focus:border-black/30 outline-none pb-2 placeholder:opacity-30 transition-colors"
            autoFocus
          />
          <button
            onClick={() => {
              if (!myName.trim()) return;
              saveName(myName.trim());
              setStep('welcome');
            }}
            disabled={!myName.trim()}
            className="mt-8 px-8 py-3 rounded-2xl text-white font-medium transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-30"
            style={{ background: 'linear-gradient(135deg, var(--peach), var(--lavender))' }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (step === 'welcome') {
    return <WelcomeScreen onContinue={() => setStep('intro')} />;
  }

  // Intro
  if (step === 'intro') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px]" />
        <div className="relative watercolor-card bg-[var(--background)] p-8 max-w-sm w-full animate-tooltip">
          <h2
            className="text-xl font-semibold text-center mb-2"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            My Map
          </h2>
          <p className="text-xs opacity-40 text-center mb-6">
            What are you open to across your relationships?
          </p>

          <div className="space-y-5 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg" style={{ background: 'rgba(197,163,207,0.15)' }}>
                {'\u{1F446}'}
              </div>
              <div>
                <p className="text-sm font-medium mb-0.5">Tap</p>
                <p className="text-xs opacity-50 leading-relaxed">See what each item means</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg" style={{ background: 'rgba(244,168,154,0.15)' }}>
                {'\u{1F44B}'}
              </div>
              <div>
                <p className="text-sm font-medium mb-0.5">Drag to an edge</p>
                <p className="text-xs opacity-50 leading-relaxed">Sort each item into a tier — this is about you, not any specific person</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(137,207,240,0.15)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium mb-0.5">Undo</p>
                <p className="text-xs opacity-50 leading-relaxed">Tap the undo button to bring back the last sorted item</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => { setStep('swiping'); setCategoryIndex(0); setCurrentRatings([]); }}
            className="w-full py-3 rounded-2xl text-white font-medium text-base transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, var(--peach), var(--lavender))' }}
          >
            Start
          </button>
        </div>
      </div>
    );
  }

  // Swiping (chip pool)
  if (step === 'swiping') {
    const existingProfile = menuProfiles.find((p) => p.categoryId === category.id);
    const poolInitialRatings: ChipRating[] = (existingProfile?.ratings || currentRatings).map((r) => ({
      item: r.item,
      tierId: r.tier,
    }));

    return (
      <div className="page-enter min-h-dvh flex flex-col">
        <ChipPool
          items={category.items}
          categoryColor={category.color}
          tiers={MENU_TIERS}
          initialRatings={poolInitialRatings}
          onComplete={(chipRatings) => {
            const ratings: MenuRating[] = chipRatings.map((r) => ({
              item: r.item,
              tier: r.tierId as MenuTier,
            }));
            const profile: MenuProfile = { categoryId: category.id, ratings };
            const updated = [...menuProfiles.filter((p) => p.categoryId !== category.id), profile];
            setMenuProfiles(updated);
            saveMenu(updated);
            startNextCategory();
          }}
          onBack={() => {
            if (categoryIndex > 0) {
              setCategoryIndex(categoryIndex - 1);
              setCurrentRatings([]);
            } else {
              setStep('intro');
            }
          }}
          categoryName={category.name}
          stepNumber={categoryIndex + 1}
          totalSteps={totalCategories}
        />
      </div>
    );
  }


  // Complete — tier accordion cards with heatmap rows + share
  if (step === 'complete') {
    const TIER_ORDER_MENU: MenuTier[] = ['must-have', 'open', 'maybe', 'off-limits'];

    const SHORT_LABELS: Record<MenuTier, string> = {
      'must-have': 'Want', 'open': 'Open', 'maybe': 'Maybe', 'off-limits': 'No',
    };

    const TIER_COLORS_DARK: Record<MenuTier, string> = {
      'must-have': '#007A6B', 'open': '#5BA84D', 'maybe': '#B8A520', 'off-limits': '#D47020',
    };

    const ratedMap = new Map<string, MenuTier>();
    for (const profile of menuProfiles) {
      for (const r of profile.ratings) ratedMap.set(r.item, r.tier);
    }

    const getTierGroups = (tier: MenuTier, includeUnrated = false) =>
      MENU_CATEGORIES.map((cat) => {
        const items = cat.items
          .filter((item) => includeUnrated
            ? (ratedMap.get(item) === tier || !ratedMap.has(item))
            : ratedMap.get(item) === tier)
          .map((item) => ({ item, isUnrated: !ratedMap.has(item) }));
        return items.length > 0
          ? { categoryId: cat.id, categoryName: cat.name, categoryColor: cat.color, items }
          : null;
      }).filter(Boolean) as { categoryId: string; categoryName: string; categoryColor: string; items: { item: string; isUnrated: boolean }[] }[];

    const TIER_CONFIG: { key: MenuTier; label: string; gradient: string; shadowColor: string; includeUnrated?: boolean }[] = [
      { key: 'must-have',  label: "Must Have's",      gradient: 'linear-gradient(135deg, #80C9C1 0%, #95CFA0 100%)', shadowColor: '#80C9C1' },
      { key: 'open',       label: 'Open For',          gradient: 'linear-gradient(135deg, #89CFF0 0%, #80C9C1 100%)', shadowColor: '#89CFF0' },
      { key: 'maybe',      label: "Maybe's",           gradient: 'linear-gradient(135deg, #F5D06E 0%, #F4A89A 100%)', shadowColor: '#F5D06E' },
      { key: 'off-limits', label: 'Not Available For', gradient: 'linear-gradient(135deg, #F4A89A 0%, #C5A3CF 100%)', shadowColor: '#F4A89A', includeUnrated: true },
    ];

    const handleShare = async () => {
      if (sharing) return;
      setSharing(true);
      let url: string;
      try {
        if (user) {
          // Signed in → short Supabase token + real-time notifications
          const result = await createMyMapShare(user.id, myName || 'Anonymous', menuProfiles);
          if ('error' in result) throw new Error(result.error);
          url = getMyMapShareUrl(result.token);
        } else {
          // Not signed in → URL-encoded fallback (sign in to get notifications)
          const data = JSON.stringify({ name: myName, profiles: menuProfiles });
          const token = btoa(encodeURIComponent(data)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
          url = `${window.location.origin}/map-share/${token}`;
        }
        if (navigator.share) await navigator.share({ title: `${myName || 'My'} Map`, url }).catch(() => {});
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // clipboard not available or share failed — that's okay
      } finally {
        setSharing(false);
      }
    };

    return (
      <div className="page-enter min-h-dvh pb-12">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <Link href="/" className="text-sm opacity-60 hover:opacity-100 transition-opacity">
            &larr; Home
          </Link>
          <button
            onClick={() => { setStep('name'); setMenuProfiles([]); localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(NAME_KEY); setMyName(''); }}
            className="text-xs opacity-30 hover:opacity-60 transition-opacity"
          >
            Redo
          </button>
        </div>

        <div className="px-5 pt-4 pb-6 text-center">
          <h1 className="text-2xl font-semibold mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            {myName ? `${myName}'s Map` : 'My Map'}
          </h1>
          <button
            onClick={handleShare}
            className="text-xs px-5 py-2 rounded-full font-medium transition-all active:scale-95"
            style={{
              background: copied
                ? 'linear-gradient(135deg, var(--sage), #80C9C1)'
                : 'linear-gradient(135deg, var(--peach), var(--lavender))',
              color: 'white',
              letterSpacing: '0.01em',
            }}
          >
            {copied ? '✓ Link copied' : sharing ? '…' : 'Share My Map'}
          </button>
        </div>

        {/* Summary view */}
        {(() => {
          const validItems = new Set(MENU_CATEGORIES.flatMap(c => c.items));
          const menuConn: Connection = {
            id: 'my-map',
            name: myName || 'My Map',
            emoji: '',
            color: '#C5A3CF',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            categories: menuProfiles.map(p => ({
              categoryId: p.categoryId,
              ratings: p.ratings
                .filter(r => validItems.has(r.item))
                .map(r => ({ subcategory: r.item, tier: r.tier as Tier })),
            })).filter(p => p.ratings.length > 0),
            timeRhythm: { communication: [], inPerson: [], custom: [] },
          };
          return <ComparisonSummaryProto myConnection={menuConn} myName={myName || 'My Map'} mode="defaults" />;
        })()}

        <div className="px-5 mt-6 space-y-3">
          {TIER_CONFIG.map(({ key, label, gradient, shadowColor, includeUnrated }) => {
            const groups = getTierGroups(key, includeUnrated);
            const totalItems = groups.reduce((sum, g) => sum + g.items.length, 0);
            if (totalItems === 0) return null;
            const isExp = expandedTier === key;
            return (
              <div key={key} className="rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => { setExpandedTier(isExp ? null : key); setPeekItem(null); }}
                  className="w-full text-left px-5 py-5 transition-all active:scale-[0.99]"
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
                        {totalItems} item{totalItems !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className="text-sm" style={{ color: 'rgba(0,0,0,0.25)' }}>{isExp ? '▲' : '▼'}</span>
                  </div>
                </button>

                {isExp && (
                  <div className="border-x border-b border-black/5 rounded-b-2xl" style={{ background: 'rgba(255,255,255,0.97)', animation: 'tooltip-enter 0.2s ease-out' }}>
                    {/* Tier column headers */}
                    <div className="flex pl-[116px] pr-4 pt-3 pb-1">
                      {TIER_ORDER_MENU.map((t) => (
                        <div key={t} className="flex-1 text-center">
                          <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: TIER_COLORS_DARK[t] }}>
                            {SHORT_LABELS[t]}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Items grouped by category */}
                    <div className="px-4 pb-4 pt-1 space-y-3">
                      {groups.map((group) => (
                        <div key={group.categoryId}>
                          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: group.categoryColor }}>
                            {group.categoryName}
                          </p>
                          <div className="space-y-0.5">
                            {group.items.map(({ item, isUnrated }) => (
                              <div key={item} style={{ opacity: isUnrated ? 0.3 : 1 }}>
                                <button
                                  onClick={() => !isUnrated && setPeekItem(peekItem === item ? null : item)}
                                  className="w-full flex items-center gap-2 py-1.5 px-2 rounded-xl transition-all active:scale-[0.98]"
                                  style={{
                                    cursor: isUnrated ? 'default' : 'pointer',
                                    background: isUnrated ? 'transparent' : peekItem === item ? `${MENU_TIER_COLORS[key]}28` : `${MENU_TIER_COLORS[key]}10`,
                                    border: isUnrated ? 'none' : `1.5px solid ${MENU_TIER_COLORS[key]}35`,
                                  }}
                                >
                                  <div className="w-[108px] shrink-0 text-right pr-2 flex items-center justify-end gap-1">
                                    {!isUnrated && <span className="text-[10px] font-semibold px-1 py-0.5 rounded-full" style={{ background: `${MENU_TIER_COLORS[key]}25`, color: TIER_COLORS_DARK[key] }}>ⓘ</span>}
                                    <span className="text-xs leading-snug font-medium" style={{ color: 'rgba(0,0,0,0.72)' }}>{item}</span>
                                  </div>
                                  <div className="flex-1 flex gap-1">
                                    {TIER_ORDER_MENU.map((t) => (
                                      <div
                                        key={t}
                                        className="flex-1 rounded"
                                        style={{
                                          height: 22,
                                          background: !isUnrated && t === key
                                            ? `${MENU_TIER_COLORS[t]}CC`
                                            : 'rgba(0,0,0,0.04)',
                                        }}
                                      />
                                    ))}
                                  </div>
                                </button>
                                {peekItem === item && SUBCATEGORY_DEFINITIONS[item] && (
                                  <div
                                    className="ml-[112px] mr-1 mb-1.5 px-3 py-2 rounded-xl text-xs leading-relaxed"
                                    style={{
                                      background: `${MENU_TIER_COLORS[key]}20`,
                                      color: 'rgba(0,0,0,0.55)',
                                      animation: 'tooltip-enter 0.15s ease-out',
                                    }}
                                  >
                                    {SUBCATEGORY_DEFINITIONS[item]}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
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
    );
  }

  return null;
}
