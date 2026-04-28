'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Connection, CategoryRatings, SubcategoryRating, Tier, Category } from '../../lib/types';
import { getCategoriesWithCustom, addCustomSubcategory } from '../../lib/storage';
import { analyzeOverlap, OverlapResult } from '../../lib/analysis';
import { getInvitationByToken, submitResponse, snapshotToConnection } from '../../lib/supabase/invitations';
import type { ProfileSnapshot } from '../../lib/supabase/types';
import ChipPool, { ChipRating } from '../../components/ChipPool';
import { CONNECTION_TIERS } from '../../lib/tier-configs';
import InstructionOverlay from '../../components/InstructionOverlay';
import ColorPicker, { ConnectionCircle } from '../../components/ColorPicker';
import WordCloud from '../../components/WordCloud';
import Highlights from '../../components/Highlights';
import CategoryCards from '../../components/CategoryCards';
import SharedCategoryCards from '../../components/SharedCategoryCards';
import Link from 'next/link';

type Step = 'loading' | 'error' | 'intro' | 'name' | 'instructions' | 'category' | 'submitting' | 'results';

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;

  const [step, setStep] = useState<Step>('loading');
  const [invitation, setInvitation] = useState<{
    id: string;
    profile_snapshot: ProfileSnapshot;
    status: string;
  } | null>(null);
  const [theirProfile, setTheirProfile] = useState<Connection | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [myName, setMyName] = useState('');
  const [myColor, setMyColor] = useState('#89CFF0');
  const [myCategoryRatings, setMyCategoryRatings] = useState<CategoryRatings[]>([]);
  const [myConnection, setMyConnection] = useState<Connection | null>(null);
  const [overlap, setOverlap] = useState<OverlapResult | null>(null);
  const [submitError, setSubmitError] = useState('');

  // Fetch invitation on mount
  useEffect(() => {
    async function load() {
      try {
        const inv = await getInvitationByToken(token);
        if (!inv) {
          setStep('error');
          return;
        }
        if (inv.status === 'completed') {
          setStep('error');
          return;
        }
        setInvitation(inv);
        const snapshot = inv.profile_snapshot as unknown as ProfileSnapshot;
        setTheirProfile(snapshotToConnection(snapshot));
        setStep('intro');
      } catch {
        setStep('error');
      }
    }
    load();
    setCategories(getCategoriesWithCustom());
  }, [token]);

  const totalSteps = categories.length + 1;

  const handleNameSubmit = () => {
    if (!myName.trim()) return;
    setStep('instructions');
  };

  const handleCategoryComplete = async (chipRatings: ChipRating[]) => {
    const cat = categories[categoryIndex];
    const ratings: SubcategoryRating[] = chipRatings.map((r) => ({
      subcategory: r.item,
      tier: r.tierId as Tier,
    }));

    const defaults = new Set(cat.subcategories);
    ratings.forEach((r) => {
      if (!defaults.has(r.subcategory)) addCustomSubcategory(cat.id, r.subcategory);
    });

    const updatedRatings = myCategoryRatings.filter((c) => c.categoryId !== cat.id);
    if (ratings.length > 0) updatedRatings.push({ categoryId: cat.id, ratings });
    setMyCategoryRatings(updatedRatings);

    if (categoryIndex < categories.length - 1) {
      setCategoryIndex(categoryIndex + 1);
    } else {
      await finishAndSubmit(updatedRatings);
    }
  };

  const finishAndSubmit = async (finalRatings: CategoryRatings[]) => {
    const mine: Connection = {
      id: crypto.randomUUID(),
      name: myName.trim(),
      emoji: myColor,
      color: myColor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      categories: finalRatings,
      timeRhythm: { communication: [], inPerson: [], custom: [] },
    };
    setMyConnection(mine);
    setStep('submitting');

    // Submit to Supabase
    if (invitation) {
      const result = await submitResponse(
        invitation.id,
        myName.trim(),
        myColor,
        mine
      );
      if (!result.success) {
        setSubmitError(result.error || 'Something went wrong');
      }
    }

    // Show results regardless
    if (theirProfile) {
      setOverlap(analyzeOverlap(mine, theirProfile));
    }
    setStep('results');
  };

  // Loading
  if (step === 'loading') {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-sm opacity-40">Loading...</p>
      </div>
    );
  }

  // Error
  if (step === 'error') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-8 text-center">
        <p className="text-lg opacity-40 mb-2">
          {invitation?.status === 'completed'
            ? 'This link has already been used'
            : 'Invalid or expired link'}
        </p>
        <p className="text-sm opacity-30 mb-6">
          {invitation?.status === 'completed'
            ? 'Someone already responded to this invitation.'
            : 'The link might be broken or no longer valid.'}
        </p>
        <Link href="/" className="text-sm opacity-60 hover:opacity-100 underline">
          Go to Relational Landscape
        </Link>
      </div>
    );
  }

  // Intro — clean invite page
  if (step === 'intro' && theirProfile) {
    const theirColor = theirProfile.color || theirProfile.emoji || '#C5A3CF';
    const sharerName = theirProfile.name;

    return (
      <div className="page-enter flex flex-col min-h-dvh">
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <ConnectionCircle color={theirColor} size={72} />
          <h1 className="text-2xl font-semibold mt-5 mb-3">
            {sharerName} wants to map this connection with you
          </h1>
          <p className="text-sm opacity-50 max-w-xs leading-relaxed mb-2">
            You&rsquo;ll each independently map what you want from this connection. Then you&rsquo;ll see where you align.
          </p>
          <p className="text-xs opacity-30 max-w-xs mb-10">
            No account needed &middot; Takes about 5 minutes
          </p>
          <button
            onClick={() => setStep('name')}
            className="w-full max-w-xs py-3.5 rounded-2xl text-white font-medium text-base transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: theirColor }}
          >
            Fill out your side
          </button>
        </div>
      </div>
    );
  }

  // Name step
  if (step === 'name' && theirProfile) {
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
          <ColorPicker value={myColor} onChange={setMyColor} />
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
            style={{ background: myColor }}
          >
            Begin Mapping
          </button>
        </div>
      </div>
    );
  }

  // Instructions
  if (step === 'instructions') {
    return (
      <div className="min-h-dvh flex flex-col">
        <InstructionOverlay onDismiss={() => { setStep('category'); setCategoryIndex(0); }} />
      </div>
    );
  }

  // Category steps
  if (step === 'category' && categories.length > 0) {
    const cat = categories[categoryIndex];
    const existingRatings = myCategoryRatings.find((c) => c.categoryId === cat.id)?.ratings || [];
    const initialChipRatings: ChipRating[] = existingRatings.map((r) => ({
      item: r.subcategory,
      tierId: r.tier,
    }));
    return (
      <div className="min-h-dvh flex flex-col">
        <ChipPool
          key={cat.id}
          items={cat.subcategories}
          categoryColor={cat.color}
          tiers={CONNECTION_TIERS}
          initialRatings={initialChipRatings}
          onComplete={handleCategoryComplete}
          onBack={() => {
            if (categoryIndex > 0) setCategoryIndex(categoryIndex - 1);
            else setStep('name');
          }}
          categoryName={cat.name}
          stepNumber={categoryIndex + 2}
          totalSteps={totalSteps}
        />
      </div>
    );
  }

  // Submitting
  if (step === 'submitting') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-8">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--lavender)] border-t-transparent animate-spin mb-4" />
        <p className="text-sm opacity-50">Sending your response...</p>
      </div>
    );
  }

  // Results — full summary page with My View / Shared View toggle
  if (step === 'results' && myConnection && theirProfile) {
    return (
      <ShareResults
        myConnection={myConnection}
        theirProfile={theirProfile}
        overlap={overlap}
        submitError={submitError}
      />
    );
  }

  return null;
}

function ShareResults({
  myConnection,
  theirProfile,
  overlap,
  submitError,
}: {
  myConnection: Connection;
  theirProfile: Connection;
  overlap: OverlapResult | null;
  submitError: string;
}) {
  const [viewMode, setViewMode] = useState<'shared' | 'my'>('shared');
  const myClr = myConnection.color || myConnection.emoji || '#89CFF0';
  const theirColor = theirProfile.color || theirProfile.emoji || '#C5A3CF';

  return (
    <div className="page-enter min-h-dvh pb-8">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <Link href="/" className="text-sm opacity-60 hover:opacity-100 transition-opacity">
          Relational Landscape &rarr;
        </Link>
      </div>

      {/* Identity */}
      <div className="flex flex-col items-center px-5 pt-4 pb-4">
        <ConnectionCircle color={myClr} size={56} />
        <h1 className="text-2xl font-semibold mt-3">{theirProfile.name}</h1>
      </div>

      {/* Success / Error message */}
      {!submitError ? (
        <div className="mx-5 mb-4 rounded-2xl p-3 text-center" style={{ background: 'rgba(0,148,131,0.08)' }}>
          <p className="text-sm font-medium" style={{ color: '#009483' }}>Sent to {theirProfile.name}</p>
          <p className="text-xs opacity-40 mt-0.5">They&rsquo;ll see your response on their dashboard</p>
        </div>
      ) : (
        <div className="mx-5 mb-4 rounded-2xl p-3 text-center" style={{ background: 'rgba(255,148,72,0.1)' }}>
          <p className="text-sm opacity-70">Couldn&rsquo;t send &mdash; but here are your results</p>
          <p className="text-xs opacity-40 mt-0.5">{submitError}</p>
        </div>
      )}

      {/* Sign up CTA */}
      <div className="mx-5 mb-4 rounded-2xl p-4 text-center" style={{ background: 'linear-gradient(135deg, rgba(244,168,154,0.1), rgba(197,163,207,0.1))' }}>
        <p className="text-sm font-medium opacity-70">Want to save this connection?</p>
        <p className="text-xs opacity-40 mt-0.5 mb-3">Sign up to keep your map, build your own landscape, and share with others</p>
        <Link
          href="/"
          className="inline-block px-5 py-2 rounded-full text-white text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, var(--peach), var(--lavender))' }}
        >
          Get started
        </Link>
      </div>

      {/* View Toggle */}
      <div className="px-5 mb-6">
        <div className="flex rounded-xl overflow-hidden border border-black/10">
          <button
            onClick={() => setViewMode('shared')}
            className="flex-1 py-2.5 text-sm font-medium transition-all"
            style={{
              background: viewMode === 'shared' ? (myClr) : 'transparent',
              color: viewMode === 'shared' ? 'white' : 'rgba(0,0,0,0.4)',
            }}
          >
            Shared View
          </button>
          <button
            onClick={() => setViewMode('my')}
            className="flex-1 py-2.5 text-sm font-medium transition-all"
            style={{
              background: viewMode === 'my' ? (myClr) : 'transparent',
              color: viewMode === 'my' ? 'white' : 'rgba(0,0,0,0.4)',
            }}
          >
            My View
          </button>
        </div>
      </div>

      {/* ===== SHARED VIEW ===== */}
      {viewMode === 'shared' && (
        <>
          {/* Highlights with mutual comparison */}
          <div className="px-5 mb-8">
            <Highlights
              connection={myConnection}
              theirConnection={theirProfile}
              theirName={theirProfile.name}
            />
          </div>

          {/* Connection Landscape (shared heat map) */}
          <div className="px-5 mb-8">
            <h2 className="text-2xl font-extrabold uppercase tracking-wide mb-3 px-1" style={{ color: 'rgba(0,0,0,0.7)' }}>
              Connection Landscape
            </h2>
            <SharedCategoryCards
              myConnection={myConnection}
              theirConnection={theirProfile}
              myName={myConnection.name}
              theirName={theirProfile.name}
            />
          </div>
        </>
      )}

      {/* ===== MY VIEW ===== */}
      {viewMode === 'my' && (
        <>
          {/* Highlights (solo — Person B's own answers) */}
          <div className="px-5 mb-8">
            <Highlights connection={myConnection} />
          </div>

          {/* Connection Landscape */}
          <div className="px-5 mb-8">
            <h2 className="text-2xl font-extrabold uppercase tracking-wide mb-3 px-1" style={{ color: 'rgba(0,0,0,0.7)' }}>
              Connection Landscape
            </h2>
            <CategoryCards connection={myConnection} />
          </div>
        </>
      )}
    </div>
  );
}
