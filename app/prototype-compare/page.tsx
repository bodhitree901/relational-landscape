'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Connection } from '../lib/types';
import { getConnections, getConnection } from '../lib/storage';
import ComparisonSummaryProto from '../components/ComparisonSummaryProto';
import Link from 'next/link';

function ProtoCompareInner() {
  const searchParams = useSearchParams();
  const aParam = searchParams.get('a');
  const bParam = searchParams.get('b');

  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedA, setSelectedA] = useState<string | null>(null);
  const [selectedB, setSelectedB] = useState<string | null>(null);
  const [myName, setMyName] = useState('Me');

  useEffect(() => {
    const all = getConnections();
    setConnections(all);
    const name = localStorage.getItem('rl_my_name') || 'Me';
    setMyName(name);

    if (aParam) setSelectedA(aParam);
    else if (all.length > 0) setSelectedA(all[0].id);

    if (bParam) setSelectedB(bParam);
    else if (all.length > 1) setSelectedB(all[1].id);
  }, [aParam, bParam]);

  const connA = selectedA ? (getConnection(selectedA) || connections.find((c) => c.id === selectedA) || null) : null;
  const connB = selectedB ? (getConnection(selectedB) || connections.find((c) => c.id === selectedB) || null) : null;

  return (
    <div className="min-h-dvh pb-16">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <Link href="/" className="text-sm opacity-60 hover:opacity-100 transition-opacity">
          &larr; Back
        </Link>
        <span
          className="text-xs px-3 py-1 rounded-full font-medium"
          style={{ background: 'rgba(197,163,207,0.25)', color: '#9B6EAF' }}
        >
          ✦ Prototype
        </span>
      </div>

      {/* Connection pickers */}
      {connections.length >= 2 && (
        <div className="px-5 mb-5 space-y-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: 'rgba(0,0,0,0.3)' }}>
              You are
            </p>
            <div className="flex gap-2 flex-wrap">
              {connections.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedA(c.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
                  style={{
                    background: selectedA === c.id ? (c.color || '#C5A3CF') : 'rgba(0,0,0,0.06)',
                    color: selectedA === c.id ? 'white' : 'rgba(0,0,0,0.5)',
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: 'rgba(0,0,0,0.3)' }}>
              Compared with
            </p>
            <div className="flex gap-2 flex-wrap">
              {connections.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedB(c.id)}
                  disabled={selectedA === c.id}
                  className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all disabled:opacity-30"
                  style={{
                    background: selectedB === c.id ? (c.color || '#89CFF0') : 'rgba(0,0,0,0.06)',
                    color: selectedB === c.id ? 'white' : 'rgba(0,0,0,0.5)',
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Title */}
      {connA && connB && (
        <div className="px-5 pt-1 pb-5 text-center">
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
            {connA.name} &amp; {connB.name}
          </h1>
          <p className="text-xs opacity-40 mt-1">Connection Summary — prototype</p>
        </div>
      )}

      {/* Summary */}
      {connA && connB ? (
        <ComparisonSummaryProto
          myConnection={connA}
          theirConnection={connB}
          myName={connA.name}
          theirName={connB.name}
        />
      ) : connections.length < 2 ? (
        <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
          <p className="text-lg opacity-30">Need at least 2 connections</p>
          <p className="text-sm opacity-20 mt-2">Add connections from the home screen to preview this layout</p>
        </div>
      ) : null}
    </div>
  );
}

export default function ProtoComparePage() {
  return (
    <Suspense>
      <ProtoCompareInner />
    </Suspense>
  );
}
