'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Connection } from './lib/types';
import { getConnections } from './lib/storage';
import ConnectionCard from './components/ConnectionCard';
import AuthButton from './components/AuthButton';

export default function Home() {
  const [connections, setConnections] = useState<Connection[]>([]);

  useEffect(() => {
    setConnections(getConnections());
  }, []);

  return (
    <div className="min-h-dvh pb-24">
      {/* Header */}
      <div className="px-5 pt-8 pb-6">
        <h1 className="text-3xl font-semibold mb-1" style={{ fontFamily: 'Georgia, serif' }}>
          Relational Landscape
        </h1>
        <p className="text-sm opacity-50">Map the shape of your connections</p>
        <div className="mt-3">
          <AuthButton />
        </div>
      </div>

      {/* Quick links */}
      <div className="px-5 flex gap-3 mb-4">
        <Link
          href="/menu"
          className="flex-1 watercolor-card watercolor-peach p-4 text-center text-sm font-medium hover:opacity-80 transition-opacity"
        >
          My Menu
        </Link>
        <Link
          href="/patterns"
          className="flex-1 watercolor-card watercolor-lavender p-4 text-center text-sm font-medium hover:opacity-80 transition-opacity"
        >
          Patterns
        </Link>
        <Link
          href="/reference"
          className="flex-1 watercolor-card watercolor-gold p-4 text-center text-sm font-medium hover:opacity-80 transition-opacity"
        >
          Reference Map
        </Link>
      </div>

      {/* Connections list */}
      <div className="px-5">
        {connections.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg opacity-30 mb-2">No connections yet</p>
            <p className="text-sm opacity-20 mb-6">Start mapping the landscape of your relationships</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {connections.map((conn) => (
              <ConnectionCard key={conn.id} connection={conn} />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <Link
        href="/new"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, var(--peach), var(--lavender))',
          boxShadow: '0 4px 20px rgba(244, 168, 154, 0.3)',
        }}
      >
        +
      </Link>
    </div>
  );
}
