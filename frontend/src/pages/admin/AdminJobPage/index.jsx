import { Link, useParams } from 'react-router-dom';
import { getAdminJob } from '../../../api/adminJobs';
import { Alert } from '../../../components/common/Alert';
import { Button } from '../../../components/common/Button';
import { Icon } from '../../../components/common/Icon';
import { JobRequirements } from '../../../components/common/JobRequirements';
import { JobStatusBadge } from '../../../components/common/JobStatusBadge';
import { JobSummary } from '../../../components/common/JobSummary';
import { ErrorState, LoadingState } from '../../../components/common/PageState';
import { useAsync } from '../../../hooks/useAsync';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useReferenceData } from '../../../hooks/useReferenceData';
import { useStaffAuth } from '../../../hooks/useStaffAuth';
import { t } from '../../../i18n';
import { paths } from '../../../routes/paths';
import { formatCurrency, formatDate } from '../../../utils/format';
import { JobActions } from './JobActions';

/** One job for staff: details, approval history and the actions the user's role allows. */
export default function AdminJobPage() {
  const { jobId } = useParams();
  const { data: job, error, reload, setData } = useAsync(() => getAdminJob(jobId), [jobId]);
  const { data: ref } = useReferenceData();
  const { staff } = useStaffAuth();
  useDocumentTitle(job?.title);

  if (error) {
    return (
      <div className="page">
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }
  if (!job) return <LoadingState />;

  const note = {
    returned: t('adminJobs.detail.returnedNote'),
    rejected: t('adminJobs.detail.rejectedNote'),
    approved: t('adminJobs.detail.lockedNote'),
    published: job.live
      ? t('adminJobs.detail.liveNow')
      : t('adminJobs.detail.scheduled', { date: formatDate(job.openingDate) }),
  }[job.status];

  const facts = [
    [t('job.facts.vacancies'), job.vacancies],
    [t('job.facts.opening'), formatDate(job.openingDate)],
    [t('job.facts.closing'), formatDate(job.closingDate)],
    [t('job.facts.fee'), job.fee ? formatCurrency(job.fee) : t('job.facts.noFee')],
    [t('job.facts.advertisement'), job.advertisementNo || '-'],
  ];

  return (
    <div className="page space-y-6 py-8">
      <Link to={paths.admin} className="inline-flex items-center gap-1 font-medium">
        <Icon name="arrowLeft" size={16} />
        {t('adminJobs.detail.back')}
      </Link>

      <header className="space-y-3 border-b border-heritage pb-6">
        <JobStatusBadge status={job.status} />
        <JobSummary job={job} as="h1" size="lg" />
      </header>

      {note && <Alert variant={job.status === 'rejected' ? 'error' : 'info'}>{note}</Alert>}

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex min-w-0 flex-col gap-8">
          <dl className="grid gap-3 sm:grid-cols-3">
            {facts.map(([label, value]) => (
              <div key={label} className="rounded-md border border-surface p-3">
                <dt className="text-sm">{label}</dt>
                <dd className="font-bold">{value}</dd>
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
            <ul className="list-disc pl-5">
              {job.quotas.map((quota) => (
                <li key={quota.category}>
                  {t(`quota.${quota.category}`)}: {quota.seats}
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl">{t('adminJobs.detail.history')}</h2>
            {job.approvals.length === 0 ? (
              <p>{t('adminJobs.detail.noHistory')}</p>
            ) : (
              <ol className="flex flex-col gap-3">
                {job.approvals.map((record) => (
                  <li
                    key={`${record.approverId}-${record.at}`}
                    className="border-l-3 border-heritage pl-3"
                  >
                    <p className="font-medium">
                      {t(`adminJobs.detail.action.${record.action}`)} · {record.approver} ·{' '}
                      {formatDate(record.at)}
                    </p>
                    {record.comments && <p>{record.comments}</p>}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-4">
          <JobActions job={job} staff={staff} onChange={setData} />
          {['published', 'closed'].includes(job.status) && (
            <Button to={paths.adminJobApplications(job.id)} variant="secondary" fullWidth>
              {t('adminApplications.viewAll')}
            </Button>
          )}
        </aside>
      </div>
    </div>
  );
}
