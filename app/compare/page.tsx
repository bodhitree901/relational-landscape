'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Connection, CategoryRatings, SubcategoryRating, Tier, Category, SharedComparison } from '../lib/types';
import { decodeConnection } from '../lib/sharing';
import { getCategoriesWithCustom, addCustomSubcategory, getConnections, saveSharedComparison } from '../lib/storage';
import { analyzeOverlap, OverlapResult } from '../lib/analysis';
import ChipPool, { ChipRating } from '../components/ChipPool';
import { CONNECTION_TIERS } from '../lib/tier-configs';
import InstructionOverlay from '../components/InstructionOverlay';
import ColorPicker, { ConnectionCircle } from '../components/ColorPicker';
import Highlights from '../components/Highlights';
import CategoryCards from '../components/CategoryCards';
import SharedCategoryCards from '../components/SharedCategoryCards';
import Link from 'next/link';

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [theirProfile, setTheirProfile] = useState<Connection | null>(null);
  const [replyProfile, setReplyProfile] = useState<Connection | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [step, setStep] = useState<'intro' | 'name' | 'instructions' | 'category' | 'results'>('intro');
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [myName, setMyName] = useState('');
  const [myColor, setMyColor] = useState('#89CFF0');
  const [myCategoryRatings, setMyCategoryRatings] = useState<CategoryRatings[]>([]);
  const [myConnection, setMyConnection] = useState<Connection | null>(null);
  const [overlap, setOverlap] = useState<OverlapResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [matchedConnectionId, setMatchedConnectionId] = useState<string | null>(null);

  useEffect(() => {
    const profileParam = searchParams.get('profile');
    const replyParam = searchParams.get('reply');

    if (profileParam) {
      const decoded = decodeConnection(profileParam);
      if (decoded) setTheirProfile(decoded);
    }

    if (replyParam) {
      // This is a return link — person B's reply is included
      const decodedReply = decodeConnection(replyParam);
      if (decodedReply) setReplyProfile(decodedReply);
    }

    setCategories(getCategoriesWithCustom());
  }, [searchParams]);

  // When we have both profiles from a return URL, jump straight to results
  useEffect(() => {
    if (theirProfile && replyProfile) {
      // "theirProfile" is actually MY original profile (person A), "replyProfile" is person B
      // Try to find my original connection in localStorage
      const myConnections = getConnections();
      const match = myConnections.find(
        (c) => c.name === theirProfile.name &&
        c.categories.length === theirProfile.categories.length
      );
      if (match) {
        setMatchedConnectionId(match.id);
      }

      // Show results: my original profile vs their reply
      setMyConnection(theirProfile);
      setOverlap(analyzeOverlap(theirProfile, replyProfile));
      setStep('results');
    }
  }, [theirProfile, replyProfile]);

  const totalSteps = categories.length + 1;

  if (!theirProfile) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-8 text-center">
        <p className="text-lg opacity-40 mb-4">Invalid or missing profile link</p>
        <Link href="/" className="text-sm opacity-60 hover:opacity-100 underline">Go home</Link>
      </div>
    );
  }

  const handleStartMapping = () => setStep('name');

  const handleNameSubmit = () => {
    if (!myName.trim()) return;
    setStep('instructions');
  };

  const handleCategoryComplete = (chipRatings: ChipRating[]) => {
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
      const mine: Connection = {
        id: crypto.randomUUID(),
        name: myName.trim(),
        emoji: myColor,
        color: myColor,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        categories: updatedRatings,
        timeRhythm: { communication: [], inPerson: [], custom: [] },
      };
      setMyConnection(mine);
      setOverlap(analyzeOverlap(mine, theirProfile));
      setStep('results');
    }
  };

  // Person A saves the comparison to their dashboard
  const handleSaveComparison = () => {
    if (!myConnection || !replyProfile) return;
    const comparison: SharedComparison = {
      id: crypto.randomUUID(),
      myConnectionId: matchedConnectionId || myConnection.id,
      myProfile: myConnection,
      theirProfile: replyProfile,
      savedAt: new Date().toISOString(),
    };
    saveSharedComparison(comparison);
    setSaved(true);
  };

  // Intro — clean invite page
  if (step === 'intro' && !replyProfile) {
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
            onClick={handleStartMapping}
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

  // Instructions overlay (person B sees this before categories too)
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

  // Results — full summary with My View / Shared View toggle
  if (step === 'results' && myConnection) {
    const otherProfile = replyProfile || theirProfile;
    const isReturnView = !!replyProfile;

    return (
      <CompareResults
        myConnection={myConnection}
        otherProfile={otherProfile}
        overlap={overlap}
        isReturnView={isReturnView}
        onSave={isReturnView ? handleSaveComparison : undefined}
        saved={saved}
      />
    );
  }

  return null;
}

function CompareResults({
  myConnection,
  otherProfile,
  overlap,
  isReturnView,
  onSave,
  saved,
}: {
  myConnection: Connection;
  otherProfile: Connection;
  overlap: OverlapResult | null;
  isReturnView: boolean;
  onSave?: () => void;
  saved: boolean;
}) {
  const [viewMode, setViewMode] = useState<'shared' | 'my'>('shared');
  const myClr = myConnection.color || myConnection.emoji || '#89CFF0';
  const otherColor = otherProfile.color || otherProfile.emoji || '#C5A3CF';
  const otherName = otherProfile.name;

  return (
    <div className="page-enter min-h-dvh pb-8">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <Link href="/" className="text-sm opacity-60 hover:opacity-100 transition-opacity">
          &larr; Home
        </Link>
      </div>

      {/* Identity */}
      <div className="flex flex-col items-center px-5 pt-4 pb-4">
        <ConnectionCircle color={myClr} size={56} />
        <h1 className="text-2xl font-semibold mt-3">{otherName}</h1>
      </div>

      {/* Save CTA for return view / Sign up CTA for person B */}
      {isReturnView && onSave ? (
        <div className="mx-5 mb-4">
          <button
            onClick={onSave}
            disabled={saved}
            className="w-full py-3 rounded-2xl text-white font-medium text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            style={{ background: saved ? '#009483' : 'linear-gradient(135deg, var(--peach), var(--lavender))' }}
          >
            {saved ? 'Saved to your dashboard' : 'Save this comparison'}
          </button>
        </div>
      ) : (
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
      )}

      {/* View Toggle */}
      <div className="px-5 mb-6">
        <div className="flex rounded-xl overflow-hidden border border-black/10">
          <button
            onClick={() => setViewMode('shared')}
            className="flex-1 py-2.5 text-sm font-medium transition-all"
            style={{
              background: viewMode === 'shared' ? myClr : 'transparent',
              color: viewMode === 'shared' ? 'white' : 'rgba(0,0,0,0.4)',
            }}
          >
            Shared View
          </button>
          <button
            onClick={() => setViewMode('my')}
            className="flex-1 py-2.5 text-sm font-medium transition-all"
            style={{
              background: viewMode === 'my' ? myClr : 'transparent',
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
          <div className="px-5 mb-8">
            <Highlights
              connection={myConnection}
              theirConnection={otherProfile}
              theirName={otherName}
            />
          </div>

          <div className="px-5 mb-8">
            <h2 className="text-2xl font-extrabold uppercase tracking-wide mb-3 px-1" style={{ color: 'rgba(0,0,0,0.7)' }}>
              Connection Landscape
            </h2>
            <SharedCategoryCards
              myConnection={myConnection}
              theirConnection={otherProfile}
              myName={myConnection.name}
              theirName={otherName}
            />
          </div>
        </>
      )}

      {/* ===== MY VIEW ===== */}
      {viewMode === 'my' && (
        <>
          <div className="px-5 mb-8">
            <Highlights connection={myConnection} />
          </div>
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
