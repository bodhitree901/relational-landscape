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
  connections: { name: string; color: string; tier: Tier }[];
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
          name: conn.name,
          color: conn.color || conn.emoji || '#C5A3CF',
          tier: rating.tier,
        });
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => b.connections.length - a.connections.length);
}

interface ClusterGroup {
  label: string;
  connections: Connection[];
}

function clusterConnections(connections: Connection[]): ClusterGroup[] {
  // Simple clustering: group by their most dominant category
  const groups = new Map<string, Connection[]>();

  for (const conn of connections) {
    // Find the category with the most core/rhythm items
    let bestCat = 'uncategorized';
    let bestScore = 0;

    for (const cat of conn.categories) {
      const score = cat.ratings.reduce((sum, r) => {
        if (r.tier === 'core') return sum + 3;
        if (r.tier === 'rhythm') return sum + 2;
        if (r.tier === 'sometimes') return sum + 1;
        return sum;
      }, 0);
      if (score > bestScore) {
        bestScore = score;
        bestCat = cat.categoryId;
      }
    }

    if (!groups.has(bestCat)) groups.set(bestCat, []);
    groups.get(bestCat)!.push(conn);
  }

  return Array.from(groups.entries()).map(([catId, conns]) => {
    const catDef = DEFAULT_CATEGORIES.find((c) => c.id === catId);
    return {
      label: catDef?.name || 'Other',
      connections: conns,
    };
  });
}

export default function PatternsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);

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
  const clusters = clusterConnections(connections);

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

      {/* Most common subcategories */}
      <div className="mx-5 watercolor-card bg-white/50 p-5 mb-6">
        <h2 className="text-sm font-medium opacity-50 mb-4 uppercase tracking-wide">
          Most Common Threads
        </h2>
        <div className="space-y-3">
          {subcategoryCounts.slice(0, 10).map((item) => {
            const catDef = DEFAULT_CATEGORIES.find((c) => c.id === item.categoryId);
            return (
              <div key={item.subcategory}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{item.subcategory}</span>
                  <span className="text-xs opacity-40">{item.connections.length} connection{item.connections.length !== 1 ? 's' : ''}</span>
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

      {/* Connection clusters */}
      <div className="mx-5 mb-6">
        <h2 className="text-sm font-medium opacity-50 mb-4 uppercase tracking-wide px-1">
          Connection Clusters
        </h2>
        <div className="space-y-3">
          {clusters.map((cluster) => {
            const catDef = DEFAULT_CATEGORIES.find((c) => c.name === cluster.label);
            return (
              <div
                key={cluster.label}
                className={`watercolor-card p-4 ${catDef?.watercolorClass || ''}`}
              >
                <p className="text-sm font-medium mb-2" style={{ color: catDef?.color }}>
                  {cluster.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {cluster.connections.map((conn) => (
                    <Link
                      key={conn.id}
                      href={`/connection/${conn.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/50 text-sm hover:bg-white/80 transition-colors"
                    >
                      <ConnectionCircle color={conn.color || conn.emoji || '#C5A3CF'} size={18} />
                      <span>{conn.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
