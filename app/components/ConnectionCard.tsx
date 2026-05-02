'use client';

import Link from 'next/link';
import { Connection } from '../lib/types';
import { ConnectionCircle } from './ColorPicker';

export default function ConnectionCard({ connection, onDelete, badgeText }: { connection: Connection; onDelete?: () => void; badgeText?: string }) {
  const color = connection.color || connection.emoji || '#C5A3CF';
  const totalRatings = connection.categories.flatMap((c) => c.ratings).length;
  const created = new Date(connection.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });

  return (
    <div
      className="watercolor-card bg-white/60 hover:bg-white/80 transition-all relative"
      style={{ boxShadow: `0 4px 18px ${color}45, inset 0 -2px 6px ${color}20` }}
    >
      <Link
        href={`/connection/${connection.id}`}
        className="block px-5 py-4 pr-14"
      >
        <div className="flex items-center gap-3">
          <ConnectionCircle color={color} size={36} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold">{connection.name}</h3>
              {badgeText && (
                <span className="text-[10px] px-2 py-0.5 rounded-full text-white font-medium animate-pulse shrink-0" style={{ background: '#009483' }}>
                  {badgeText}
                </span>
              )}
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(0,0,0,0.35)' }}>
              {totalRatings > 0 ? `${totalRatings} dimensions · ` : ''}{created}
            </p>
          </div>
        </div>
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
