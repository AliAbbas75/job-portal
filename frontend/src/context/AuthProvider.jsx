import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSession, logout } from '../api/auth';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';
import { clearApplyDrafts } from '../utils/applyDraft';
import { AuthContext } from './AuthContext';

const TOKEN_KEY = 'pr-auth-token';

// "Remember me" keeps the token in localStorage (survives closing the browser); otherwise it
// lives in sessionStorage and ends with the tab.
function readToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeToken(token, remember = false) {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
    if (token) (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  } catch {
    // Storage blocked: the session lasts until the tab reloads.
  }
}

export function AuthProvider({ children }) {
  // sessionEnded: the login token expired or was revoked (not a logout), so the login page can
  // say why, and the apply wizard's saved progress is kept for when they log back in.
  const [state, setState] = useState(() => ({
    status: readToken() ? 'loading' : 'anonymous',
    candidate: null,
    sessionEnded: false,
  }));

  useEffect(() => {
    setUnauthorizedHandler(() => {
      writeToken(null);
      setAuthToken(null);
      setState({ status: 'anonymous', candidate: null, sessionEnded: true });
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    const token = readToken();
    if (!token) return;
    setAuthToken(token);
    getSession()
      .then(({ candidate }) =>
        setState({ status: 'authenticated', candidate, sessionEnded: false }),
      )
      .catch(() => {
        writeToken(null);
        setAuthToken(null);
        setState({ status: 'anonymous', candidate: null, sessionEnded: true });
      });
  }, []);

  const signIn = useCallback(({ token, candidate }, { remember = false } = {}) => {
    writeToken(token, remember);
    setAuthToken(token);
    setState({ status: 'authenticated', candidate, sessionEnded: false });
  }, []);

  const signOut = useCallback(async () => {
    await logout().catch(() => {});
    writeToken(null);
    setAuthToken(null);
    clearApplyDrafts();
    setState({ status: 'anonymous', candidate: null, sessionEnded: false });
  }, []);

  const value = useMemo(() => ({ ...state, signIn, signOut }), [state, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
