import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingState } from '../components/common/PageState';
import { useAuth } from '../hooks/useAuth';
import { paths } from './paths';

/**
 * Sends signed-out visitors to login, then back to the page they wanted. When the session ended
 * (expired token) the login page says so.
 */
export function RequireCandidate() {
  const { status, sessionEnded } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <LoadingState />;
  if (status === 'anonymous') {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${paths.login}?next=${next}`} replace state={{ sessionEnded }} />;
  }
  return <Outlet />;
}
