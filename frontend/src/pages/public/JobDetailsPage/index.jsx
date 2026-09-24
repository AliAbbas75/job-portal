import { Link, useParams } from 'react-router-dom';
import { getJob } from '../../../api/jobs';
import { Alert } from '../../../components/common/Alert';
import { Button } from '../../../components/common/Button';
import { Icon } from '../../../components/common/Icon';
import { JobSummary } from '../../../components/common/JobSummary';
import { ErrorState, LoadingState } from '../../../components/common/PageState';
import { useAsync } from '../../../hooks/useAsync';
import { useAuth } from '../../../hooks/useAuth';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useReferenceData } from '../../../hooks/useReferenceData';
import { t } from '../../../i18n';
import { paths } from '../../../routes/paths';
import { daysUntil, formatCurrency, formatDate } from '../../../utils/format';
import styles from './JobDetailsPage.module.css';
import { Requirements } from './Requirements';

export default function JobDetailsPage() {
  const { jobId } = useParams();
  const { status } = useAuth();
  const { data: job, error, reload } = useAsync(() => getJob(jobId), [jobId]);
  const { data: ref } = useReferenceData();
  useDocumentTitle(job?.title);

  if (error) {
    return (
      <div className="container">
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }
  if (!job) return <LoadingState />;

  const closed = job.status !== 'published';
  const daysLeft = daysUntil(job.closingDate);
  const applyPath = paths.applyCheck(job.id);
  const applyTo =
    status === 'authenticated' ? applyPath : `${paths.login}?next=${encodeURIComponent(applyPath)}`;

  const facts = [
    { icon: 'users', label: t('job.facts.vacancies'), value: job.vacancies },
    { icon: 'calendar', label: t('job.facts.opening'), value: formatDate(job.openingDate) },
    { icon: 'clock', label: t('job.facts.closing'), value: formatDate(job.closingDate) },
    { icon: 'file', label: t('job.facts.advertisement'), value: job.advertisementNo },
    {
      icon: 'briefcase',
      label: t('job.facts.fee'),
      value: job.fee ? formatCurrency(job.fee) : t('job.facts.noFee'),
    },
  ];

  return (
    <div className={`container ${styles.page}`}>
      <Link to={paths.home} className={styles.back}>
        <Icon name="arrowLeft" size={16} />
        {t('job.backToJobs')}
      </Link>

      <header className={styles.header}>
        <JobSummary job={job} as="h1" size="lg" />
      </header>

      <div className={styles.layout}>
        <div className={styles.main}>
          <section className={styles.section}>
            <h2>{t('job.aboutHeading')}</h2>
            <p>{job.description}</p>
          </section>

          <Requirements job={job} reference={ref} />

          <section className={styles.section}>
            <h2>{t('job.quotaHeading')}</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">{t('job.quotaCategory')}</th>
                    <th scope="col">{t('job.quotaSeats')}</th>
                  </tr>
                </thead>
                <tbody>
                  {job.quotas.map((quota) => (
                    <tr key={quota.label}>
                      <td>{quota.label}</td>
                      <td>{quota.seats}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className={styles.aside} aria-label={t('job.applyPanel')}>
          <div className={styles.applyCard}>
            {closed ? (
              <Alert variant="warning" title={t('job.closedTitle')}>
                {t('job.closedBody')}
              </Alert>
            ) : (
              <p className={daysLeft <= 7 ? styles.deadlineSoon : styles.deadline}>
                {t('jobs.closesIn', { count: daysLeft })}
              </p>
            )}
            <dl className={styles.facts}>
              {facts.map((fact) => (
                <div key={fact.label} className={styles.fact}>
                  <dt>
                    <Icon name={fact.icon} size={16} />
                    {fact.label}
                  </dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
            {!closed && (
              <>
                <Button to={applyTo} variant="accent" size="lg" fullWidth>
                  {t('job.apply')}
                </Button>
                <p className={styles.applyNote}>{t('job.applyNote')}</p>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
