import { useCallback, useEffect, useMemo, useState } from 'react';
import { getStaffSession, staffLogout } from '../api/adminAuth';
import { setStaffToken } from '../api/client';
import { StaffAuthContext } from './StaffAuthContext';

const TOKEN_KEY = 'pr-staff-token';

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

/** Staff login state, kept apart from the candidate session (AuthProvider). */
export function StaffAuthProvider({ children }) {
  const [state, setState] = useState(() => ({
    status: readToken() ? 'loading' : 'anonymous',
    staff: null,
  }));

  useEffect(() => {
    const token = readToken();
    if (!token) return;
    setStaffToken(token);
    getStaffSession()
      .then(({ staff }) => setState({ status: 'authenticated', staff }))
      .catch(() => {
        writeToken(null);
        setStaffToken(null);
        setState({ status: 'anonymous', staff: null });
      });
  }, []);

  const signIn = useCallback(({ token, staff }) => {
    writeToken(token);
    setStaffToken(token);
    setState({ status: 'authenticated', staff });
  }, []);

  const signOut = useCallback(async () => {
    await staffLogout().catch(() => {});
    writeToken(null);
    setStaffToken(null);
    setState({ status: 'anonymous', staff: null });
  }, []);

  const value = useMemo(() => ({ ...state, signIn, signOut }), [state, signIn, signOut]);
  return <StaffAuthContext.Provider value={value}>{children}</StaffAuthContext.Provider>;
}
