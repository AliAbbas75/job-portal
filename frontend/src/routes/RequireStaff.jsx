import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { EmptyState, LoadingState } from '../components/common/PageState';
import { useStaffAuth } from '../hooks/useStaffAuth';
import { t } from '../i18n';
import { paths } from './paths';

/**
 * Admin pages: sends signed-out visitors to the staff login, then back. With `roles`
 * (e.g. ['approver', 'admin']) other staff see a "no access" message. The API checks roles too.
 */
export function RequireStaff({ roles }) {
  const { status, staff } = useStaffAuth();
  const location = useLocation();

  if (status === 'loading') return <LoadingState />;
  if (status === 'anonymous') {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${paths.adminLogin}?next=${next}`} replace />;
  }
  if (roles && !roles.includes(staff.role)) {
    return (
      <EmptyState
        icon="alert"
        title={t('admin.noAccessTitle')}
        description={t('errors.forbidden')}
      />
    );
  }
  return <Outlet />;
}
