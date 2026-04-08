'use client';

import Link from 'next/link';
import { Connection, Tier } from '../lib/types';
import { ConnectionCircle } from './ColorPicker';

function getTopItems(connection: Connection): { label: string; tier: Tier }[] {
  return connection.categories
    .flatMap((c) => c.ratings)
    .filter((r) => r.tier === 'core' || r.tier === 'rhythm')
    .slice(0, 5)
    .map((r) => ({ label: r.subcategory, tier: r.tier }));
}

export default function ConnectionCard({ connection }: { connection: Connection }) {
  const topItems = getTopItems(connection);
  const color = connection.color || connection.emoji || '#C5A3CF';

  return (
    <div className="watercolor-card bg-white/60 hover:bg-white/80 transition-all relative">
      <Link
        href={`/connection/${connection.id}`}
        className="block p-5 pr-14"
      >
        <div className="flex items-center gap-3 mb-3">
          <ConnectionCircle color={color} size={36} />
          <h3 className="text-lg font-semibold">{connection.name}</h3>
        </div>
        {topItems.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {topItems.map((item) => (
              <span
                key={item.label}
                className="text-xs px-2.5 py-1 rounded-full"
                style={{
                  background: item.tier === 'core' ? 'rgba(244,168,154,0.2)' : 'rgba(197,163,207,0.2)',
                }}
              >
                {item.label}
              </span>
            ))}
            {connection.categories.flatMap((c) => c.ratings).length > 5 && (
              <span className="text-xs px-2.5 py-1 rounded-full opacity-40">
                +{connection.categories.flatMap((c) => c.ratings).length - 5} more
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm opacity-40">Tap to view</p>
        )}
      </Link>

      {/* Edit button */}
      <Link
        href={`/edit/${connection.id}`}
        className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center opacity-30 hover:opacity-60 transition-opacity"
        style={{ background: `${color}20` }}
        title="Edit"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 2.5l3 3M1.5 9.5l-0.5 3.5 3.5-0.5 7.5-7.5-3-3-7.5 7.5z" />
        </svg>
      </Link>
    </div>
  );
}
