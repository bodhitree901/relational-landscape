'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { signInWithGoogle, signInWithMagicLink, signOut } from '../lib/supabase/auth';
import { isSupabaseConfigured } from '../lib/supabase/client';

export default function AuthButton() {
  const { user, loading } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);
  const [email, setEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState('');

  if (loading || !isSupabaseConfigured()) return null;

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--lavender)] to-[var(--peach)] flex items-center justify-center">
          <span className="text-[10px] text-white font-medium">
            {(user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()}
          </span>
        </div>
        <button
          onClick={() => signOut()}
          className="text-xs opacity-30 hover:opacity-60 transition-opacity"
        >
          Sign out
        </button>
      </div>
    );
  }

  if (!showSignIn) {
    return (
      <button
        onClick={() => setShowSignIn(true)}
        className="text-xs px-3 py-1.5 rounded-full transition-all active:scale-95"
        style={{ background: 'rgba(61,53,50,0.06)', color: '#3D3532' }}
      >
        Sign in
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px]" onClick={() => setShowSignIn(false)} />
      <div className="relative watercolor-card bg-[var(--background)] p-8 max-w-sm w-full animate-tooltip">
        <h2
          className="text-xl font-semibold text-center mb-2"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Sign in
        </h2>
        <p className="text-xs text-center opacity-50 mb-6">
          Sync your connections and enable sharing
        </p>

        {/* Magic link */}
        {!magicLinkSent ? (
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && email.includes('@')) {
                  signInWithMagicLink(email).then(() => setMagicLinkSent(true)).catch((e) => setError(e.message));
                }
              }}
              placeholder="your@email.com"
              className="w-full text-center text-sm bg-transparent border-b-2 border-black/10 focus:border-black/30 outline-none pb-2 placeholder:opacity-30 transition-colors mb-3"
              autoFocus
            />
            <button
              onClick={async () => {
                if (!email.includes('@')) return;
                try {
                  await signInWithMagicLink(email);
                  setMagicLinkSent(true);
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
              disabled={!email.includes('@')}
              className="w-full py-3 rounded-2xl text-white font-medium text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-30"
              style={{ background: 'linear-gradient(135deg, var(--peach), var(--lavender))' }}
            >
              Send magic link
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm opacity-60 mb-1">Check your email</p>
            <p className="text-xs opacity-40">We sent a sign-in link to {email}</p>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-500 text-center mt-3">{error}</p>
        )}

        <button
          onClick={() => { setShowSignIn(false); setError(''); setMagicLinkSent(false); }}
          className="w-full mt-4 text-xs opacity-40 hover:opacity-60 transition-opacity"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
