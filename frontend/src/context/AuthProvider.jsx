import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSession, logout } from '../api/auth';
import { setAuthToken } from '../api/client';
import { AuthContext } from './AuthContext';

const TOKEN_KEY = 'pr-auth-token';

function readToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeToken(token) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage blocked: the session lasts until the tab reloads.
  }
}

export function AuthProvider({ children }) {
  const [state, setState] = useState(() => ({
    status: readToken() ? 'loading' : 'anonymous',
    candidate: null,
  }));

  useEffect(() => {
    const token = readToken();
    if (!token) return;
    setAuthToken(token);
    getSession()
      .then(({ candidate }) => setState({ status: 'authenticated', candidate }))
      .catch(() => {
        writeToken(null);
        setAuthToken(null);
        setState({ status: 'anonymous', candidate: null });
      });
  }, []);

  const signIn = useCallback(({ token, candidate }) => {
    writeToken(token);
    setAuthToken(token);
    setState({ status: 'authenticated', candidate });
  }, []);

  const signOut = useCallback(async () => {
    await logout().catch(() => {});
    writeToken(null);
    setAuthToken(null);
    setState({ status: 'anonymous', candidate: null });
  }, []);

  const value = useMemo(() => ({ ...state, signIn, signOut }), [state, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
