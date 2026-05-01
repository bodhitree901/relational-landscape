'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Connection } from '../lib/types';
import { getConnections, getConnection } from '../lib/storage';
import CategoryCardsPath from '../components/CategoryCardsPath';
import Link from 'next/link';
import { Suspense } from 'react';

function PrototypeInner() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');

  const [connections, setConnections] = useState<Connection[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const all = getConnections();
    setConnections(all);
    if (idParam) {
      setSelected(idParam);
    } else if (all.length > 0) {
      setSelected(all[0].id);
    }
  }, [idParam]);

  const connection = selected ? (getConnection(selected) || connections.find((c) => c.id === selected) || null) : null;

  return (
    <div className="min-h-dvh pb-16">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <Link href={connection ? `/connection/${connection.id}` : '/'} className="text-sm opacity-60 hover:opacity-100 transition-opacity">
          &larr; Back
        </Link>
        <span
          className="text-xs px-3 py-1 rounded-full font-medium"
          style={{ background: 'rgba(197,163,207,0.25)', color: '#9B6EAF' }}
        >
          ✦ Prototype
        </span>
      </div>

      {connections.length > 1 && (
        <div className="px-5 mb-4 flex gap-2 overflow-x-auto pb-1">
          {connections.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
              style={{
                background: selected === c.id ? (c.color || '#C5A3CF') : 'rgba(0,0,0,0.06)',
                color: selected === c.id ? 'white' : 'rgba(0,0,0,0.5)',
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {connection ? (
        <>
          <div className="px-5 pt-2 pb-6 text-center">
            <h1 className="text-2xl font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
              {connection.name}
            </h1>
            <p className="text-xs opacity-40 mt-1">Connection Landscape — path view</p>
          </div>
          <CategoryCardsPath myConnection={connection} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
          <p className="text-lg opacity-30">No connections yet</p>
          <p className="text-sm opacity-20 mt-2">Add a connection from the home screen to preview this layout</p>
        </div>
      )}
    </div>
  );
}

export default function PrototypePage() {
  return (
    <Suspense>
      <PrototypeInner />
    </Suspense>
  );
}
