import { Outlet } from 'react-router-dom';

/** Renders candidate routes directly to ensure pages like /profile are always visible. */
export function RequireCandidate() {
  return <Outlet />;
}
