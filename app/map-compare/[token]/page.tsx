'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MENU_CATEGORIES, MenuTier } from '../../lib/menu-categories';
import { Connection, Tier } from '../../lib/types';
import Highlights from '../../components/Highlights';
import CategoryCards from '../../components/CategoryCards';
import SharedCategoryCards from '../../components/SharedCategoryCards';
import Link from 'next/link';
import { isResponseId, getMyMapComparison } from '../../lib/supabase/my-map-shares';

interface PersonData {
  name: string;
  profiles: { categoryId: string; ratings: { item: string; tier: MenuTier }[] }[];
}

interface MapCompareData {
  personA: PersonData;
  personB: PersonData;
}

function toConnection(data: PersonData): Connection {
  return {
    id: `map-${data.name}`,
    name: data.name,
    emoji: '',
    color: '#C5A3CF',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    categories: data.profiles.map((p) => ({
      categoryId: p.categoryId,
      ratings: p.ratings.map((r) => ({ subcategory: r.item, tier: r.tier as Tier })),
    })),
    timeRhythm: { communication: [], inPerson: [], custom: [] },
  };
}

// Ensure both connections have the same category set (union of both)
function alignConnections(connA: Connection, connB: Connection): [Connection, Connection] {
  const allCatIds = new Set([
    ...connA.categories.map((c) => c.categoryId),
    ...connB.categories.map((c) => c.categoryId),
  ]);

  const pad = (conn: Connection) => ({
    ...conn,
    categories: [...allCatIds].map((catId) => {
      const existing = conn.categories.find((c) => c.categoryId === catId);
      return existing ?? { categoryId: catId, ratings: [] };
    }),
  });

  return [pad(connA), pad(connB)];
}

export default function MapComparePage() {
  const params = useParams();
  const token = params.token as string;
  const [viewMode, setViewMode] = useState<'shared' | 'my'>('shared');
  const [data, setData] = useState<MapCompareData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (isResponseId(token)) {
        // Supabase response UUID — load both sides from DB
        const result = await getMyMapComparison(token);
        if (result) {
          setData({
            personA: { name: result.personA.name, profiles: result.personA.profiles.map((p) => ({
              categoryId: p.categoryId,
              ratings: p.ratings.map((r) => ({ item: r.item, tier: r.tier as MenuTier })),
            })) },
            personB: { name: result.personB.name, profiles: result.personB.profiles.map((p) => ({
              categoryId: p.categoryId,
              ratings: p.ratings.map((r) => ({ item: r.item, tier: r.tier as MenuTier })),
            })) },
          });
        }
      } else {
        // Legacy URL-encoded base64
        try {
          const padded = token.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice(0, (4 - token.length % 4) % 4);
          setData(JSON.parse(decodeURIComponent(atob(padded))));
        } catch { /* data stays null */ }
      }
      setLoading(false);
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--lavender)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-8">
        <p className="text-lg opacity-40">Invalid link</p>
      </div>
    );
  }

  // Person B is "me" (just filled in), Person A is "them"
  const rawMe = toConnection(data.personB);
  const rawThem = toConnection(data.personA);
  const [myConn, theirConn] = alignConnections(rawMe, rawThem);

  return (
    <div className="page-enter min-h-dvh pb-8">
      <div className="px-5 pt-5 pb-3">
        <Link href="/" className="text-sm opacity-60 hover:opacity-100 transition-opacity">
          &larr; Home
        </Link>
      </div>

      <div className="px-5 pt-2 pb-4 text-center">
        <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: 'Georgia, serif' }}>
          {data.personA.name} &amp; {data.personB.name}
        </h1>
        <p className="text-sm opacity-50">Your maps side by side</p>
      </div>

      {/* My View / Shared View toggle */}
      <div className="px-5 mb-6">
        <div className="flex rounded-2xl p-1" style={{ background: 'rgba(0,0,0,0.05)' }}>
          {(['shared', 'my'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: viewMode === mode ? 'white' : 'transparent',
                color: viewMode === mode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.4)',
                boxShadow: viewMode === mode ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {mode === 'shared' ? 'Shared View' : 'My View'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-3">
        {viewMode === 'shared' ? (
          <>
            <Highlights connection={myConn} theirConnection={theirConn} theirName={data.personA.name} />
            <SharedCategoryCards
              myConnection={myConn}
              theirConnection={theirConn}
              myName={data.personB.name}
              theirName={data.personA.name}
            />
          </>
        ) : (
          <>
            <Highlights connection={myConn} />
            <CategoryCards connection={myConn} />
          </>
        )}
      </div>
    </div>
  );
}
