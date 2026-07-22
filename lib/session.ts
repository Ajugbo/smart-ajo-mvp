'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import type { UserRole } from '@/lib/types';

const STORAGE_KEY = 'circle.session.v1';

interface SessionState {
  userId: string | null;
  name: string | null;
  role: UserRole | null;
}

interface SessionContextValue extends SessionState {
  ready: boolean;
  setSession: (userId: string, name: string, role: UserRole) => void;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ userId: null, name: null, role: null });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SessionState;
        setState(parsed);
      }
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  const setSession = useCallback((userId: string, name: string, role: UserRole) => {
    const next: SessionState = { userId, name, role };
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const clearSession = useCallback(() => {
    setState({ userId: null, name: null, role: null });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  // ✅ FIX: Don't spread state directly - destructure it
  return (
    <SessionContext.Provider value={{
      userId: state.userId,
      name: state.name,
      role: state.role,
      ready,
      setSession,
      clearSession
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}