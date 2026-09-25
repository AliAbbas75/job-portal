import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useStaffAuth } from '../../hooks/useStaffAuth';
import { t } from '../../i18n';
import { paths } from '../../routes/paths';

/** Landing page of the staff area. M3 adds job drafting, approvals and publishing here. */
export default function AdminHomePage() {
  useDocumentTitle(t('admin.title'));
  const { staff, signOut } = useStaffAuth();
  const navigate = useNavigate();

  async function logOut() {
    await signOut();
    navigate(paths.adminLogin, { replace: true });
  }

  return (
    <section className="page space-y-4 py-10">
      <h1 className="text-2xl">{t('admin.title')}</h1>
      <p>{t('admin.signedInAs', { name: staff.name, role: t(`admin.roles.${staff.role}`) })}</p>
      <Button variant="secondary" onClick={logOut}>
        {t('nav.logOut')}
      </Button>
    </section>
  );
}
