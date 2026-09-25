import { useState } from 'react';
import { Link } from 'react-router-dom';
import { listAdminJobs } from '../../api/adminJobs';
import { JobStatusBadge } from '../../components/common/JobStatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/PageState';
import { SelectField } from '../../components/forms/SelectField';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { t } from '../../i18n';
import { paths } from '../../routes/paths';
import { formatDate } from '../../utils/format';

const STATUSES = [
  'draft',
  'pending_approval',
  'returned',
  'approved',
  'published',
  'rejected',
  'closed',
];

/** All jobs with a status filter (T-035), or with `approvals` the approval inbox (T-034). */
export default function AdminJobsPage({ approvals = false }) {
  const title = approvals ? t('adminJobs.list.approvalsTitle') : t('adminJobs.list.title');
  useDocumentTitle(title);
  const [chosen, setChosen] = useState('');
  const status = approvals ? 'pending_approval' : chosen;
  const { data, error, reload } = useAsync(() => listAdminJobs({ status }), [status]);

  const options = [
    { value: '', label: t('adminJobs.list.allStatuses') },
    ...STATUSES.map((value) => ({ value, label: t(`adminJobs.status.${value}`) })),
  ];

  return (
    <section className="page space-y-5 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl">{title}</h1>
          {approvals && <p>{t('adminJobs.list.approvalsLead')}</p>}
        </div>
        {!approvals && (
          <div className="w-full sm:w-64">
            <SelectField
              label={t('adminJobs.list.statusFilter')}
              options={options}
              value={chosen}
              onChange={setChosen}
            />
          </div>
        )}
      </div>

      {error && <ErrorState error={error} onRetry={reload} />}
      {!error && !data && <LoadingState />}
      {data && data.items.length === 0 && (
        <EmptyState
          title={approvals ? t('adminJobs.list.emptyApprovals') : t('adminJobs.list.emptyTitle')}
        />
      )}
      {data && data.items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse [&_td]:border-b [&_td]:border-surface [&_td]:px-3 [&_td]:py-2 [&_th]:border-b-2 [&_th]:border-heritage [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-heritage">
            <thead>
              <tr>
                <th scope="col">{t('adminJobs.list.colTitle')}</th>
                <th scope="col">{t('adminJobs.list.colDepartment')}</th>
                <th scope="col">{t('adminJobs.list.colBps')}</th>
                <th scope="col">{t('adminJobs.list.colStatus')}</th>
                <th scope="col">{t('adminJobs.list.colClosing')}</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((job) => (
                <tr key={job.id}>
                  <td>
                    <Link to={paths.adminJob(job.id)} className="font-medium">
                      {job.title}
                    </Link>
                  </td>
                  <td>{job.departmentName}</td>
                  <td>{job.bps}</td>
                  <td>
                    <JobStatusBadge status={job.status} />
                  </td>
                  <td className="whitespace-nowrap">{formatDate(job.closingDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
