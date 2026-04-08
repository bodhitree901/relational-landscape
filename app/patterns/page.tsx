'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Connection, Tier } from '../lib/types';
import { getConnections } from '../lib/storage';
import { DEFAULT_CATEGORIES } from '../lib/categories';
import { ConnectionCircle } from '../components/ColorPicker';

interface SubcategoryCount {
  subcategory: string;
  categoryId: string;
  connections: { id: string; name: string; color: string; tier: Tier }[];
}

function getSubcategoryCounts(connections: Connection[]): SubcategoryCount[] {
  const map = new Map<string, SubcategoryCount>();

  for (const conn of connections) {
    for (const cat of conn.categories) {
      for (const rating of cat.ratings) {
        const key = rating.subcategory;
        if (!map.has(key)) {
          map.set(key, { subcategory: key, categoryId: cat.categoryId, connections: [] });
        }
        map.get(key)!.connections.push({
          id: conn.id,
          name: conn.name,
          color: conn.color || conn.emoji || '#C5A3CF',
          tier: rating.tier,
        });
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => b.connections.length - a.connections.length);
}

// Find pairs/groups of connections that share multiple subcategories within a category
interface OverlapCluster {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  connections: { id: string; name: string; color: string }[];
  sharedSubs: string[];
}

function findOverlapClusters(connections: Connection[]): OverlapCluster[] {
  const clusters: OverlapCluster[] = [];

  for (const cat of DEFAULT_CATEGORIES) {
    // Build a map: connection id -> set of subcategories in this category
    const connSubs = new Map<string, { conn: Connection; subs: Set<string> }>();

    for (const conn of connections) {
      const catRatings = conn.categories.find((c) => c.categoryId === cat.id);
      if (catRatings && catRatings.ratings.length > 0) {
        connSubs.set(conn.id, {
          conn,
          subs: new Set(catRatings.ratings.map((r) => r.subcategory)),
        });
      }
    }

    // Find all pairs with 2+ shared subcategories
    const entries = Array.from(connSubs.entries());
    const pairsSeen = new Set<string>();

    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const [idA, a] = entries[i];
        const [idB, b] = entries[j];
        const shared = [...a.subs].filter((s) => b.subs.has(s));

        if (shared.length >= 2) {
          const pairKey = [idA, idB].sort().join('-');
          if (!pairsSeen.has(pairKey)) {
            pairsSeen.add(pairKey);
            clusters.push({
              categoryId: cat.id,
              categoryName: cat.name,
              categoryColor: cat.color,
              connections: [
                { id: a.conn.id, name: a.conn.name, color: a.conn.color || a.conn.emoji || '#C5A3CF' },
                { id: b.conn.id, name: b.conn.name, color: b.conn.color || b.conn.emoji || '#C5A3CF' },
              ],
              sharedSubs: shared,
            });
          }
        }
      }
    }
  }

  // Sort by most shared subcategories
  return clusters.sort((a, b) => b.sharedSubs.length - a.sharedSubs.length);
}

// Meta summary of how you relate across all connections
function generateMetaSummary(connections: Connection[]): string {
  if (connections.length === 0) return '';

  const allRatings = connections.flatMap((c) => c.categories.flatMap((cat) => cat.ratings));
  const coreCount = allRatings.filter((r) => r.tier === 'core').length;
  const rhythmCount = allRatings.filter((r) => r.tier === 'rhythm').length;

  // What categories show up most across core/rhythm
  const catPresence = new Map<string, number>();
  for (const conn of connections) {
    for (const cat of conn.categories) {
      const coreRhythm = cat.ratings.filter((r) => r.tier === 'core' || r.tier === 'rhythm');
      if (coreRhythm.length > 0) {
        catPresence.set(cat.categoryId, (catPresence.get(cat.categoryId) || 0) + 1);
      }
    }
  }

  const topCats = [...catPresence.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => {
      const cat = DEFAULT_CATEGORIES.find((c) => c.id === id);
      return cat?.name || id;
    });

  // Most common core subcategories
  const coreSubs = new Map<string, number>();
  for (const conn of connections) {
    for (const cat of conn.categories) {
      for (const r of cat.ratings) {
        if (r.tier === 'core') {
          coreSubs.set(r.subcategory, (coreSubs.get(r.subcategory) || 0) + 1);
        }
      }
    }
  }

  const topCoreSubs = [...coreSubs.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([sub]) => sub);

  // How many categories does the average connection span?
  const avgCats = connections.reduce((sum, conn) => {
    return sum + conn.categories.filter((c) => c.ratings.length > 0).length;
  }, 0) / connections.length;

  const paragraphs: string[] = [];

  if (topCats.length > 0) {
    paragraphs.push(
      `Across your ${connections.length} connection${connections.length > 1 ? 's' : ''}, the areas that show up most are ${topCats.join(', ')}. These seem to be the dimensions where your relational world is richest.`
    );
  }

  if (topCoreSubs.length > 0) {
    paragraphs.push(
      `The threads you most often name as core are ${topCoreSubs.join(', ')} — these may be the things you seek or naturally cultivate in your closest relationships.`
    );
  }

  if (avgCats >= 4) {
    paragraphs.push(
      `Your connections tend to be multi-dimensional — spanning ${Math.round(avgCats)} categories on average. You seem to build relationships that touch many aspects of life, not just one.`
    );
  } else if (avgCats <= 2) {
    paragraphs.push(
      `Your connections tend to be focused — averaging about ${Math.round(avgCats)} ${Math.round(avgCats) === 1 ? 'category' : 'categories'} each. There's a clarity in that — you seem to know what each relationship is about.`
    );
  }

  if (coreCount > rhythmCount * 2) {
    paragraphs.push(
      `You tend to name things as core more than rhythm — you seem drawn to intensity and clarity about what matters, rather than a slow-burn approach.`
    );
  } else if (rhythmCount > coreCount * 2) {
    paragraphs.push(
      `You lean more toward rhythm than core — you seem to value the steady presence of things over dramatic declarations. Consistency is your love language.`
    );
  }

  return paragraphs.join(' ');
}

export default function PatternsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [expandedSub, setExpandedSub] = useState<string | null>(null);

  useEffect(() => {
    setConnections(getConnections());
  }, []);

  if (connections.length === 0) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-8">
        <p className="text-lg opacity-40 mb-4">No connections yet</p>
        <Link
          href="/new"
          className="px-6 py-3 rounded-2xl text-white font-medium"
          style={{ background: 'var(--peach)' }}
        >
          Create your first connection
        </Link>
      </div>
    );
  }

  const subcategoryCounts = getSubcategoryCounts(connections);
  const overlapClusters = findOverlapClusters(connections);
  const metaSummary = generateMetaSummary(connections);

  // Category presence across connections
  const categoryPresence = DEFAULT_CATEGORIES.map((cat) => {
    const count = connections.filter((conn) =>
      conn.categories.some((c) => c.categoryId === cat.id && c.ratings.length > 0)
    ).length;
    return { ...cat, count, percentage: Math.round((count / connections.length) * 100) };
  }).sort((a, b) => b.count - a.count);

  return (
    <div className="page-enter min-h-dvh pb-8">
      <div className="px-5 pt-5 pb-3">
        <Link href="/" className="text-sm opacity-60 hover:opacity-100 transition-opacity">
          &larr; Home
        </Link>
      </div>

      <div className="px-5 pt-2 pb-6">
        <h1 className="text-2xl font-semibold mb-1">Patterns</h1>
        <p className="text-sm opacity-50">Across {connections.length} connection{connections.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Meta summary */}
      {metaSummary && (
        <div className="mx-5 watercolor-card watercolor-lavender p-5 mb-6">
          <h2 className="text-sm font-medium opacity-50 mb-3 uppercase tracking-wide">
            How You Relate
          </h2>
          <p className="text-sm leading-relaxed opacity-70">{metaSummary}</p>
        </div>
      )}

      {/* Most common subcategories — tap to expand */}
      <div className="mx-5 watercolor-card bg-white/50 p-5 mb-6">
        <h2 className="text-sm font-medium opacity-50 mb-4 uppercase tracking-wide">
          Most Common Threads
        </h2>
        <div className="space-y-3">
          {subcategoryCounts.slice(0, 12).map((item) => {
            const catDef = DEFAULT_CATEGORIES.find((c) => c.id === item.categoryId);
            const isExpanded = expandedSub === item.subcategory;
            return (
              <div key={item.subcategory}>
                <button
                  onClick={() => setExpandedSub(isExpanded ? null : item.subcategory)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.subcategory}</span>
                    <span className="text-xs opacity-40">
                      {item.connections.length} connection{item.connections.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <div className="flex-1 h-2 rounded-full bg-black/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(item.connections.length / connections.length) * 100}%`,
                          background: catDef?.color || '#ccc',
                        }}
                      />
                    </div>
                    <div className="flex -space-x-1.5 ml-2">
                      {item.connections.slice(0, 4).map((c, i) => (
                        <div key={i} title={c.name}>
                          <ConnectionCircle color={c.color} size={16} />
                        </div>
                      ))}
                      {item.connections.length > 4 && (
                        <span className="text-xs opacity-40 ml-1">+{item.connections.length - 4}</span>
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded: show who */}
                {isExpanded && (
                  <div className="mt-2 ml-1 flex flex-wrap gap-2 animate-tooltip">
                    {item.connections.map((c) => (
                      <Link
                        key={c.id}
                        href={`/connection/${c.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 text-xs hover:bg-white/90 transition-colors border border-black/5"
                      >
                        <ConnectionCircle color={c.color} size={14} />
                        <span>{c.name}</span>
                        <span className="opacity-30 text-[10px]">
                          {c.tier === 'core' ? '●●●' : c.tier === 'rhythm' ? '●●' : c.tier === 'sometimes' ? '●' : '○'}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Category presence */}
      <div className="mx-5 watercolor-card bg-white/50 p-5 mb-6">
        <h2 className="text-sm font-medium opacity-50 mb-4 uppercase tracking-wide">
          Category Presence
        </h2>
        <div className="space-y-3">
          {categoryPresence.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: cat.color }}
              />
              <span className="text-sm flex-1">{cat.name}</span>
              <span className="text-xs opacity-40">{cat.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Overlap clusters — who shares multiple subcategories in a category */}
      {overlapClusters.length > 0 && (
        <div className="mx-5 mb-6">
          <h2 className="text-sm font-medium opacity-50 mb-4 uppercase tracking-wide px-1">
            Shared Dimensions
          </h2>
          <div className="space-y-3">
            {overlapClusters.map((cluster, idx) => {
              const catDef = DEFAULT_CATEGORIES.find((c) => c.id === cluster.categoryId);
              return (
                <div
                  key={idx}
                  className={`watercolor-card p-4 ${catDef?.watercolorClass || ''}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {cluster.connections.map((conn) => (
                      <Link
                        key={conn.id}
                        href={`/connection/${conn.id}`}
                        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                      >
                        <ConnectionCircle color={conn.color} size={20} />
                        <span className="text-sm font-medium">{conn.name}</span>
                      </Link>
                    ))}
                  </div>
                  <p className="text-xs opacity-40 mb-2">
                    share {cluster.sharedSubs.length} in {cluster.categoryName}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {cluster.sharedSubs.map((sub) => (
                      <span
                        key={sub}
                        className="text-xs px-2.5 py-1 rounded-full"
                        style={{ background: `${cluster.categoryColor}20` }}
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
