import { createContext } from 'react';

/** { status: 'loading' | 'authenticated' | 'anonymous', staff, signIn(result), signOut() } */
export const StaffAuthContext = createContext(null);
