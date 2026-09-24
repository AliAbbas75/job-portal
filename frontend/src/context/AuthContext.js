import { createContext } from 'react';

/** { status: 'loading' | 'authenticated' | 'anonymous', candidate, signIn(result), signOut() } */
export const AuthContext = createContext(null);
