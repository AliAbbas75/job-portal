import { useState } from 'react';
import { Link } from 'react-router-dom';
import { listMyApplications } from '../../api/applications';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { FeeBadge } from '../../components/common/FeeBadge';
import { Icon } from '../../components/common/Icon';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/PageState';
import { Pagination } from '../../components/common/Pagination';
import { CandidateTabs } from '../../components/layout/CandidateTabs';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { t } from '../../i18n';
import { paths } from '../../routes/paths';
import { formatDate } from '../../utils/format';
import { jobCode } from '../../utils/jobCode';

// Dashboard groups for the §4.9 statuses (open question 6). There are no draft applications:
// an application only exists once it's submitted.
const GROUP = {
  submitted: 'under_review',
  under_review: 'under_review',
  document_verification: 'action',
  medical: 'action',
  rejected: 'rejected',
};
const groupOf = (status) => GROUP[status] ?? 'approved';
const BADGE = { under_review: 'gold', approved: 'green', rejected: 'red', action: 'cream' };
const BADGE_ICON = { under_review: 'hourglass', approved: 'check', rejected: 'x', action: 'alert' };
const PAGE_SIZES = [5, 10];

function GroupBadge({ status }) {
  const group = groupOf(status);
  return (
    <Badge variant={BADGE[group]}>
      <Icon name={BADGE_ICON[group]} size={14} />
      {t(`dashboard.group.${group}`)}
    </Badge>
  );
}

/** Candidate dashboard (design: Malaika): stats, applications table, latest updates. */
export default function MyApplicationsPage() {
  const { candidate } = useAuth();
  useDocumentTitle(t('dashboard.tabs.dashboard'));
  const { data: applications, error, reload } = useAsync(listMyApplications, []);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  if (error) {
    return (
      <div className="page">
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }
  if (!applications) return <LoadingState />;

  const count = (group) => applications.filter((a) => groupOf(a.status) === group).length;
  // An unpaid fee also needs the candidate to act (T-063).
  const needsAction = (a) => groupOf(a.status) === 'action' || a.fee?.status === 'unpaid';
  const stats = [
    { key: 'applications', value: applications.length, icon: 'file' },
    { key: 'drafts', value: 0, icon: 'edit' },
    { key: 'underReview', value: count('under_review'), icon: 'clock' },
    { key: 'actionRequired', value: applications.filter(needsAction).length, icon: 'alert' },
    { key: 'approved', value: count('approved'), icon: 'check' },
  ];
  const rows = applications.slice((page - 1) * pageSize, page * pageSize);
  const updates = applications
    .flatMap((a) => a.events.map((event) => ({ ...event, application: a })))
    .sort((x, y) => new Date(y.at) - new Date(x.at))
    .slice(0, 5);

  return (
    <div className="bg-cream py-8">
      <div className="page flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm">{t('dashboard.eyebrow')}</p>
            <h1 className="text-2xl text-black md:text-3xl">
              {candidate?.name
                ? t('dashboard.welcome', { name: candidate.name })
                : t('dashboard.welcomeNoName')}
            </h1>
            <p className="mt-0.5 text-sm">{t('dashboard.lead')}</p>
          </div>
          <CandidateTabs current="dashboard" />
        </div>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat) => (
            <li
              key={stat.key}
              className="flex items-center justify-between rounded-md border border-heritage bg-white p-5"
            >
              <div>
                <p className="mb-1 text-sm font-bold">{t(`dashboard.stats.${stat.key}`)}</p>
                <p className="text-3xl font-extrabold">{stat.value}</p>
              </div>
              <span className="flex size-10 items-center justify-center rounded-sm bg-surface text-heritage">
                <Icon name={stat.icon} size={20} />
              </span>
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section
            className="rounded-md border border-heritage bg-white p-5 lg:col-span-2"
            aria-labelledby="applications-heading"
          >
            <h2
              id="applications-heading"
              className="mb-4 flex items-center gap-2 border-b border-surface pb-3 text-base text-black"
            >
              <Icon name="file" size={18} className="text-heritage" />
              {t('dashboard.tableTitle')}
            </h2>
            {applications.length === 0 ? (
              <EmptyState
                title={t('dashboard.empty')}
                action={<Button to={paths.jobs}>{t('dashboard.findJobs')}</Button>}
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[40rem] border-collapse text-left text-sm [&_td]:border-b [&_td]:border-surface [&_td]:px-2 [&_td]:py-3 [&_th]:border-b [&_th]:border-heritage [&_th]:px-2 [&_th]:py-3 [&_th]:font-bold [&_th]:text-heritage">
                    <thead>
                      <tr>
                        <th scope="col">{t('dashboard.table.jobId')}</th>
                        <th scope="col">{t('dashboard.table.post')}</th>
                        <th scope="col">{t('dashboard.table.scale')}</th>
                        <th scope="col">{t('dashboard.table.reference')}</th>
                        <th scope="col">{t('dashboard.table.date')}</th>
                        <th scope="col">{t('dashboard.table.status')}</th>
                        <th scope="col" className="text-right">
                          {t('dashboard.table.action')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((a) => (
                        <tr key={a.id} className="hover:bg-cream">
                          <td className="whitespace-nowrap">{jobCode({ id: a.jobId })}</td>
                          <td className="font-bold">{a.job.title}</td>
                          <td className="whitespace-nowrap">{t('jobs.bps', { bps: a.job.bps })}</td>
                          <td className="font-mono text-xs">{a.id}</td>
                          <td className="whitespace-nowrap">{formatDate(a.submittedAt)}</td>
                          <td className="whitespace-nowrap">
                            <span className="flex flex-col items-start gap-1">
                              <GroupBadge status={a.status} />
                              <FeeBadge fee={a.fee} />
                            </span>
                          </td>
                          <td className="text-right">
                            <Link
                              to={paths.application(a.id)}
                              className="inline-flex items-center gap-1 rounded-sm border border-heritage px-3 py-1 no-underline hover:bg-surface"
                            >
                              <Icon name="eye" size={14} />
                              {t('dashboard.table.view')}
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 border-t border-surface pt-4">
                  <Pagination
                    page={page}
                    pageSize={pageSize}
                    total={applications.length}
                    sizes={PAGE_SIZES}
                    onPage={setPage}
                    onPageSize={(size) => {
                      setPageSize(size);
                      setPage(1);
                    }}
                  />
                </div>
              </>
            )}
          </section>

          <section
            className="flex flex-col gap-4 rounded-md border border-heritage bg-white p-5"
            aria-labelledby="updates-heading"
          >
            <h2
              id="updates-heading"
              className="flex items-center gap-2 border-b border-surface pb-3 text-base text-black"
            >
              <Icon name="bell" size={18} className="text-heritage" />
              {t('dashboard.updatesTitle')}
            </h2>
            {updates.length === 0 && <p className="text-sm">{t('dashboard.noUpdates')}</p>}
            <ol className="flex flex-col divide-y divide-surface">
              {updates.map((update) => {
                const status = t(`status.${update.status}`);
                return (
                  <li
                    key={`${update.application.id}-${update.status}-${update.at}`}
                    className="flex flex-col gap-1.5 py-3 first:pt-0"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <GroupBadge status={update.status} />
                      <span>{formatDate(update.at)}</span>
                    </div>
                    <h3 className="text-sm text-black">{t('dashboard.updateTitle', { status })}</h3>
                    <p className="text-sm">
                      {update.note ||
                        t('dashboard.updateBody', { job: update.application.job.title, status })}
                    </p>
                    <Link
                      to={paths.application(update.application.id)}
                      className="text-sm font-bold"
                    >
                      {t('dashboard.viewApplication')} →
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
