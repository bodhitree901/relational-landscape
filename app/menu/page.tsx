'use client';

import { useState, useEffect } from 'react';
import { MENU_CATEGORIES, MenuTier, MenuRating, MenuProfile, MENU_TIER_COLORS, MENU_TIER_LABELS } from '../lib/menu-categories';
import ChipPool, { ChipRating } from '../components/ChipPool';
import { MENU_TIERS } from '../lib/tier-configs';
import Link from 'next/link';

const STORAGE_KEY = 'rl_my_menu';

function getStoredMenu(): MenuProfile[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveMenu(menu: MenuProfile[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(menu));
}

type Step = 'intro' | 'swiping' | 'category-done' | 'complete';

export default function MyMenuPage() {
  const [step, setStep] = useState<Step>('intro');
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [menuProfiles, setMenuProfiles] = useState<MenuProfile[]>([]);
  const [currentRatings, setCurrentRatings] = useState<MenuRating[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = getStoredMenu();
    if (stored.length > 0) {
      setMenuProfiles(stored);
      setStep('complete');
    }
    setLoaded(true);
  }, []);

  const category = MENU_CATEGORIES[categoryIndex];
  const totalCategories = MENU_CATEGORIES.length;

  const startNextCategory = () => {
    if (categoryIndex < totalCategories - 1) {
      setCategoryIndex(categoryIndex + 1);
      setCurrentRatings([]);
      setStep('swiping');
    } else {
      setStep('complete');
    }
  };

  const startFromCategory = (index: number) => {
    setCategoryIndex(index);
    setCurrentRatings([]);
    setStep('swiping');
  };

  if (!loaded) return null;

  // Intro
  if (step === 'intro') {
    return (
      <div className="page-enter min-h-dvh flex flex-col">
        <div className="px-5 pt-5 pb-3">
          <Link href="/" className="text-sm opacity-60 hover:opacity-100 transition-opacity">
            &larr; Home
          </Link>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <h1
            className="text-2xl font-semibold mb-3"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            My Menu
          </h1>
          <p className="text-sm opacity-50 max-w-xs mb-2 leading-relaxed">
            What are you open to across your relationships? Drag items toward the edges to sort them, or tap to cycle.
          </p>
          <p className="text-xs opacity-30 max-w-xs mb-10 leading-relaxed">
            This is about you — not any specific person. You can always come back and change things.
          </p>

          <div className="w-full max-w-xs space-y-2 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ background: MENU_TIER_COLORS['must-have'] }} />
              <span className="text-sm opacity-60">{MENU_TIER_LABELS['must-have']} — drag right</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ background: MENU_TIER_COLORS['open'] }} />
              <span className="text-sm opacity-60">{MENU_TIER_LABELS['open']} — drag up</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ background: MENU_TIER_COLORS['maybe'] }} />
              <span className="text-sm opacity-60">{MENU_TIER_LABELS['maybe']} — drag down</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ background: MENU_TIER_COLORS['off-limits'] }} />
              <span className="text-sm opacity-60">{MENU_TIER_LABELS['off-limits']} — drag left</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full opacity-30" style={{ background: '#888' }} />
              <span className="text-sm opacity-60">Tap any chip to cycle through tiers</span>
            </div>
          </div>

          <button
            onClick={() => { setStep('swiping'); setCategoryIndex(0); setCurrentRatings([]); }}
            className="px-10 py-3 rounded-2xl text-white font-medium transition-all hover:opacity-90 active:scale-[0.98]"
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
            setStep('category-done');
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

  // Category done
  if (step === 'category-done') {
    const catProfile = menuProfiles.find((p) => p.categoryId === category.id);
    const rated = catProfile?.ratings || [];
    const tiers: { key: MenuTier; label: string }[] = [
      { key: 'must-have', label: MENU_TIER_LABELS['must-have'] },
      { key: 'open', label: MENU_TIER_LABELS['open'] },
      { key: 'maybe', label: MENU_TIER_LABELS['maybe'] },
      { key: 'off-limits', label: MENU_TIER_LABELS['off-limits'] },
    ];
    const skipped = category.items.filter((item) => !rated.some((r) => r.item === item));

    return (
      <div className="page-enter min-h-dvh flex flex-col">
        <div className="px-5 pt-5 pb-2 flex items-center justify-between">
          <button
            onClick={() => startFromCategory(categoryIndex)}
            className="text-sm opacity-60 hover:opacity-100 transition-opacity"
          >
            &larr; Redo
          </button>
          <p className="text-sm font-medium" style={{ color: category.color }}>
            {category.name}
          </p>
          <div className="w-12" />
        </div>

        <div className="flex-1 px-5 pt-4 pb-6 overflow-y-auto">
          <div className="text-center mb-5">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto"
              style={{ background: category.color + '20' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={category.color} strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p className="text-xs opacity-40">
              {rated.length} of {category.items.length} rated
            </p>
          </div>

          <div className="space-y-3 max-w-sm mx-auto">
            {tiers.map(({ key, label }) => {
              const tierItems = rated.filter((r) => r.tier === key);
              if (tierItems.length === 0) return null;
              return (
                <div key={key}>
                  <p className="text-xs font-medium opacity-50 mb-1.5">{label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tierItems.map((r) => (
                      <span
                        key={r.item}
                        className="text-xs px-2.5 py-1 rounded-full"
                        style={{ background: MENU_TIER_COLORS[key] + '20', color: MENU_TIER_COLORS[key] }}
                      >
                        {r.item}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}

            {skipped.length > 0 && (
              <div>
                <p className="text-xs font-medium opacity-30 mb-1.5">Skipped</p>
                <div className="flex flex-wrap gap-1.5">
                  {skipped.map((item) => (
                    <span key={item} className="text-xs px-2.5 py-1 rounded-full bg-black/5 opacity-40">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={startNextCategory}
            className="w-full py-3 rounded-2xl text-white font-medium transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, var(--peach), var(--lavender))' }}
          >
            {categoryIndex < totalCategories - 1 ? `Next: ${MENU_CATEGORIES[categoryIndex + 1].name}` : 'See My Menu'}
          </button>
        </div>
      </div>
    );
  }

  // Complete — show full menu
  if (step === 'complete') {
    const allRatings = menuProfiles.flatMap((p) => p.ratings);
    const mustHaves = allRatings.filter((r) => r.tier === 'must-have');
    const open = allRatings.filter((r) => r.tier === 'open');
    const maybes = allRatings.filter((r) => r.tier === 'maybe');
    const offLimits = allRatings.filter((r) => r.tier === 'off-limits');

    return (
      <div className="page-enter min-h-dvh pb-8">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <Link href="/" className="text-sm opacity-60 hover:opacity-100 transition-opacity">
            &larr; Home
          </Link>
          <button
            onClick={() => { setStep('intro'); setMenuProfiles([]); localStorage.removeItem(STORAGE_KEY); }}
            className="text-xs opacity-30 hover:opacity-60 transition-opacity"
          >
            Redo
          </button>
        </div>

        <div className="px-5 pt-4 pb-6 text-center">
          <h1
            className="text-2xl font-semibold mb-1"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            My Menu
          </h1>
          <p className="text-sm opacity-50">
            {allRatings.length} items rated across {menuProfiles.length} categories
          </p>
        </div>

        {mustHaves.length > 0 && (
          <div className="mx-5 watercolor-card watercolor-rose p-4 mb-3">
            <p className="text-xs font-medium opacity-50 mb-2 uppercase tracking-wide">Must Have</p>
            <div className="flex flex-wrap gap-2">
              {mustHaves.map((r) => (
                <span key={r.item} className="text-sm px-3 py-1.5 rounded-full bg-rose/25 font-medium">{r.item}</span>
              ))}
            </div>
          </div>
        )}

        {open.length > 0 && (
          <div className="mx-5 watercolor-card watercolor-blue p-4 mb-3">
            <p className="text-xs font-medium opacity-50 mb-2 uppercase tracking-wide">Open To</p>
            <div className="flex flex-wrap gap-2">
              {open.map((r) => (
                <span key={r.item} className="text-sm px-3 py-1.5 rounded-full bg-blue/20">{r.item}</span>
              ))}
            </div>
          </div>
        )}

        {maybes.length > 0 && (
          <div className="mx-5 watercolor-card watercolor-gold p-4 mb-3">
            <p className="text-xs font-medium opacity-50 mb-2 uppercase tracking-wide">Maybe</p>
            <div className="flex flex-wrap gap-2">
              {maybes.map((r) => (
                <span key={r.item} className="text-sm px-3 py-1.5 rounded-full bg-gold/20">{r.item}</span>
              ))}
            </div>
          </div>
        )}

        {offLimits.length > 0 && (
          <div className="mx-5 watercolor-card bg-white/50 p-4 mb-3">
            <p className="text-xs font-medium opacity-50 mb-2 uppercase tracking-wide">Off Limits</p>
            <div className="flex flex-wrap gap-2">
              {offLimits.map((r) => (
                <span key={r.item} className="text-sm px-3 py-1.5 rounded-full bg-black/8">{r.item}</span>
              ))}
            </div>
          </div>
        )}

        {/* Edit by category */}
        <div className="mx-5 mt-6">
          <p className="text-xs opacity-30 mb-3 uppercase tracking-wide">Edit by category</p>
          <div className="grid grid-cols-2 gap-2">
            {MENU_CATEGORIES.map((cat, i) => {
              const profile = menuProfiles.find((p) => p.categoryId === cat.id);
              const count = profile?.ratings.length || 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => startFromCategory(i)}
                  className="watercolor-card p-3 text-left transition-all active:scale-[0.98]"
                  style={{ background: cat.color + '10' }}
                >
                  <p className="text-xs font-medium" style={{ color: cat.color }}>{cat.name}</p>
                  <p className="text-xs opacity-30 mt-0.5">{count} rated</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
