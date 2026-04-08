'use client';

import { supabase } from './client';
import { getConnections, saveConnection } from '../storage';
import type { Connection } from '../types';

// Sync localStorage connections to Supabase on first sign-in
export async function syncOnLogin(userId: string) {
  const localConnections = getConnections();
  if (localConnections.length === 0) return;

  // Check what's already in Supabase
  const { data: existing } = await supabase
    .from('connections')
    .select('id')
    .eq('user_id', userId);

  const existingIds = new Set((existing || []).map((c) => c.id));

  // Upsert local connections that don't exist in Supabase
  const toSync = localConnections.filter((c) => !existingIds.has(c.id));

  if (toSync.length === 0) return;

  const rows = toSync.map((c) => ({
    id: c.id,
    user_id: userId,
    name: c.name,
    color: c.color || c.emoji || '#C5A3CF',
    data: {
      emoji: c.emoji,
      categories: c.categories,
      timeRhythm: c.timeRhythm,
    },
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  }));

  await supabase.from('connections').upsert(rows);
}

// Push a single connection to Supabase (called after save/edit)
export async function pushConnection(userId: string, connection: Connection) {
  await supabase.from('connections').upsert({
    id: connection.id,
    user_id: userId,
    name: connection.name,
    color: connection.color || connection.emoji || '#C5A3CF',
    data: {
      emoji: connection.emoji,
      categories: connection.categories,
      timeRhythm: connection.timeRhythm,
    },
    created_at: connection.createdAt,
    updated_at: connection.updatedAt,
  });
}

// Delete a connection from Supabase
export async function deleteRemoteConnection(connectionId: string) {
  await supabase.from('connections').delete().eq('id', connectionId);
}

// Pull connections from Supabase and merge with localStorage
export async function pullConnections(userId: string) {
  const { data: remote } = await supabase
    .from('connections')
    .select('*')
    .eq('user_id', userId);

  if (!remote || remote.length === 0) return;

  const localConnections = getConnections();
  const localMap = new Map(localConnections.map((c) => [c.id, c]));

  for (const row of remote) {
    const local = localMap.get(row.id);
    const remoteUpdated = new Date(row.updated_at).getTime();
    const localUpdated = local ? new Date(local.updatedAt).getTime() : 0;

    // Remote is newer or doesn't exist locally — save to localStorage
    if (!local || remoteUpdated > localUpdated) {
      const connection: Connection = {
        id: row.id,
        name: row.name,
        emoji: (row.data as { emoji?: string })?.emoji || row.color || '#C5A3CF',
        color: row.color || '#C5A3CF',
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        categories: (row.data as { categories?: Connection['categories'] })?.categories || [],
        timeRhythm: (row.data as { timeRhythm?: Connection['timeRhythm'] })?.timeRhythm || {
          communication: [],
          inPerson: [],
          custom: [],
        },
      };
      saveConnection(connection);
    }
  }
}
