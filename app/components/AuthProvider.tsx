'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { onAuthStateChange, getUser } from '../lib/supabase/auth';
import { syncOnLogin } from '../lib/supabase/sync';
import { isSupabaseConfigured } from '../lib/supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Check current session
    getUser().then((u) => {
      setUser(u);
      setLoading(false);
    });

    // Listen for auth changes
    const subscription = onAuthStateChange((u) => {
      setUser(u);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync localStorage to Supabase on first authenticated load
  useEffect(() => {
    if (user && !synced) {
      setSynced(true);
      syncOnLogin(user.id).catch(console.error);
    }
  }, [user, synced]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
