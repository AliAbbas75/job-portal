import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../../hooks/useStaffAuth';
import { t } from '../../i18n';
import { paths } from '../../routes/paths';
import { cx } from '../../utils/cx';
import { APPROVER_ROLES, CREATOR_ROLES } from '../../utils/staffRoles';
import { Button } from '../common/Button';

/** Staff pages: a bar with the staff links and the signed-in user, then the page. */
export function AdminLayout() {
  const { staff, signOut } = useStaffAuth();
  const navigate = useNavigate();

  async function logOut() {
    await signOut();
    navigate(paths.adminLogin, { replace: true });
  }

  const links = [
    { to: paths.admin, label: t('adminJobs.nav.jobs'), show: true, end: true },
    {
      to: paths.adminApprovals,
      label: t('adminJobs.nav.approvals'),
      show: APPROVER_ROLES.includes(staff.role),
    },
    {
      to: paths.adminNewJob,
      label: t('adminJobs.nav.newJob'),
      show: CREATOR_ROLES.includes(staff.role),
    },
  ];

  return (
    <>
      <div className="border-b border-heritage bg-surface">
        <div className="page flex flex-wrap items-center justify-between gap-3 py-2">
          <nav aria-label={t('adminJobs.nav.label')}>
            <ul className="flex flex-wrap gap-4">
              {links
                .filter((link) => link.show)
                .map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      end={link.end}
                      className={({ isActive }) =>
                        cx(
                          'font-medium no-underline',
                          isActive ? 'text-heritage underline' : 'text-black',
                        )
                      }
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
            </ul>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm">
              {staff.name} · {t(`admin.roles.${staff.role}`)}
            </span>
            <Button variant="secondary" size="sm" onClick={logOut}>
              {t('nav.logOut')}
            </Button>
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
}
