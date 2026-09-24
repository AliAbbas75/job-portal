import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getApplication } from '../../../api/applications';
import { Alert } from '../../../components/common/Alert';
import { ApplySteps } from '../../../components/common/ApplySteps';
import { Button } from '../../../components/common/Button';
import { Icon } from '../../../components/common/Icon';
import { JobSummary } from '../../../components/common/JobSummary';
import { ErrorState, LoadingState } from '../../../components/common/PageState';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { useAsync } from '../../../hooks/useAsync';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { t } from '../../../i18n';
import { paths } from '../../../routes/paths';
import { formatDate } from '../../../utils/format';
import styles from './ApplicationDetailPage.module.css';
import { StatusTimeline } from './StatusTimeline';

export default function ApplicationDetailPage() {
  const { applicationId } = useParams();
  const [searchParams] = useSearchParams();
  const justSubmitted = searchParams.get('submitted') === '1';
  const {
    data: application,
    error,
    reload,
  } = useAsync(() => getApplication(applicationId), [applicationId]);
  useDocumentTitle(t('tracking.title', { id: applicationId }));

  if (error) {
    return (
      <div className="container">
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }
  if (!application) return <LoadingState />;

  return (
    <div className={`container ${styles.page}`}>
      {justSubmitted ? (
        <>
          <ApplySteps current="submitted" />
          <Alert variant="success" title={t('tracking.submittedTitle')}>
            {t('tracking.submittedBody', { id: application.id })}
          </Alert>
        </>
      ) : (
        <Link to={paths.applications} className={styles.back}>
          <Icon name="arrowLeft" size={16} />
          {t('tracking.back')}
        </Link>
      )}

      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{t('tracking.applicationId')}</p>
          <h1 className={styles.title}>{application.id}</h1>
          <p>{t('tracking.submittedOn', { date: formatDate(application.submittedAt) })}</p>
        </div>
        <StatusBadge status={application.status} />
      </header>

      <div className={styles.jobCard}>
        <JobSummary job={application.job} />
        <Button to={paths.job(application.job.id)} variant="secondary" size="sm">
          {t('tracking.viewJob')}
        </Button>
      </div>

      <section aria-labelledby="progress-title" className={styles.progress}>
        <h2 id="progress-title" className={styles.sectionTitle}>
          {t('tracking.progressTitle')}
        </h2>
        <StatusTimeline events={application.events} />
      </section>

      <Alert variant="info">{t('tracking.finalNote')}</Alert>

      {justSubmitted && (
        <div className={styles.nextActions}>
          <Button to={paths.applications}>{t('nav.myApplications')}</Button>
          <Button to={paths.home} variant="secondary">
            {t('tracking.findMore')}
          </Button>
        </div>
      )}
    </div>
  );
}
