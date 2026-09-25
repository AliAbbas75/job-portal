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
      <div className="page">
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }
  if (!application) return <LoadingState />;

  return (
    <div className="mx-auto flex w-full max-w-215 flex-col gap-5 px-4 pt-8">
      {justSubmitted ? (
        <>
          <ApplySteps current="submitted" />
          <Alert variant="success" title={t('tracking.submittedTitle')}>
            {t('tracking.submittedBody', { id: application.id })}
          </Alert>
        </>
      ) : (
        <Link to={paths.applications} className="inline-flex items-center gap-1 font-medium">
          <Icon name="arrowLeft" size={16} />
          {t('tracking.back')}
        </Link>
      )}

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold tracking-widest uppercase">
            {t('tracking.applicationId')}
          </p>
          <h1 className="text-2xl">{application.id}</h1>
          <p>{t('tracking.submittedOn', { date: formatDate(application.submittedAt) })}</p>
        </div>
        <StatusBadge status={application.status} />
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-md bg-cream p-4">
        <JobSummary job={application.job} />
        <Button to={paths.job(application.job.id)} variant="secondary" size="sm">
          {t('tracking.viewJob')}
        </Button>
      </div>

      <section aria-labelledby="progress-title" className="flex flex-col gap-4">
        <h2 id="progress-title" className="text-xl">
          {t('tracking.progressTitle')}
        </h2>
        <StatusTimeline events={application.events} />
      </section>

      <Alert variant="info">{t('tracking.finalNote')}</Alert>

      {justSubmitted && (
        <div className="flex flex-wrap gap-3">
          <Button to={paths.applications}>{t('nav.myApplications')}</Button>
          <Button to={paths.jobs} variant="secondary">
            {t('tracking.findMore')}
          </Button>
        </div>
      )}
    </div>
  );
}
