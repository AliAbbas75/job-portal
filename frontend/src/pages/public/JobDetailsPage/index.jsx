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
import { Requirements } from './Requirements';

export default function JobDetailsPage() {
  const { jobId } = useParams();
  const { status } = useAuth();
  const { data: job, error, reload } = useAsync(() => getJob(jobId), [jobId]);
  const { data: ref } = useReferenceData();
  useDocumentTitle(job?.title);

  if (error) {
    return (
      <div className="page">
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
    <div className="page pt-6">
      <Link to={paths.home} className="inline-flex items-center gap-1 font-medium">
        <Icon name="arrowLeft" size={16} />
        {t('job.backToJobs')}
      </Link>

      <header className="border-b border-heritage pt-6 pb-8">
        <JobSummary job={job} as="h1" size="lg" />
      </header>

      <div className="grid items-start gap-8 pt-8 lg:grid-cols-[1fr_340px] lg:gap-12">
        <div className="flex min-w-0 flex-col gap-8">
          <section className="flex flex-col gap-3 [&>h2]:text-xl">
            <h2>{t('job.aboutHeading')}</h2>
            <p>{job.description}</p>
          </section>

          <Requirements job={job} reference={ref} />

          <section className="flex flex-col gap-3 [&>h2]:text-xl">
            <h2>{t('job.quotaHeading')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse [&_td]:border-b [&_td]:border-surface [&_td]:px-3 [&_td]:py-2 [&_td:last-child]:text-right [&_th]:border-b-2 [&_th]:border-heritage [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-heritage [&_th:last-child]:text-right">
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

        <aside
          className="order-first lg:sticky lg:top-4 lg:order-none"
          aria-label={t('job.applyPanel')}
        >
          <div className="flex flex-col gap-4 rounded-md border-2 border-heritage bg-white p-5">
            {closed ? (
              <Alert variant="warning" title={t('job.closedTitle')}>
                {t('job.closedBody')}
              </Alert>
            ) : (
              <p className={daysLeft <= 7 ? 'text-lg font-bold text-ember' : 'text-lg font-bold'}>
                {t('jobs.closesIn', { count: daysLeft })}
              </p>
            )}
            <dl className="flex flex-col gap-2">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="flex justify-between gap-3 border-b border-dashed border-heritage pb-2 [&_dd]:text-right [&_dd]:font-bold [&_dt]:inline-flex [&_dt]:flex-none [&_dt]:items-center [&_dt]:gap-2 [&_dt]:whitespace-nowrap [&_dt_svg]:text-heritage"
                >
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
                <p className="text-sm">{t('job.applyNote')}</p>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
