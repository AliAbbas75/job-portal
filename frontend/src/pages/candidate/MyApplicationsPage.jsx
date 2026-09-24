import { Link } from 'react-router-dom';
import { listMyApplications } from '../../api/applications';
import { Button } from '../../components/common/Button';
import { DepartmentMark } from '../../components/common/DepartmentMark';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/PageState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { t } from '../../i18n';
import { paths } from '../../routes/paths';
import { formatDate } from '../../utils/format';
import styles from './MyApplicationsPage.module.css';

export default function MyApplicationsPage() {
  useDocumentTitle(t('applications.title'));
  const { data, error, reload } = useAsync(listMyApplications, []);

  return (
    <div className={`container ${styles.page}`}>
      <div>
        <h1 className={styles.title}>{t('applications.title')}</h1>
        <p>{t('applications.lead')}</p>
      </div>

      {error && <ErrorState error={error} onRetry={reload} />}
      {!error && !data && <LoadingState />}
      {data?.length === 0 && (
        <EmptyState
          icon="briefcase"
          title={t('applications.emptyTitle')}
          description={t('applications.emptyDescription')}
          action={<Button to={paths.home}>{t('nav.findJobs')}</Button>}
        />
      )}
      {data?.length > 0 && (
        <ul className={styles.list}>
          {data.map((application) => (
            <li key={application.id} className={styles.item}>
              <DepartmentMark
                code={application.job.department}
                name={application.job.departmentName}
              />
              <div className={styles.main}>
                <h2 className={styles.jobTitle}>
                  <Link to={paths.application(application.id)} className={styles.link}>
                    {application.job.title}
                  </Link>
                </h2>
                <p className={styles.meta}>
                  {application.job.departmentName} · {application.job.location}
                </p>
                <p className={styles.meta}>
                  {t('applications.idAndDate', {
                    id: application.id,
                    date: formatDate(application.submittedAt),
                  })}
                </p>
              </div>
              <StatusBadge status={application.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
