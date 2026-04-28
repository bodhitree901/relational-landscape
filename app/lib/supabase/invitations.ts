'use client';

import { supabase } from './client';
import { Connection } from '../types';
import type { ProfileSnapshot } from './types';

function connectionToSnapshot(connection: Connection): ProfileSnapshot {
  return {
    name: connection.name,
    color: connection.color || connection.emoji || '#C5A3CF',
    emoji: connection.emoji,
    categories: connection.categories,
    timeRhythm: connection.timeRhythm,
  };
}

export function snapshotToConnection(snapshot: ProfileSnapshot, id?: string): Connection {
  return {
    id: id || crypto.randomUUID(),
    name: snapshot.name,
    emoji: snapshot.emoji,
    color: snapshot.color,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    categories: snapshot.categories.map((c) => ({
      categoryId: c.categoryId,
      ratings: c.ratings.map((r) => ({
        subcategory: r.subcategory,
        tier: r.tier as 'must-have' | 'open' | 'maybe' | 'off-limits',
      })),
    })),
    timeRhythm: snapshot.timeRhythm,
  };
}

function generateToken(): string {
  // 8-char alphanumeric token
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789'; // no confusing chars (0, o, l, 1)
  let token = '';
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  for (const byte of array) {
    token += chars[byte % chars.length];
  }
  return token;
}

// Person A creates an invitation
export async function createInvitation(
  userId: string,
  connectionId: string,
  connection: Connection,
  sharerName?: string
): Promise<{ token: string } | { error: string }> {
  const token = generateToken();
  const snapshot = connectionToSnapshot(connection);
  // Use sharer's name so Person B sees who sent this
  // Store the connection target name separately
  snapshot.connectionName = connection.name;
  if (sharerName) {
    snapshot.name = sharerName;
  }

  const { error } = await supabase.from('invitations').insert({
    token,
    user_id: userId,
    connection_id: connectionId,
    profile_snapshot: snapshot as unknown as Record<string, unknown>,
  });

  if (error) return { error: error.message };
  return { token };
}

// Anyone can fetch an invitation by token (for the /share/[token] page)
export async function getInvitationByToken(token: string) {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .single();

  if (error || !data) return null;
  return data;
}

// Person B submits their anonymous response
export async function submitResponse(
  invitationId: string,
  responderName: string,
  responderColor: string,
  connection: Connection
): Promise<{ success: boolean; error?: string }> {
  const snapshot = connectionToSnapshot(connection);

  const { error } = await supabase.from('responses').insert({
    invitation_id: invitationId,
    responder_name: responderName,
    responder_color: responderColor,
    response_data: snapshot as unknown as Record<string, unknown>,
  });

  if (error) return { success: false, error: error.message };

  // Mark invitation as completed
  await supabase
    .from('invitations')
    .update({ status: 'completed' })
    .eq('id', invitationId);

  return { success: true };
}

interface ResponseRow {
  id: string;
  responder_name: string;
  responder_color: string | null;
  response_data: Record<string, unknown>;
  created_at: string;
}

interface InvitationWithResponses {
  id: string;
  token: string;
  connection_id?: string;
  profile_snapshot: Record<string, unknown>;
  status: string;
  created_at: string;
  responses: ResponseRow[];
}

// Person A fetches all responses to their invitations
export async function getMyResponses(userId: string): Promise<InvitationWithResponses[]> {
  const { data, error } = await supabase
    .from('invitations')
    .select(`
      id,
      token,
      connection_id,
      profile_snapshot,
      status,
      created_at,
      responses (
        id,
        responder_name,
        responder_color,
        response_data,
        created_at
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'completed');

  if (error || !data) return [];
  return data as unknown as InvitationWithResponses[];
}

// Get response for a specific connection
export async function getResponseForConnection(userId: string, connectionId: string): Promise<InvitationWithResponses | null> {
  const { data, error } = await supabase
    .from('invitations')
    .select(`
      id,
      token,
      profile_snapshot,
      status,
      responses (
        id,
        responder_name,
        responder_color,
        response_data,
        created_at
      )
    `)
    .eq('user_id', userId)
    .eq('connection_id', connectionId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as InvitationWithResponses;
}

// Subscribe to real-time responses for a connection
export function subscribeToResponses(
  userId: string,
  connectionId: string,
  onResponse: () => void
): { unsubscribe: () => void } {
  // Listen for changes to invitations table (status going to 'completed')
  const channel = supabase
    .channel(`responses:${connectionId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'invitations',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (payload.new && (payload.new as Record<string, unknown>).connection_id === connectionId && (payload.new as Record<string, unknown>).status === 'completed') {
          onResponse();
        }
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

// Generate the short share URL
export function getShareUrl(token: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/share/${token}`;
  }
  return `/share/${token}`;
}
