'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Connection, TIER_LABELS, TIER_ORDER } from '../../lib/types';
import { getConnection, deleteConnection } from '../../lib/storage';
import { DEFAULT_CATEGORIES } from '../../lib/categories';
import { analyzeConnection } from '../../lib/analysis';
import { generateShareUrl } from '../../lib/sharing';
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
    'Romantic Love': 'Romance',
    'Sex and Eros': 'Eros',
    'Sense of Humor': 'Humor',
    'Hand Buddies': 'Hand Touch',
    'Hand Holding': 'Hand Holding',
    'Sleeping Buddies': 'Co-Sleeping',
    'Dance Buddies': 'Dance',
    'Support Person': 'Support',
    'Power of Attorney': 'Legal Trust',
  };
  return map[label] || label;
}

export default function ConnectionProfile() {
  const params = useParams();
  const router = useRouter();
  const [connection, setConnection] = useState<Connection | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareInfo, setShowShareInfo] = useState(false);

  useEffect(() => {
    const c = getConnection(params.id as string);
    if (c) setConnection(c);
    else router.push('/');
  }, [params.id, router]);

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
    const url = generateShareUrl(connection);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="page-enter min-h-dvh pb-8">
      {/* Header — edit goes back, home on right */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <Link href={`/edit/${connection.id}`} className="text-sm opacity-60 hover:opacity-100 transition-opacity">
          &larr; Edit
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="text-xs px-3 py-1.5 rounded-full transition-all active:scale-95"
            style={{
              background: copied ? 'var(--sage)' : 'rgba(61,53,50,0.06)',
              color: copied ? 'white' : '#3D3532',
            }}
          >
            {copied ? 'Copied!' : 'Share'}
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
            <p>4. The app shows where you align and where you differ</p>
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
