'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Connection, SharedComparison } from '../../lib/types';
import { getConnection, deleteConnection, getSharedComparisonForConnection } from '../../lib/storage';
import { DEFAULT_CATEGORIES } from '../../lib/categories';
import { createInvitation, getShareUrl, getResponseForConnection, snapshotToConnection, subscribeToResponses } from '../../lib/supabase/invitations';
import type { ProfileSnapshot } from '../../lib/supabase/types';
import { useAuth } from '../../components/AuthProvider';
import { signInWithGoogle, signInWithMagicLink } from '../../lib/supabase/auth';
import CategoryCards from '../../components/CategoryCards';
import SharedCategoryCards from '../../components/SharedCategoryCards';
import Highlights from '../../components/Highlights';
import DefaultsComparison from '../../components/DefaultsComparison';
import { ConnectionCircle } from '../../components/ColorPicker';
import Link from 'next/link';

function getCategoryById(id: string) {
  return DEFAULT_CATEGORIES.find((c) => c.id === id);
}

function getDefiningWords(connection: Connection): string[] {
  const allRatings = connection.categories.flatMap((c) => c.ratings);
  // Prioritize must-have, then open
  const core = allRatings.filter((r) => r.tier === 'must-have');
  const rhythm = allRatings.filter((r) => r.tier === 'open');
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
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [sharedComparison, setSharedComparison] = useState<SharedComparison | null>(null);
  const [supabaseResponse, setSupabaseResponse] = useState<{
    responderName: string;
    responderColor: string;
    myProfile: Connection;
    theirProfile: Connection;
  } | null>(null);
  const [viewMode, setViewMode] = useState<'my' | 'shared'>('my');

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

  // Fetch responses from Supabase
  const fetchResponse = () => {
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
        // Mark this response as seen (clear the badge)
        const SEEN_KEY = 'rl_seen_responses';
        const seen = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
        if (!seen.includes(connection.id)) {
          seen.push(connection.id);
          localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
          // Auto-switch to shared view when there's a new response
          setViewMode('shared');
        }
      }
    });
  };

  // Check Supabase for responses on mount
  useEffect(() => {
    fetchResponse();
  }, [user, connection]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user || !connection) return;
    const sub = subscribeToResponses(user.id, connection.id, () => {
      // Person B just responded — fetch the new data
      fetchResponse();
    });
    return () => sub.unsubscribe();
  }, [user, connection]);

  if (!connection) return null;

  const hasSharedData = !!(supabaseResponse || sharedComparison);
  const allRatings = connection.categories.flatMap((c) => c.ratings);
  const totalCount = allRatings.length;
  const definingWords = getDefiningWords(connection);

  const handleDelete = () => {
    deleteConnection(connection.id);
    router.push('/');
  };

  const handleShare = async () => {
    if (!user) {
      setShowSignInPrompt(true);
      return;
    }
    const sharerName = typeof window !== 'undefined' ? localStorage.getItem('rl_my_name') || undefined : undefined;
    setSharing(true);
    try {
      const result = await createInvitation(user.id, connection.id, connection, sharerName);
      if ('token' in result) {
        const url = getShareUrl(result.token);
        await copyToClipboard(url);
      } else {
        setShowSignInPrompt(true);
      }
    } catch {
      setShowSignInPrompt(true);
    }
    setSharing(false);
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
        <button
          onClick={handleShare}
          className="mt-3 px-6 py-2.5 rounded-full text-sm font-medium transition-all active:scale-95"
          style={{
            background: copied ? '#009483' : connection.color || '#009483',
            color: 'white',
            boxShadow: `0 4px 14px ${copied ? '#00948340' : (connection.color || '#009483')}40`,
          }}
        >
          {copied ? 'Link Copied!' : sharing ? 'Generating...' : 'Share with ' + connection.name}
        </button>
      </div>

      {/* View Toggle — only show when shared data exists */}
      {hasSharedData && (
        <div className="px-5 mb-6">
          <div className="flex rounded-xl overflow-hidden border border-black/10">
            <button
              onClick={() => setViewMode('my')}
              className="flex-1 py-2.5 text-sm font-medium transition-all"
              style={{
                background: viewMode === 'my' ? (connection.color || '#009483') : 'transparent',
                color: viewMode === 'my' ? 'white' : 'rgba(0,0,0,0.4)',
              }}
            >
              My View
            </button>
            <button
              onClick={() => setViewMode('shared')}
              className="flex-1 py-2.5 text-sm font-medium transition-all"
              style={{
                background: viewMode === 'shared' ? (connection.color || '#009483') : 'transparent',
                color: viewMode === 'shared' ? 'white' : 'rgba(0,0,0,0.4)',
              }}
            >
              Shared View
            </button>
          </div>
        </div>
      )}

      {/* ===== MY VIEW ===== */}
      {viewMode === 'my' && (
        <>
          {/* Act 1: Highlights (solo — no comparison) */}
          <div className="px-5 mb-8">
            <Highlights connection={connection} />
          </div>

          {/* Act 2: Connection Landscape */}
          <div className="px-5 mb-8">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-2xl font-extrabold uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.7)' }}>
                Connection Landscape
              </h2>
              <Link
                href={`/prototype?id=${connection.id}`}
                className="text-xs px-3 py-1 rounded-full font-medium transition-all"
                style={{ background: 'rgba(197,163,207,0.25)', color: '#9B6EAF' }}
              >
                ✦ New layout
              </Link>
            </div>
            <CategoryCards connection={connection} />
          </div>

          {/* Act 3: Comparison to My Defaults */}
          <div className="px-5 mb-8">
            <h2 className="text-2xl font-extrabold uppercase tracking-wide mb-3 px-1" style={{ color: 'rgba(0,0,0,0.7)' }}>
              Compared to My Defaults
            </h2>
            <DefaultsComparison connection={connection} />
          </div>
        </>
      )}

      {/* ===== SHARED VIEW ===== */}
      {viewMode === 'shared' && hasSharedData && (() => {
        const theirConn = supabaseResponse ? supabaseResponse.theirProfile :
          sharedComparison ? sharedComparison.theirProfile : null;
        const theirDisplayName = supabaseResponse ? supabaseResponse.responderName :
          sharedComparison ? sharedComparison.theirProfile.name : '';
        const myDisplayName = typeof window !== 'undefined' ? localStorage.getItem('rl_my_name') || connection.name : connection.name;

        return (
          <>
            {/* Highlights with comparison */}
            <div className="px-5 mb-8">
              <Highlights
                connection={connection}
                theirConnection={theirConn || undefined}
                theirName={theirDisplayName || undefined}
              />
            </div>

            {/* Connection Landscape (shared heat map) */}
            {theirConn && (
              <div className="px-5 mb-8">
                <h2 className="text-2xl font-extrabold uppercase tracking-wide mb-3 px-1" style={{ color: 'rgba(0,0,0,0.7)' }}>
                  Connection Landscape
                </h2>
                <SharedCategoryCards
                  myConnection={connection}
                  theirConnection={theirConn}
                  myName={myDisplayName}
                  theirName={theirDisplayName}
                />
              </div>
            )}
          </>
        );
      })()}

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

      {/* Sign-in prompt modal */}
      {showSignInPrompt && (
        <SignInPrompt
          onClose={() => setShowSignInPrompt(false)}
          connectionName={connection.name}
        />
      )}
    </div>
  );
}

function SignInPrompt({ onClose, connectionName }: { onClose: () => void; connectionName: string }) {
  const [email, setEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px]" onClick={onClose} />
      <div className="relative watercolor-card bg-[var(--background)] p-8 max-w-sm w-full animate-tooltip">
        <h2
          className="text-xl font-semibold text-center mb-2"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Sign in to share
        </h2>
        <p className="text-xs text-center opacity-50 mb-6">
          Sign in so {connectionName} can send their answers back to you and you&rsquo;ll be notified when they respond.
        </p>

        {!magicLinkSent ? (
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && email.includes('@')) {
                  signInWithMagicLink(email).then(() => setMagicLinkSent(true)).catch((e) => setError((e as Error).message));
                }
              }}
              placeholder="your@email.com"
              className="w-full text-center text-sm bg-transparent border-b-2 border-black/10 focus:border-black/30 outline-none pb-2 placeholder:opacity-30 transition-colors mb-3"
              autoFocus
            />
            <button
              onClick={async () => {
                if (!email.includes('@')) return;
                try {
                  await signInWithMagicLink(email);
                  setMagicLinkSent(true);
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
              disabled={!email.includes('@')}
              className="w-full py-3 rounded-2xl text-white font-medium text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-30"
              style={{ background: 'linear-gradient(135deg, var(--peach), var(--lavender))' }}
            >
              Send magic link
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm opacity-60 mb-1">Check your email</p>
            <p className="text-xs opacity-40">We sent a sign-in link to {email}</p>
            <p className="text-xs opacity-30 mt-3">Once signed in, tap Share again</p>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-500 text-center mt-3">{error}</p>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 text-xs opacity-40 hover:opacity-60 transition-opacity"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
