'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Connection, CategoryRatings, SubcategoryRating, TimeRhythm, Category, TIER_LABELS, TIER_ORDER, Tier } from '../lib/types';
import { decodeConnection } from '../lib/sharing';
import { getCategoriesWithCustom, addCustomSubcategory } from '../lib/storage';
import { analyzeOverlap, OverlapResult } from '../lib/analysis';
import { DEFAULT_CATEGORIES } from '../lib/categories';
import CategoryStep from '../components/CategoryStep';
import TimeRhythmStep from '../components/TimeRhythmStep';
import EmojiPicker from '../components/EmojiPicker';
import WordCloud from '../components/WordCloud';
import Link from 'next/link';

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [theirProfile, setTheirProfile] = useState<Connection | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [step, setStep] = useState<'intro' | 'name' | 'category' | 'time' | 'results'>('intro');
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [myName, setMyName] = useState('');
  const [myEmoji, setMyEmoji] = useState('');
  const [myCategoryRatings, setMyCategoryRatings] = useState<CategoryRatings[]>([]);
  const [myTimeRhythm, setMyTimeRhythm] = useState<TimeRhythm>({
    communication: [],
    inPerson: [],
    custom: [],
  });
  const [myConnection, setMyConnection] = useState<Connection | null>(null);
  const [overlap, setOverlap] = useState<OverlapResult | null>(null);

  useEffect(() => {
    const profileParam = searchParams.get('profile');
    if (profileParam) {
      const decoded = decodeConnection(profileParam);
      if (decoded) {
        setTheirProfile(decoded);
      }
    }
    setCategories(getCategoriesWithCustom());
  }, [searchParams]);

  const totalSteps = categories.length + 2;

  if (!theirProfile) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-8 text-center">
        <p className="text-lg opacity-40 mb-4">Invalid or missing profile link</p>
        <Link href="/" className="text-sm opacity-60 hover:opacity-100 underline">
          Go home
        </Link>
      </div>
    );
  }

  const handleStartMapping = () => {
    setStep('name');
  };

  const handleNameSubmit = () => {
    if (!myName.trim()) return;
    setStep('category');
    setCategoryIndex(0);
  };

  const handleCategoryComplete = (ratings: SubcategoryRating[]) => {
    const cat = categories[categoryIndex];
    const defaults = new Set(cat.subcategories);
    ratings.forEach((r) => {
      if (!defaults.has(r.subcategory)) {
        addCustomSubcategory(cat.id, r.subcategory);
      }
    });

    setMyCategoryRatings((prev) => {
      const existing = prev.filter((c) => c.categoryId !== cat.id);
      if (ratings.length > 0) return [...existing, { categoryId: cat.id, ratings }];
      return existing;
    });

    if (categoryIndex < categories.length - 1) {
      setCategoryIndex(categoryIndex + 1);
    } else {
      setStep('time');
    }
  };

  const handleTimeComplete = (data: TimeRhythm) => {
    setMyTimeRhythm(data);
    const mine: Connection = {
      id: crypto.randomUUID(),
      name: myName.trim(),
      emoji: myEmoji || '💛',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      categories: myCategoryRatings,
      timeRhythm: data,
    };
    setMyConnection(mine);
    setOverlap(analyzeOverlap(mine, theirProfile));
    setStep('results');
  };

  // Intro — show their profile and invite to fill yours
  if (step === 'intro') {
    const theirRatings = theirProfile.categories.flatMap((c) => c.ratings);
    const theirCore = theirRatings.filter((r) => r.tier === 'core').map((r) => r.subcategory);
    const theirRhythm = theirRatings.filter((r) => r.tier === 'rhythm').map((r) => r.subcategory);

    return (
      <div className="page-enter min-h-dvh pb-8">
        <div className="px-5 pt-8 pb-4 text-center">
          <span className="text-4xl mb-3 block">{theirProfile.emoji}</span>
          <h1 className="text-2xl font-semibold mb-2">{theirProfile.name}&rsquo;s View</h1>
          <p className="text-sm opacity-50 max-w-xs mx-auto">
            {theirProfile.name} mapped how they see your connection. Now it&rsquo;s your turn.
          </p>
        </div>

        {/* Their word cloud */}
        <div className="mx-5 watercolor-card bg-white/50 p-5 mb-6">
          <h2 className="text-sm font-medium opacity-50 mb-2 uppercase tracking-wide text-center">
            How {theirProfile.name} sees this connection
          </h2>
          <WordCloud connection={theirProfile} />
        </div>

        {/* Their breakdown summary */}
        <div className="mx-5 mb-6 space-y-2">
          {theirCore.length > 0 && (
            <div className="watercolor-card watercolor-rose p-3">
              <p className="text-xs opacity-40 mb-1">Core to the connection</p>
              <div className="flex flex-wrap gap-1.5">
                {theirCore.map((s) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-rose/20">{s}</span>
                ))}
              </div>
            </div>
          )}
          {theirRhythm.length > 0 && (
            <div className="watercolor-card watercolor-blue p-3">
              <p className="text-xs opacity-40 mb-1">Part of the rhythm</p>
              <div className="flex flex-wrap gap-1.5">
                {theirRhythm.map((s) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-blue/20">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-5">
          <button
            onClick={handleStartMapping}
            className="w-full py-3 rounded-2xl text-white font-medium text-base transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, var(--peach), var(--lavender))' }}
          >
            Map your side of this connection
          </button>
          <p className="text-center text-xs opacity-30 mt-3">
            Fill out how you see it, then see where you overlap
          </p>
        </div>
      </div>
    );
  }

  // Name step
  if (step === 'name') {
    return (
      <div className="page-enter flex flex-col min-h-dvh">
        <div className="px-5 pt-5 pb-3">
          <button onClick={() => setStep('intro')} className="text-sm opacity-60 hover:opacity-100 transition-opacity">
            &larr; Back
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <h1 className="text-2xl font-semibold mb-2 text-center">Your turn</h1>
          <p className="text-sm opacity-50 mb-8 text-center">
            How do you see your connection with {theirProfile.name}?
          </p>
          <EmojiPicker value={myEmoji} onChange={setMyEmoji} />
          <input
            type="text"
            value={myName}
            onChange={(e) => setMyName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
            placeholder="Your name..."
            className="mt-6 w-full max-w-xs text-center text-xl bg-transparent border-b-2 border-black/10 focus:border-black/30 outline-none pb-2 placeholder:opacity-30 transition-colors"
            autoFocus
          />
          <button
            onClick={handleNameSubmit}
            disabled={!myName.trim()}
            className="mt-8 px-8 py-3 rounded-2xl text-white font-medium transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-30"
            style={{ background: 'var(--lavender)' }}
          >
            Begin Mapping
          </button>
        </div>
      </div>
    );
  }

  // Category steps
  if (step === 'category' && categories.length > 0) {
    const cat = categories[categoryIndex];
    const existingRatings = myCategoryRatings.find((c) => c.categoryId === cat.id)?.ratings || [];
    return (
      <div className="min-h-dvh flex flex-col">
        <CategoryStep
          key={cat.id}
          category={cat}
          initialRatings={existingRatings}
          onComplete={handleCategoryComplete}
          onBack={() => {
            if (categoryIndex > 0) setCategoryIndex(categoryIndex - 1);
            else setStep('name');
          }}
          onSkip={() => {
            if (categoryIndex < categories.length - 1) setCategoryIndex(categoryIndex + 1);
            else setStep('time');
          }}
          stepNumber={categoryIndex + 2}
          totalSteps={totalSteps}
        />
      </div>
    );
  }

  // Time step
  if (step === 'time') {
    return (
      <div className="min-h-dvh flex flex-col">
        <TimeRhythmStep
          initialData={myTimeRhythm}
          onComplete={handleTimeComplete}
          onBack={() => {
            setCategoryIndex(categories.length - 1);
            setStep('category');
          }}
          stepNumber={totalSteps}
          totalSteps={totalSteps}
        />
      </div>
    );
  }

  // Results — the overlap view
  if (step === 'results' && overlap && myConnection) {
    return (
      <div className="page-enter min-h-dvh pb-8">
        <div className="px-5 pt-5 pb-3">
          <Link href="/" className="text-sm opacity-60 hover:opacity-100 transition-opacity">
            &larr; Home
          </Link>
        </div>

        <div className="text-center px-5 pt-4 pb-6">
          <div className="flex justify-center items-center gap-3 mb-3">
            <span className="text-3xl">{myConnection.emoji}</span>
            <span className="text-lg opacity-30">&amp;</span>
            <span className="text-3xl">{theirProfile.emoji}</span>
          </div>
          <h1 className="text-2xl font-semibold">
            {myConnection.name} & {theirProfile.name}
          </h1>
          <p className="text-sm opacity-50 mt-1">Where you overlap</p>
        </div>

        {/* Shared items by tier */}
        {overlap.sharedCore.length > 0 && (
          <div className="mx-5 watercolor-card watercolor-rose p-4 mb-3">
            <p className="text-xs font-medium opacity-50 mb-2 uppercase tracking-wide">
              Both see as core
            </p>
            <div className="flex flex-wrap gap-2">
              {overlap.sharedCore.map((s) => (
                <span key={s} className="text-sm px-3 py-1.5 rounded-full bg-rose/25 font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {overlap.sharedRhythm.length > 0 && (
          <div className="mx-5 watercolor-card watercolor-blue p-4 mb-3">
            <p className="text-xs font-medium opacity-50 mb-2 uppercase tracking-wide">
              Shared rhythm
            </p>
            <div className="flex flex-wrap gap-2">
              {overlap.sharedRhythm.map((s) => (
                <span key={s} className="text-sm px-3 py-1.5 rounded-full bg-blue/20">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {overlap.sharedSometimes.length > 0 && (
          <div className="mx-5 watercolor-card watercolor-gold p-4 mb-3">
            <p className="text-xs font-medium opacity-50 mb-2 uppercase tracking-wide">
              Both notice sometimes
            </p>
            <div className="flex flex-wrap gap-2">
              {overlap.sharedSometimes.map((s) => (
                <span key={s} className="text-sm px-3 py-1.5 rounded-full bg-gold/20">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {overlap.sharedPotential.length > 0 && (
          <div className="mx-5 watercolor-card watercolor-peach p-4 mb-3">
            <p className="text-xs font-medium opacity-50 mb-2 uppercase tracking-wide">
              Both see potential
            </p>
            <div className="flex flex-wrap gap-2">
              {overlap.sharedPotential.map((s) => (
                <span key={s} className="text-sm px-3 py-1.5 rounded-full bg-peach/20">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Unique items */}
        <div className="mx-5 flex gap-3 mb-6 mt-4">
          {overlap.uniqueToMe.length > 0 && (
            <div className="flex-1 watercolor-card bg-white/50 p-4">
              <p className="text-xs font-medium opacity-40 mb-2">
                Only {myConnection.name} named
              </p>
              <div className="flex flex-wrap gap-1.5">
                {overlap.uniqueToMe.map((u) => (
                  <span key={u.sub} className="text-xs px-2 py-1 rounded-full bg-black/5">
                    {u.sub}
                  </span>
                ))}
              </div>
            </div>
          )}
          {overlap.uniqueToThem.length > 0 && (
            <div className="flex-1 watercolor-card bg-white/50 p-4">
              <p className="text-xs font-medium opacity-40 mb-2">
                Only {theirProfile.name} named
              </p>
              <div className="flex flex-wrap gap-1.5">
                {overlap.uniqueToThem.map((u) => (
                  <span key={u.sub} className="text-xs px-2 py-1 rounded-full bg-black/5">
                    {u.sub}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Overlap analysis */}
        <div className="mx-5 watercolor-card watercolor-lavender p-5 mb-6">
          <h2 className="text-sm font-medium opacity-50 mb-3 uppercase tracking-wide">
            Reading Your Overlap
          </h2>
          <div className="space-y-3">
            {overlap.overlapSummary.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-sm leading-relaxed opacity-75">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Side by side word clouds */}
        <div className="mx-5 space-y-3 mb-6">
          <div className="watercolor-card bg-white/50 p-4">
            <p className="text-xs font-medium opacity-40 mb-2 text-center">
              {myConnection.emoji} {myConnection.name}&rsquo;s view
            </p>
            <WordCloud connection={myConnection} />
          </div>
          <div className="watercolor-card bg-white/50 p-4">
            <p className="text-xs font-medium opacity-40 mb-2 text-center">
              {theirProfile.emoji} {theirProfile.name}&rsquo;s view
            </p>
            <WordCloud connection={theirProfile} />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-sm opacity-40">Loading...</p>
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}
