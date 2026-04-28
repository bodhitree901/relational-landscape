'use client';

import { Connection } from './types';

// Encode a connection to a shareable string (base64 JSON, compressed)
export function encodeConnection(connection: Connection): string {
  const slim = {
    n: connection.name,
    e: connection.emoji,
    c: connection.categories.map((cat) => ({
      i: cat.categoryId,
      r: cat.ratings.map((r) => ({
        s: r.subcategory,
        t: r.tier === 'must-have' ? 'M' : r.tier === 'open' ? 'O' : r.tier === 'maybe' ? 'Y' : 'X',
      })),
    })),
    t: {
      c: connection.timeRhythm.communication,
      p: connection.timeRhythm.inPerson,
      x: connection.timeRhythm.custom,
    },
  };
  const json = JSON.stringify(slim);
  // Use base64 encoding
  if (typeof window !== 'undefined') {
    return btoa(unescape(encodeURIComponent(json)));
  }
  return Buffer.from(json).toString('base64');
}

// Decode a shareable string back into a Connection
export function decodeConnection(encoded: string): Connection | null {
  try {
    let json: string;
    if (typeof window !== 'undefined') {
      json = decodeURIComponent(escape(atob(encoded)));
    } else {
      json = Buffer.from(encoded, 'base64').toString();
    }
    const slim = JSON.parse(json);

    const tierMap: Record<string, 'must-have' | 'open' | 'maybe' | 'off-limits'> = {
      // New encoding
      M: 'must-have',
      O: 'open',
      Y: 'maybe',
      X: 'off-limits',
      // Legacy encoding (backward compat)
      c: 'must-have',
      r: 'open',
      s: 'maybe',
      p: 'off-limits',
    };

    return {
      id: crypto.randomUUID(),
      name: slim.n,
      emoji: slim.e,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      categories: slim.c.map((cat: { i: string; r: { s: string; t: string }[] }) => ({
        categoryId: cat.i,
        ratings: cat.r.map((r: { s: string; t: string }) => ({
          subcategory: r.s,
          tier: tierMap[r.t] || 'maybe',
        })),
      })),
      timeRhythm: {
        communication: slim.t?.c || [],
        inPerson: slim.t?.p || [],
        custom: slim.t?.x || [],
      },
    };
  } catch {
    return null;
  }
}

export function generateShareUrl(connection: Connection, sharerName?: string): string {
  // If we have the sharer's name, swap it into the encoded profile
  // so the recipient sees who sent it, not the connection target's name
  const toEncode = sharerName
    ? { ...connection, name: sharerName }
    : connection;
  const encoded = encodeConnection(toEncode);
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/compare?profile=${encodeURIComponent(encoded)}`;
  }
  return `/compare?profile=${encodeURIComponent(encoded)}`;
}

// Generate a return URL that person B sends back to person A with both profiles
export function generateReturnUrl(theirProfile: Connection, myProfile: Connection): string {
  const theirs = encodeConnection(theirProfile);
  const mine = encodeConnection(myProfile);
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/compare?profile=${encodeURIComponent(theirs)}&reply=${encodeURIComponent(mine)}`;
  }
  return `/compare?profile=${encodeURIComponent(theirs)}&reply=${encodeURIComponent(mine)}`;
}
