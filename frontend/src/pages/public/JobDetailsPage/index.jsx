import { Link, useParams } from 'react-router-dom';
import { getJob } from '../../../api/jobs';
import { Alert } from '../../../components/common/Alert';
import { Button } from '../../../components/common/Button';
import { Countdown } from '../../../components/common/Countdown';
import { Icon } from '../../../components/common/Icon';
import { JobRequirements } from '../../../components/common/JobRequirements';
import { JobSummary } from '../../../components/common/JobSummary';
import { ErrorState, LoadingState } from '../../../components/common/PageState';
import { ShareButton } from '../../../components/common/ShareButton';
import { useAsync } from '../../../hooks/useAsync';
import { useAuth } from '../../../hooks/useAuth';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useReferenceData } from '../../../hooks/useReferenceData';
import { t } from '../../../i18n';
import { paths } from '../../../routes/paths';
import { formatCurrency, formatDate, formatLongDate } from '../../../utils/format';
import { jobCode } from '../../../utils/jobCode';
import { provinceName } from '../../../utils/referenceLabels';

/** Job details (Figma "Job Details", T-144): facts, requirements, quotas, deadline countdown. */
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
  const req = job.requirements;
  const applyPath = paths.applyCheck(job.id);
  const applyTo =
    status === 'authenticated' ? applyPath : `${paths.login}?next=${encodeURIComponent(applyPath)}`;

  const facts = [
    { label: t('job.facts.jobId'), value: jobCode(job) },
    { label: t('job.facts.vacancies'), value: job.vacancies },
    {
      label: t('job.facts.ageLimit'),
      value: t('job.req.ageValue', { min: req.ageMin, max: req.ageMax }),
    },
    { label: t('job.facts.location'), value: job.location },
    {
      label: t('job.facts.domicile'),
      value: req.domicileProvinces.length
        ? req.domicileProvinces.map((code) => provinceName(ref, code)).join(', ')
        : t('job.req.domicileAny'),
    },
    { label: t('job.facts.fee'), value: job.fee ? formatCurrency(job.fee) : t('job.facts.noFee') },
    { label: t('job.facts.opening'), value: formatDate(job.openingDate) },
    { label: t('job.facts.advertisement'), value: job.advertisementNo },
  ];

  return (
    <div className="page pt-6 pb-4">
      <Link to={paths.jobs} className="inline-flex items-center gap-1 font-medium">
        <Icon name="arrowLeft" size={16} />
        {t('job.backToJobs')}
      </Link>

      <div className="grid items-start gap-8 pt-6 lg:grid-cols-[1fr_340px] lg:gap-12">
        <div className="flex min-w-0 flex-col gap-8">
          <header className="border-b border-heritage pb-6">
            <JobSummary job={job} as="h1" size="lg" />
          </header>

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label} className="rounded-md border border-surface bg-cream p-3">
                <dt className="text-sm">{fact.label}</dt>
                <dd className="font-bold">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl">{t('job.aboutHeading')}</h2>
            <p className="whitespace-pre-line">{job.description}</p>
          </section>

          <JobRequirements job={job} reference={ref} />

          <section className="flex flex-col gap-3">
            <h2 className="text-xl">{t('job.quotaHeading')}</h2>
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
                    <tr key={quota.category}>
                      <td>{t(`quota.${quota.category}`)}</td>
                      <td>{quota.seats}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {!closed && (
            <Button to={applyTo} size="lg" fullWidth className="lg:hidden">
              {t('job.apply')}
            </Button>
          )}
        </div>

        <aside
          className="order-first flex flex-col gap-4 rounded-md border-2 border-heritage bg-surface p-5 lg:sticky lg:top-4 lg:order-none"
          aria-label={t('job.applyPanel')}
        >
          <p>
            <span className="block text-4xl font-bold text-heritage">{job.vacancies}</span>
            {t('job.vacanciesAvailable')}
          </p>
          <div>
            <h2 className="text-lg">{t('job.deadlineHeading')}</h2>
            <p className="flex items-center gap-2 font-bold text-ember">
              <Icon name="calendar" size={16} />
              {formatLongDate(job.closingDate)}
            </p>
          </div>
          {closed ? (
            <Alert variant="warning" title={t('job.closedTitle')}>
              {t('job.closedBody')}
            </Alert>
          ) : (
            <>
              <Countdown until={job.closingDate} />
              <Button to={applyTo} size="lg" fullWidth>
                {t('job.apply')}
              </Button>
              <p className="text-sm">{t('job.applyNote')}</p>
            </>
          )}
          <ShareButton title={job.title} />
        </aside>
      </div>
    </div>
  );
}
