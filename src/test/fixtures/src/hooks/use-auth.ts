import { useEffect, useState } from 'react';

interface AuthSession {
  userId: string;
  token: string;
  expiresAt: number;
}

export function useAuth(): { session: AuthSession | null; isAuthenticated: boolean } {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('auth_session');
    if (stored) setSession(JSON.parse(stored) as AuthSession);
  }, []);

  return { session, isAuthenticated: session !== null };
}
