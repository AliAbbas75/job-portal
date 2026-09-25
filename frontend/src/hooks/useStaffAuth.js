import { useContext } from 'react';
import { StaffAuthContext } from '../context/StaffAuthContext';

export function useStaffAuth() {
  const auth = useContext(StaffAuthContext);
  if (!auth) throw new Error('useStaffAuth must be used inside <StaffAuthProvider>');
  return auth;
}
