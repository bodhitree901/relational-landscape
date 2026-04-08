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

  // Intro — Person B sees Person A's profile
  if (step === 'intro' && theirProfile) {
    const theirRatings = theirProfile.categories.flatMap((c) => c.ratings);
    const theirCore = theirRatings.filter((r) => r.tier === 'core').map((r) => r.subcategory);
    const theirRhythm = theirRatings.filter((r) => r.tier === 'rhythm').map((r) => r.subcategory);
    const theirColor = theirProfile.color || theirProfile.emoji || '#C5A3CF';

    return (
      <div className="page-enter min-h-dvh pb-8">
        <div className="px-5 pt-8 pb-4 flex flex-col items-center text-center">
          <ConnectionCircle color={theirColor} size={56} />
          <h1 className="text-2xl font-semibold mt-3 mb-2">{theirProfile.name}&rsquo;s View</h1>
          <p className="text-sm opacity-50 max-w-xs">
            {theirProfile.name} mapped how they see your connection. Now it&rsquo;s your turn.
          </p>
        </div>

        <div className="mx-5 watercolor-card bg-white/50 p-5 mb-6">
          <h2 className="text-sm font-medium opacity-50 mb-2 uppercase tracking-wide text-center">
            How {theirProfile.name} sees this connection
          </h2>
          <WordCloud connection={theirProfile} />
        </div>

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
            onClick={() => setStep('name')}
            className="w-full py-3 rounded-2xl text-white font-medium text-base transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, var(--peach), var(--lavender))' }}
          >
            Map your side of this connection
          </button>
          <p className="text-center text-xs opacity-30 mt-3">
            No account needed — just fill it out and see where you overlap
          </p>
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

  // Results
  if (step === 'results' && overlap && myConnection && theirProfile) {
    const myClr = myConnection.color || myConnection.emoji || '#89CFF0';
    const theirColor = theirProfile.color || theirProfile.emoji || '#C5A3CF';

    return (
      <div className="page-enter min-h-dvh pb-8">
        <div className="px-5 pt-5 pb-3">
          <Link href="/" className="text-sm opacity-60 hover:opacity-100 transition-opacity">
            Relational Landscape &rarr;
          </Link>
        </div>

        <div className="flex flex-col items-center px-5 pt-4 pb-6">
          <div className="flex items-center gap-4 mb-3">
            <ConnectionCircle color={myClr} size={44} />
            <span className="text-lg opacity-20">&</span>
            <ConnectionCircle color={theirColor} size={44} />
          </div>
          <h1 className="text-2xl font-semibold">
            {myConnection.name} & {theirProfile.name}
          </h1>
          <p className="text-sm opacity-50 mt-1">Where you overlap</p>
        </div>

        {/* Success message */}
        {!submitError && (
          <div className="mx-5 mb-6 watercolor-card p-4 text-center" style={{ background: 'rgba(139,190,140,0.12)' }}>
            <p className="text-sm font-medium opacity-70">Your response has been sent to {theirProfile.name}</p>
            <p className="text-xs opacity-40 mt-1">It will appear on their dashboard automatically</p>
          </div>
        )}
        {submitError && (
          <div className="mx-5 mb-6 watercolor-card watercolor-rose p-4 text-center">
            <p className="text-sm opacity-70">Couldn&rsquo;t send — but here are your results</p>
            <p className="text-xs opacity-40 mt-1">{submitError}</p>
          </div>
        )}

        {overlap.sharedCore.length > 0 && (
          <div className="mx-5 watercolor-card watercolor-rose p-4 mb-3">
            <p className="text-xs font-medium opacity-50 mb-2 uppercase tracking-wide">Both see as core</p>
            <div className="flex flex-wrap gap-2">
              {overlap.sharedCore.map((s) => (
                <span key={s} className="text-sm px-3 py-1.5 rounded-full bg-rose/25 font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}

        {overlap.sharedRhythm.length > 0 && (
          <div className="mx-5 watercolor-card watercolor-blue p-4 mb-3">
            <p className="text-xs font-medium opacity-50 mb-2 uppercase tracking-wide">Shared rhythm</p>
            <div className="flex flex-wrap gap-2">
              {overlap.sharedRhythm.map((s) => (
                <span key={s} className="text-sm px-3 py-1.5 rounded-full bg-blue/20">{s}</span>
              ))}
            </div>
          </div>
        )}

        {overlap.sharedSometimes.length > 0 && (
          <div className="mx-5 watercolor-card watercolor-gold p-4 mb-3">
            <p className="text-xs font-medium opacity-50 mb-2 uppercase tracking-wide">Both notice sometimes</p>
            <div className="flex flex-wrap gap-2">
              {overlap.sharedSometimes.map((s) => (
                <span key={s} className="text-sm px-3 py-1.5 rounded-full bg-gold/20">{s}</span>
              ))}
            </div>
          </div>
        )}

        {overlap.sharedPotential.length > 0 && (
          <div className="mx-5 watercolor-card watercolor-peach p-4 mb-3">
            <p className="text-xs font-medium opacity-50 mb-2 uppercase tracking-wide">Both see potential</p>
            <div className="flex flex-wrap gap-2">
              {overlap.sharedPotential.map((s) => (
                <span key={s} className="text-sm px-3 py-1.5 rounded-full bg-peach/20">{s}</span>
              ))}
            </div>
          </div>
        )}

        <div className="mx-5 flex gap-3 mb-6 mt-4">
          {overlap.uniqueToMe.length > 0 && (
            <div className="flex-1 watercolor-card bg-white/50 p-4">
              <p className="text-xs font-medium opacity-40 mb-2">Only you named</p>
              <div className="flex flex-wrap gap-1.5">
                {overlap.uniqueToMe.map((u) => (
                  <span key={u.sub} className="text-xs px-2 py-1 rounded-full bg-black/5">{u.sub}</span>
                ))}
              </div>
            </div>
          )}
          {overlap.uniqueToThem.length > 0 && (
            <div className="flex-1 watercolor-card bg-white/50 p-4">
              <p className="text-xs font-medium opacity-40 mb-2">Only {theirProfile.name} named</p>
              <div className="flex flex-wrap gap-1.5">
                {overlap.uniqueToThem.map((u) => (
                  <span key={u.sub} className="text-xs px-2 py-1 rounded-full bg-black/5">{u.sub}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mx-5 watercolor-card watercolor-lavender p-5 mb-6">
          <h2 className="text-sm font-medium opacity-50 mb-3 uppercase tracking-wide">Reading Your Overlap</h2>
          <div className="space-y-3">
            {overlap.overlapSummary.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-sm leading-relaxed opacity-75">{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="mx-5 space-y-3 mb-6">
          <div className="watercolor-card bg-white/50 p-4">
            <div className="flex items-center gap-2 mb-2 justify-center">
              <ConnectionCircle color={myClr} size={16} />
              <p className="text-xs font-medium opacity-40">Your view</p>
            </div>
            <WordCloud connection={myConnection} />
          </div>
          <div className="watercolor-card bg-white/50 p-4">
            <div className="flex items-center gap-2 mb-2 justify-center">
              <ConnectionCircle color={theirColor} size={16} />
              <p className="text-xs font-medium opacity-40">{theirProfile.name}&rsquo;s view</p>
            </div>
            <WordCloud connection={theirProfile} />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
