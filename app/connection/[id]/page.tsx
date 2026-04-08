'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Connection, SharedComparison, TIER_LABELS, TIER_ORDER } from '../../lib/types';
import { getConnection, deleteConnection, getSharedComparisonForConnection } from '../../lib/storage';
import { DEFAULT_CATEGORIES } from '../../lib/categories';
import { analyzeConnection, analyzeOverlap } from '../../lib/analysis';
import { generateShareUrl } from '../../lib/sharing';
import { createInvitation, getShareUrl, getResponseForConnection, snapshotToConnection } from '../../lib/supabase/invitations';
import type { ProfileSnapshot } from '../../lib/supabase/types';
import { useAuth } from '../../components/AuthProvider';
import WordCloud from '../../components/WordCloud';
import { ConnectionCircle } from '../../components/ColorPicker';
import Link from 'next/link';

function getCategoryById(id: string) {
  return DEFAULT_CATEGORIES.find((c) => c.id === id);
}

function getDefiningWords(connection: Connection): string[] {
  const allRatings = connection.categories.flatMap((c) => c.ratings);
  // Prioritize core, then rhythm
  const core = allRatings.filter((r) => r.tier === 'core');
  const rhythm = allRatings.filter((r) => r.tier === 'rhythm');
  const pool = [...core, ...rhythm, ...allRatings];

  // Pick up to 3 unique, short-ish labels
  const seen = new Set<string>();
  const words: string[] = [];
  for (const r of pool) {
    // Shorten labels for the tagline
    const short = shortenLabel(r.subcategory);
    if (!seen.has(short)) {
      seen.add(short);
      words.push(short);
      if (words.length >= 3) break;
    }
  }
  return words;
}

function shortenLabel(label: string): string {
  const map: Record<string, string> = {
    'Massage / Therapeutic Touch': 'Therapeutic Touch',
    'Emotional Support (outside the relationship)': 'Emotional Support',
    'Emotional Process Partners (within the relationship)': 'Emotional Processing',
    'Emotional Caregivers': 'Emotional Care',
    'Housemates / Domestic Living': 'Domestic Living',
    'Co-Parents / Caregivers': 'Co-Parenting',
    'Legal & Financial Bonds': 'Financial Bonds',
    'Marriage / Civil Partnership': 'Partnership',
    'Shared Finances / Meal Sharing': 'Shared Finances',
    'Professional / Work': 'Work',
    'Shared Causes / Politics': 'Shared Causes',
    'Spiritual / Religious': 'Spirituality',
    'Sexual Interactions': 'Sexual',
    'Sensual Interactions': 'Sensuality',
    'Creative Collaborations': 'Creative',
    'Academic Collaborations': 'Academic',
    'Shared Community': 'Community',
    'Shared Adventure': 'Adventure',
    'Shared Learning': 'Learning',
    'Shared Play': 'Play',
    'Shared Cuddles': 'Cuddles',
    'Facilitator & Participant': 'Facilitation',
    'Teacher & Student': 'Mentorship',
    'Parent & Child': 'Parenting',
    'Common Interests': 'Common Interests',
    'Intellectual Connection': 'Intellectual',
    'Feeds Self Growth': 'Growth',
    'Attachment Figure': 'Attachment',
    'Partnership': 'Partnership',
    'Collaborator': 'Collaborator',
    'Romantic Love': 'Romance',
    'Sense of Humor': 'Humor',
    'Hand Buddies': 'Hand Touch',
    'Sleeping Buddies': 'Co-Sleeping',
    'Organic / Intermittent': 'Organic',
    'From time to time': 'Occasional',
    'Occasional visits': 'Occasional Visits',
    'Dance Buddies': 'Dance',
    'Support Person': 'Support',
    'Power of Attorney': 'Legal Trust',
  };
  return map[label] || label;
}

export default function ConnectionProfile() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [connection, setConnection] = useState<Connection | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [showShareInfo, setShowShareInfo] = useState(false);
  const [sharedComparison, setSharedComparison] = useState<SharedComparison | null>(null);
  const [supabaseResponse, setSupabaseResponse] = useState<{
    responderName: string;
    responderColor: string;
    myProfile: Connection;
    theirProfile: Connection;
  } | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    const c = getConnection(params.id as string);
    if (c) {
      setConnection(c);
      // Check localStorage comparisons (legacy)
      const comp = getSharedComparisonForConnection(c.id);
      if (comp) setSharedComparison(comp);
    } else {
      router.push('/');
    }
  }, [params.id, router]);

  // Check Supabase for responses when authenticated
  useEffect(() => {
    if (!user || !connection) return;
    getResponseForConnection(user.id, connection.id).then((data) => {
      if (data && data.responses && data.responses.length > 0) {
        const resp = data.responses[0];
        const myProfile = snapshotToConnection(data.profile_snapshot as unknown as ProfileSnapshot, connection.id);
        const theirProfile = snapshotToConnection(resp.response_data as unknown as ProfileSnapshot);
        setSupabaseResponse({
          responderName: resp.responder_name,
          responderColor: resp.responder_color || '#89CFF0',
          myProfile,
          theirProfile,
        });
      }
    });
  }, [user, connection]);

  if (!connection) return null;

  const allRatings = connection.categories.flatMap((c) => c.ratings);
  const totalCount = allRatings.length;
  const definingWords = getDefiningWords(connection);
  const analysis = analyzeConnection(connection);

  const handleDelete = () => {
    deleteConnection(connection.id);
    router.push('/');
  };

  const handleShare = async () => {
    // Use Supabase sharing when authenticated, fallback to base64 URL
    if (user) {
      setSharing(true);
      try {
        const result = await createInvitation(user.id, connection.id, connection);
        if ('token' in result) {
          const url = getShareUrl(result.token);
          await copyToClipboard(url);
        } else {
          // Fallback to old method
          await copyToClipboard(generateShareUrl(connection));
        }
      } catch {
        await copyToClipboard(generateShareUrl(connection));
      }
      setSharing(false);
    } else {
      await copyToClipboard(generateShareUrl(connection));
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="page-enter min-h-dvh pb-8">
      {/* Header — edit goes back, home on right */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-sm opacity-60 hover:opacity-100 transition-opacity">
          &larr; Back
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="text-xs px-3 py-1.5 rounded-full transition-all active:scale-95"
            style={{
              background: copied ? 'var(--sage)' : 'rgba(61,53,50,0.06)',
              color: copied ? 'white' : '#3D3532',
            }}
          >
            {copied ? 'Copied!' : sharing ? '...' : 'Share'}
          </button>
          <Link href="/" className="text-sm opacity-60 hover:opacity-100 transition-opacity">
            Home
          </Link>
        </div>
      </div>

      {/* Identity */}
      <div className="flex flex-col items-center px-5 pt-4 pb-6">
        <ConnectionCircle color={connection.color || connection.emoji || '#C5A3CF'} size={56} />
        <h1 className="text-2xl font-semibold mt-3">{connection.name}</h1>
        {definingWords.length > 0 && (
          <p className="mt-2 text-sm opacity-45 italic tracking-wide">
            {definingWords.join(' · ')}
          </p>
        )}
      </div>

      {/* Word Cloud */}
      <div className="mx-5 watercolor-card bg-white/50 p-5 mb-6">
        <h2 className="text-sm font-medium opacity-50 mb-2 uppercase tracking-wide text-center">
          Connection Landscape
        </h2>
        <WordCloud connection={connection} />
      </div>

      {/* Analysis */}
      {totalCount > 0 && (
        <div className="mx-5 watercolor-card watercolor-lavender p-5 mb-6">
          <h2 className="text-sm font-medium opacity-50 mb-3 uppercase tracking-wide">
            Reading This Connection
          </h2>
          <div className="space-y-3">
            {analysis.summary.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-sm leading-relaxed opacity-75">
                {paragraph}
              </p>
            ))}
          </div>

          {analysis.suggestions.length > 0 && (
            <div className="mt-5 pt-4 border-t border-black/5">
              <h3 className="text-xs font-medium opacity-40 mb-3 uppercase tracking-wide">
                Ways to connect
              </h3>
              <div className="space-y-2">
                {analysis.suggestions.map((suggestion, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-sm opacity-40 shrink-0">~</span>
                    <p className="text-sm leading-relaxed opacity-65">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category breakdown */}
      <div className="px-5 space-y-4 mb-6">
        {connection.categories.map((cat) => {
          const catDef = getCategoryById(cat.categoryId);
          if (!catDef || cat.ratings.length === 0) return null;
          return (
            <div
              key={cat.categoryId}
              className={`watercolor-card p-4 ${catDef.watercolorClass}`}
            >
              <h3 className="text-sm font-semibold mb-3" style={{ color: catDef.color }}>
                {catDef.name}
              </h3>
              {TIER_ORDER.filter((tier) => cat.ratings.some((r) => r.tier === tier)).map((tier) => (
                <div key={tier} className="mb-2">
                  <p className="text-xs opacity-40 mb-1">{TIER_LABELS[tier]}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.ratings
                      .filter((r) => r.tier === tier)
                      .map((r) => (
                        <span
                          key={r.subcategory}
                          className="text-xs px-2.5 py-1 rounded-full"
                          style={{ background: `${catDef.color}25` }}
                        >
                          {r.subcategory}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Shared comparison (if person B replied) */}
      {sharedComparison && (() => {
        const comp = sharedComparison;
        const overlapData = analyzeOverlap(comp.myProfile, comp.theirProfile);
        const theirColor = comp.theirProfile.color || comp.theirProfile.emoji || '#C5A3CF';
        const totalShared = overlapData.sharedCore.length + overlapData.sharedRhythm.length +
          overlapData.sharedSometimes.length + overlapData.sharedPotential.length;
        return (
          <div className="mx-5 mb-6">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="w-full watercolor-card p-4 text-left transition-all active:scale-[0.99]"
              style={{ background: 'linear-gradient(135deg, rgba(197,163,207,0.1), rgba(137,207,240,0.1))' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center -space-x-2">
                    <ConnectionCircle color={connection.color || connection.emoji || '#C5A3CF'} size={28} />
                    <ConnectionCircle color={theirColor} size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Shared view with {comp.theirProfile.name}</p>
                    <p className="text-xs opacity-40">
                      {totalShared} overlap{totalShared !== 1 ? 's' : ''} · {overlapData.sharedCore.length} core
                    </p>
                  </div>
                </div>
                <span className="text-xs opacity-30">{showComparison ? '▲' : '▼'}</span>
              </div>
            </button>
            {showComparison && (
              <div className="mt-3 space-y-3">
                {overlapData.sharedCore.length > 0 && (
                  <div className="watercolor-card watercolor-rose p-3">
                    <p className="text-xs opacity-40 mb-1.5">Both see as core</p>
                    <div className="flex flex-wrap gap-1.5">
                      {overlapData.sharedCore.map((s) => (
                        <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-rose/25 font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {overlapData.sharedRhythm.length > 0 && (
                  <div className="watercolor-card watercolor-blue p-3">
                    <p className="text-xs opacity-40 mb-1.5">Shared rhythm</p>
                    <div className="flex flex-wrap gap-1.5">
                      {overlapData.sharedRhythm.map((s) => (
                        <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-blue/20">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {(overlapData.uniqueToMe.length > 0 || overlapData.uniqueToThem.length > 0) && (
                  <div className="flex gap-2">
                    {overlapData.uniqueToMe.length > 0 && (
                      <div className="flex-1 watercolor-card bg-white/50 p-3">
                        <p className="text-xs opacity-35 mb-1.5">Only you named</p>
                        <div className="flex flex-wrap gap-1">
                          {overlapData.uniqueToMe.slice(0, 6).map((u) => (
                            <span key={u.sub} className="text-xs px-2 py-0.5 rounded-full bg-black/5">{u.sub}</span>
                          ))}
                          {overlapData.uniqueToMe.length > 6 && (
                            <span className="text-xs opacity-30">+{overlapData.uniqueToMe.length - 6}</span>
                          )}
                        </div>
                      </div>
                    )}
                    {overlapData.uniqueToThem.length > 0 && (
                      <div className="flex-1 watercolor-card bg-white/50 p-3">
                        <p className="text-xs opacity-35 mb-1.5">Only {comp.theirProfile.name}</p>
                        <div className="flex flex-wrap gap-1">
                          {overlapData.uniqueToThem.slice(0, 6).map((u) => (
                            <span key={u.sub} className="text-xs px-2 py-0.5 rounded-full bg-black/5">{u.sub}</span>
                          ))}
                          {overlapData.uniqueToThem.length > 6 && (
                            <span className="text-xs opacity-30">+{overlapData.uniqueToThem.length - 6}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="watercolor-card watercolor-lavender p-4">
                  <div className="space-y-2">
                    {overlapData.overlapSummary.split('\n\n').slice(0, 2).map((p, i) => (
                      <p key={i} className="text-xs leading-relaxed opacity-65">{p}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Supabase response (if person B replied via /share/[token]) */}
      {supabaseResponse && !sharedComparison && (() => {
        const { myProfile, theirProfile, responderName, responderColor } = supabaseResponse;
        const overlapData = analyzeOverlap(myProfile, theirProfile);
        const totalShared = overlapData.sharedCore.length + overlapData.sharedRhythm.length +
          overlapData.sharedSometimes.length + overlapData.sharedPotential.length;
        return (
          <div className="mx-5 mb-6">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="w-full watercolor-card p-4 text-left transition-all active:scale-[0.99]"
              style={{ background: 'linear-gradient(135deg, rgba(197,163,207,0.1), rgba(137,207,240,0.1))' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center -space-x-2">
                    <ConnectionCircle color={connection.color || connection.emoji || '#C5A3CF'} size={28} />
                    <ConnectionCircle color={responderColor} size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Shared view with {responderName}</p>
                    <p className="text-xs opacity-40">
                      {totalShared} overlap{totalShared !== 1 ? 's' : ''} · {overlapData.sharedCore.length} core
                    </p>
                  </div>
                </div>
                <span className="text-xs opacity-30">{showComparison ? '▲' : '▼'}</span>
              </div>
            </button>
            {showComparison && (
              <div className="mt-3 space-y-3">
                {overlapData.sharedCore.length > 0 && (
                  <div className="watercolor-card watercolor-rose p-3">
                    <p className="text-xs opacity-40 mb-1.5">Both see as core</p>
                    <div className="flex flex-wrap gap-1.5">
                      {overlapData.sharedCore.map((s) => (
                        <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-rose/25 font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {overlapData.sharedRhythm.length > 0 && (
                  <div className="watercolor-card watercolor-blue p-3">
                    <p className="text-xs opacity-40 mb-1.5">Shared rhythm</p>
                    <div className="flex flex-wrap gap-1.5">
                      {overlapData.sharedRhythm.map((s) => (
                        <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-blue/20">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="watercolor-card watercolor-lavender p-4">
                  <div className="space-y-2">
                    {overlapData.overlapSummary.split('\n\n').slice(0, 2).map((p, i) => (
                      <p key={i} className="text-xs leading-relaxed opacity-65">{p}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Share info (collapsible, subtle) */}
      <div className="mx-5 mb-6">
        <button
          onClick={() => setShowShareInfo(!showShareInfo)}
          className="text-xs opacity-30 hover:opacity-50 transition-opacity"
        >
          How does sharing work?
        </button>
        {showShareInfo && (
          <div className="mt-2 p-3 rounded-xl bg-white/50 text-xs opacity-50 leading-relaxed space-y-2">
            <p>1. Tap &ldquo;Share&rdquo; above to copy a link</p>
            <p>2. Send it to {connection.name}</p>
            <p>3. They fill out their own version of this connection</p>
            <p>4. They tap &ldquo;Share back&rdquo; and send the return link to you</p>
            <p>5. Open their link to see the overlap and save it here</p>
            <p className="opacity-70 italic">No accounts, no servers — everything stays on-device.</p>
          </div>
        )}
      </div>

      {/* Delete */}
      <div className="px-5 pt-2">
        {!showDelete ? (
          <button
            onClick={() => setShowDelete(true)}
            className="text-sm opacity-30 hover:opacity-60 transition-opacity"
          >
            Delete this connection
          </button>
        ) : (
          <div className="flex gap-3 items-center">
            <p className="text-sm opacity-60">Are you sure?</p>
            <button
              onClick={handleDelete}
              className="text-sm px-4 py-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setShowDelete(false)}
              className="text-sm opacity-50 hover:opacity-80"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
