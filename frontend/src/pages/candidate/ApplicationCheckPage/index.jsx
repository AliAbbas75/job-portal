import { useParams } from 'react-router-dom';
import { getApplicationCheck } from '../../../api/applications';
import { getJob } from '../../../api/jobs';
import { Alert } from '../../../components/common/Alert';
import { ApplySteps } from '../../../components/common/ApplySteps';
import { Button } from '../../../components/common/Button';
import { JobSummary } from '../../../components/common/JobSummary';
import { ErrorState, LoadingState } from '../../../components/common/PageState';
import { useAsync } from '../../../hooks/useAsync';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useReferenceData } from '../../../hooks/useReferenceData';
import { t } from '../../../i18n';
import { paths } from '../../../routes/paths';
import styles from './ApplicationCheckPage.module.css';
import { CheckItem } from './CheckItem';

export default function ApplicationCheckPage() {
  const { jobId } = useParams();
  useDocumentTitle(t('check.title'));
  const job = useAsync(() => getJob(jobId), [jobId]);
  const check = useAsync(() => getApplicationCheck(jobId), [jobId]);
  const { data: reference } = useReferenceData();

  const error = job.error ?? check.error;
  if (error) {
    return (
      <div className="container">
        <ErrorState error={error} onRetry={check.reload} />
      </div>
    );
  }
  if (!job.data || !check.data) return <LoadingState />;

  const result = check.data;
  const returnTo = paths.applyCheck(jobId);
  const pending = result.items.filter((item) => item.status !== 'met');
  const met = result.items.filter((item) => item.status === 'met');
  const blocked = Boolean(result.alreadyAppliedId) || result.jobClosed;
  const canContinue = result.complete && result.eligible && !blocked;

  const renderItem = (item) => (
    <CheckItem
      key={item.key === 'document' ? item.documentType : item.key}
      item={item}
      reference={reference}
      returnTo={returnTo}
      onChanged={check.reload}
    />
  );

  return (
    <div className={`container ${styles.page}`}>
      <ApplySteps current="check" />
      <div>
        <h1 className={styles.title}>{t('check.title')}</h1>
        <p>{t('check.lead')}</p>
      </div>

      <div className={styles.jobCard}>
        <JobSummary job={job.data} />
      </div>

      {result.alreadyAppliedId && (
        <Alert
          variant="info"
          title={t('check.alreadyApplied')}
          action={
            <Button to={paths.application(result.alreadyAppliedId)} size="sm">
              {t('check.viewApplication')}
            </Button>
          }
        />
      )}
      {result.jobClosed && (
        <Alert variant="warning" title={t('job.closedTitle')}>
          {t('job.closedBody')}
        </Alert>
      )}
      {!blocked && !result.eligible && (
        <Alert variant="error" title={t('check.notEligibleTitle')}>
          {t('check.notEligibleBody')}
        </Alert>
      )}

      {pending.length > 0 && (
        <section className={styles.group} aria-labelledby="needs-attention">
          <h2 id="needs-attention" className={styles.groupTitle}>
            {t('check.needsAttention', { count: pending.length })}
          </h2>
          <ul className={styles.list}>{pending.map(renderItem)}</ul>
        </section>
      )}

      <section className={styles.group} aria-labelledby="already-met">
        <h2 id="already-met" className={styles.groupTitle}>
          {t('check.alreadyMet', { count: met.length, total: result.items.length })}
        </h2>
        <ul className={styles.list}>{met.map(renderItem)}</ul>
      </section>

      <div className={styles.actions}>
        <Button to={paths.job(jobId)} variant="ghost">
          {t('check.backToJob')}
        </Button>
        {canContinue ? (
          <Button to={paths.applyReview(jobId)} variant="accent" size="lg">
            {t('check.continue')}
          </Button>
        ) : (
          <Button variant="accent" size="lg" disabled>
            {t('check.continue')}
          </Button>
        )}
      </div>
      {!canContinue && !blocked && result.eligible && (
        <p className={styles.hint}>{t('check.continueHint')}</p>
      )}
    </div>
  );
}
