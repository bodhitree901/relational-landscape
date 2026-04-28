'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { onAuthStateChange, getUser } from '../lib/supabase/auth';
import { syncOnLogin, pullConnections, pullMyMap } from '../lib/supabase/sync';
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

  // On first authenticated load: push local data up, pull remote data down
  useEffect(() => {
    if (user && !synced) {
      setSynced(true);
      // Push local connections to Supabase
      syncOnLogin(user.id).catch(console.error);
      // Pull remote connections (cross-device sync)
      pullConnections(user.id).catch(console.error);
      // Pull My Map if local is empty
      pullMyMap(user.id).then((remote) => {
        if (!remote) return;
        const localMenu = localStorage.getItem('rl_my_menu');
        const localName = localStorage.getItem('rl_my_name');
        if (!localMenu && remote.mapData) {
          localStorage.setItem('rl_my_menu', JSON.stringify(remote.mapData));
        }
        if (!localName && remote.name) {
          localStorage.setItem('rl_my_name', remote.name);
        }
      }).catch(console.error);
    }
  }, [user, synced]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
