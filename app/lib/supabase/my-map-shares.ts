'use client';

import { supabase } from './client';

export interface MyMapRating { item: string; tier: string; }
export interface MyMapProfile { categoryId: string; ratings: MyMapRating[]; }

function generateToken(): string {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  let token = '';
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  for (const byte of array) token += chars[byte % chars.length];
  return token;
}

/** Short Supabase tokens are 8 lowercase alphanumeric chars (no confusing 0/o/l/1) */
export function isSupabaseToken(token: string): boolean {
  return /^[a-z2-9]{8}$/.test(token);
}

/** Person A creates a My Map share — returns a short 8-char token */
export async function createMyMapShare(
  userId: string,
  sharerName: string,
  mapData: MyMapProfile[]
): Promise<{ token: string } | { error: string }> {
  const token = generateToken();
  const { error } = await supabase.from('my_map_shares').insert({
    token,
    user_id: userId,
    sharer_name: sharerName,
    map_data: mapData as unknown as Record<string, unknown>[],
  });
  if (error) return { error: error.message };
  return { token };
}

/** Load a My Map share by token */
export async function getMyMapShare(token: string): Promise<{
  id: string;
  token: string;
  user_id: string | null;
  sharer_name: string;
  map_data: MyMapProfile[];
} | null> {
  const { data, error } = await supabase
    .from('my_map_shares')
    .select('id, token, user_id, sharer_name, map_data')
    .eq('token', token)
    .single();
  if (error || !data) return null;
  return data as {
    id: string; token: string; user_id: string | null;
    sharer_name: string; map_data: MyMapProfile[];
  };
}

/** Person B submits their response — returns the response UUID for the compare page */
export async function submitMyMapResponse(
  shareId: string,
  responderName: string,
  responseData: MyMapProfile[]
): Promise<{ id: string } | { error: string }> {
  const { data, error } = await supabase
    .from('my_map_responses')
    .insert({
      share_id: shareId,
      responder_name: responderName,
      response_data: responseData as unknown as Record<string, unknown>[],
    })
    .select('id')
    .single();
  if (error || !data) return { error: error?.message || 'Unknown error' };
  return { id: data.id as string };
}

/** Compare page: load both sides by response UUID */
export async function getMyMapComparison(responseId: string): Promise<{
  personA: { name: string; profiles: MyMapProfile[] };
  personB: { name: string; profiles: MyMapProfile[] };
} | null> {
  const { data, error } = await supabase
    .from('my_map_responses')
    .select('responder_name, response_data, my_map_shares(sharer_name, map_data)')
    .eq('id', responseId)
    .single();
  if (error || !data) return null;
  const share = (data as unknown as {
    my_map_shares: { sharer_name: string; map_data: MyMapProfile[] }
  }).my_map_shares;
  return {
    personA: { name: share.sharer_name, profiles: share.map_data },
    personB: { name: data.responder_name, profiles: data.response_data as unknown as MyMapProfile[] },
  };
}

/** Home page: get all responses Person A has received */
export async function getMyMapResponses(userId: string) {
  const { data, error } = await supabase
    .from('my_map_shares')
    .select('id, token, sharer_name, created_at, my_map_responses(id, responder_name, created_at)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as {
    id: string; token: string; sharer_name: string; created_at: string;
    my_map_responses: { id: string; responder_name: string; created_at: string }[];
  }[];
}

/** Real-time: fire callback when someone responds to Person A's My Map */
export function subscribeToMyMapResponses(
  userId: string,
  onResponse: (responderName: string, responseId: string) => void
): { unsubscribe: () => void } {
  const channel = supabase
    .channel(`my_map_resp_${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'my_map_responses' },
      async (payload) => {
        const shareId = (payload.new as Record<string, unknown>).share_id as string;
        const responseId = (payload.new as Record<string, unknown>).id as string;
        const responderName = (payload.new as Record<string, unknown>).responder_name as string;
        // Verify this share belongs to userId
        const { data } = await supabase
          .from('my_map_shares')
          .select('id')
          .eq('id', shareId)
          .eq('user_id', userId)
          .maybeSingle();
        if (data) onResponse(responderName, responseId);
      }
    )
    .subscribe();
  return { unsubscribe: () => supabase.removeChannel(channel) };
}

export function getMyMapShareUrl(token: string): string {
  if (typeof window !== 'undefined') return `${window.location.origin}/map-share/${token}`;
  return `/map-share/${token}`;
}

/** Is this token a response UUID (for the compare page)? */
export function isResponseId(token: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token);
}
