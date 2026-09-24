import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/PageState';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { t } from '../../i18n';
import { paths } from '../../routes/paths';

export default function NotFoundPage() {
  useDocumentTitle(t('notFound.title'));
  return (
    <div className="container">
      <EmptyState
        icon="alert"
        title={t('notFound.title')}
        description={t('notFound.description')}
        action={<Button to={paths.home}>{t('nav.findJobs')}</Button>}
      />
    </div>
  );
}
