'use client';

import Link from 'next/link';
import { Connection, Tier } from '../lib/types';
import { ConnectionCircle } from './ColorPicker';

function getTopItems(connection: Connection): { label: string; tier: Tier }[] {
  return connection.categories
    .flatMap((c) => c.ratings)
    .filter((r) => r.tier === 'must-have' || r.tier === 'open')
    .slice(0, 5)
    .map((r) => ({ label: r.subcategory, tier: r.tier }));
}

export default function ConnectionCard({ connection, onDelete, badgeText }: { connection: Connection; onDelete?: () => void; badgeText?: string }) {
  const topItems = getTopItems(connection);
  const color = connection.color || connection.emoji || '#C5A3CF';

  return (
    <div
      className="watercolor-card bg-white/60 hover:bg-white/80 transition-all relative"
      style={{ boxShadow: `0 4px 18px ${color}45, inset 0 -2px 6px ${color}20` }}
    >
      <Link
        href={`/connection/${connection.id}`}
        className="block p-5 pr-14"
      >
        <div className="flex items-center gap-3 mb-3">
          <ConnectionCircle color={color} size={36} />
          <h3 className="text-lg font-semibold">{connection.name}</h3>
          {badgeText && (
            <span className="text-[10px] px-2 py-0.5 rounded-full text-white font-medium animate-pulse" style={{ background: '#009483' }}>
              {badgeText}
            </span>
          )}
        </div>
        {topItems.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {topItems.map((item) => (
              <span
                key={item.label}
                className="text-xs px-2.5 py-1 rounded-full"
                style={{
                  background: item.tier === 'must-have' ? 'rgba(232,131,138,0.2)' : 'rgba(137,207,240,0.2)',
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

      {/* Edit & Delete buttons */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Link
          href={`/edit/${connection.id}`}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-90"
          style={{ border: '1.5px solid rgba(137,207,240,0.7)', color: '#5BA8CC' }}
          title="Edit"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.5 2.5l3 3M1.5 9.5l-0.5 3.5 3.5-0.5 7.5-7.5-3-3-7.5 7.5z" />
          </svg>
        </Link>
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-90"
            style={{ border: '1.5px solid rgba(210,70,70,0.55)', color: '#C84040' }}
            title="Delete"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
