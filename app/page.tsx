'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Connection } from './lib/types';
import { getConnections, deleteConnection } from './lib/storage';
import ConnectionCard from './components/ConnectionCard';
import AuthButton from './components/AuthButton';
import { useAuth } from './components/AuthProvider';
import { getMyResponses, subscribeToResponses } from './lib/supabase/invitations';
import { getMyMapResponses, subscribeToMyMapResponses } from './lib/supabase/my-map-shares';

const SEEN_KEY = 'rl_seen_responses';
const SEEN_MAP_KEY = 'rl_seen_map_responses';

function getSeenSet(key: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  const data = localStorage.getItem(key);
  return data ? new Set(JSON.parse(data)) : new Set();
}

function markSeen(key: string, id: string) {
  const seen = getSeenSet(key);
  seen.add(id);
  localStorage.setItem(key, JSON.stringify([...seen]));
}

export default function Home() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [newResponses, setNewResponses] = useState<Map<string, string>>(new Map());
  const [myMapResponses, setMyMapResponses] = useState<{ id: string; responder_name: string; created_at: string; isNew: boolean }[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    setConnections(getConnections());
  }, []);

  // Check for new connection responses
  useEffect(() => {
    if (!user) return;
    getMyResponses(user.id).then((invitations) => {
      const seen = getSeenSet(SEEN_KEY);
      const badge = new Map<string, string>();
      for (const inv of invitations) {
        if (inv.connection_id && inv.responses?.length > 0) {
          const resp = inv.responses[0];
          if (!seen.has(inv.connection_id)) {
            badge.set(inv.connection_id, resp.responder_name);
          }
        }
      }
      setNewResponses(badge);
    });
  }, [user]);

  // Check for new My Map responses
  useEffect(() => {
    if (!user) return;
    const seen = getSeenSet(SEEN_MAP_KEY);
    getMyMapResponses(user.id).then((shares) => {
      const all: { id: string; responder_name: string; created_at: string; isNew: boolean }[] = [];
      for (const share of shares) {
        for (const resp of share.my_map_responses || []) {
          all.push({ ...resp, isNew: !seen.has(resp.id) });
        }
      }
      all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setMyMapResponses(all);
    });
  }, [user]);

  // Real-time: connection responses
  useEffect(() => {
    if (!user) return;
    // Subscribe to all connections
    const subs = connections.map((c) =>
      subscribeToResponses(user.id, c.id, () => {
        showToast(`Someone responded to your ${c.name} map!`);
        setNewResponses((prev) => new Map(prev).set(c.id, 'New response'));
      })
    );
    return () => subs.forEach((s) => s.unsubscribe());
  }, [user, connections]);

  // Real-time: My Map responses
  useEffect(() => {
    if (!user) return;
    const sub = subscribeToMyMapResponses(user.id, (responderName, responseId) => {
      showToast(`${responderName} responded to your My Map! 🗺️`);
      setMyMapResponses((prev) => [
        { id: responseId, responder_name: responderName, created_at: new Date().toISOString(), isNew: true },
        ...prev,
      ]);
    });
    return () => sub.unsubscribe();
  }, [user]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4500);
  }

  return (
    <div className="min-h-dvh pb-24">
      {/* Toast notification */}
      {toast && (
        <div
          className="fixed top-4 left-4 right-4 z-50 px-4 py-3 rounded-2xl text-white text-sm font-medium shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #009483, #81CC73)',
            animation: 'tooltip-enter 0.3s ease-out',
          }}
          onClick={() => setToast(null)}
        >
          {toast}
        </div>
      )}

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
          className="flex-1 watercolor-card p-6 text-center text-base font-semibold hover:opacity-80 transition-opacity"
          style={{ background: 'linear-gradient(135deg, rgba(244,168,154,0.55), rgba(244,168,154,0.35))', boxShadow: '0 4px 18px rgba(244,168,154,0.45), inset 0 -2px 6px rgba(244,168,154,0.3)' }}
        >
          My Map
        </Link>
        <Link
          href="/patterns"
          className="flex-1 watercolor-card p-6 text-center text-base font-semibold hover:opacity-80 transition-opacity"
          style={{ background: 'linear-gradient(135deg, rgba(197,163,207,0.55), rgba(197,163,207,0.35))', boxShadow: '0 4px 18px rgba(197,163,207,0.45), inset 0 -2px 6px rgba(197,163,207,0.3)' }}
        >
          Patterns
        </Link>
      </div>

      {/* My Map responses banner — only when there are unseen ones */}
      {myMapResponses.some(r => r.isNew) && (
        <div className="px-5 mb-4">
          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{
              background: 'linear-gradient(135deg, #80C9C1, #C5A3CF)',
              boxShadow: '0 4px 18px rgba(128,201,193,0.4)',
              border: '2px solid rgba(255,255,255,0.4)',
            }}
          >
            <span className="text-2xl">🗺️</span>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: 'rgba(0,0,0,0.75)' }}>
                {myMapResponses.filter(r => r.isNew).length} new My Map {myMapResponses.filter(r => r.isNew).length === 1 ? 'response' : 'responses'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(0,0,0,0.45)' }}>
                Scroll down to view
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Connections list — includes My Map responses as cards */}
      <div className="px-5">
        {connections.length === 0 && myMapResponses.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg opacity-30 mb-2">No connections yet</p>
            <p className="text-sm opacity-20 mb-6">Start mapping the landscape of your relationships</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {/* My Map responses — shown as cards in the list */}
            {myMapResponses.map((resp) => {
              const gradient = 'linear-gradient(135deg, #80C9C1, #C5A3CF)';
              return (
                <Link
                  key={resp.id}
                  href={`/map-compare/${resp.id}`}
                  onClick={() => markSeen(SEEN_MAP_KEY, resp.id)}
                  className="block watercolor-card bg-white/60 hover:bg-white/80 transition-all p-5"
                  style={{ boxShadow: '0 4px 18px rgba(0,148,131,0.25), inset 0 -2px 6px rgba(0,148,131,0.1)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{
                        background: gradient,
                        boxShadow: '0 2px 8px rgba(0,148,131,0.3)',
                        border: '2px solid rgba(255,255,255,0.5)',
                      }}
                    >
                      {resp.responder_name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold truncate">{resp.responder_name}</h3>
                        <span
                          className="text-[9px] px-2 py-0.5 rounded-full text-white font-medium shrink-0"
                          style={{ background: '#009483' }}
                        >
                          My Map
                        </span>
                        {resp.isNew && (
                          <span
                            className="text-[9px] px-2 py-0.5 rounded-full text-white font-medium shrink-0 animate-pulse"
                            style={{ background: '#C5A3CF' }}
                          >
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-xs opacity-40 mt-0.5">
                        Responded · {new Date(resp.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs opacity-30">View →</span>
                  </div>
                </Link>
              );
            })}

            {/* Regular connections */}
            {connections.map((conn) => (
              <ConnectionCard
                key={conn.id}
                connection={conn}
                badgeText={newResponses.has(conn.id) ? `${newResponses.get(conn.id)} responded!` : undefined}
                onDelete={() => {
                  if (confirm(`Delete ${conn.name}?`)) {
                    deleteConnection(conn.id);
                    setConnections(getConnections());
                  }
                }}
              />
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
