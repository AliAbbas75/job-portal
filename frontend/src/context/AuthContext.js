import { createContext } from 'react';

/** { status: 'loading' | 'authenticated' | 'anonymous', candidate, signIn(result, { remember }), signOut() } */
export const AuthContext = createContext(null);
