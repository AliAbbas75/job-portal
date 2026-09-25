import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { listJobApplications } from '../../../api/adminApplications';
import { getAdminJob } from '../../../api/adminJobs';
import { Icon } from '../../../components/common/Icon';
import { EmptyState, ErrorState, LoadingState } from '../../../components/common/PageState';
import { SelectField } from '../../../components/forms/SelectField';
import { useAsync } from '../../../hooks/useAsync';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useStaffAuth } from '../../../hooks/useStaffAuth';
import { t } from '../../../i18n';
import { paths } from '../../../routes/paths';
import { REJECTED, STATUS_FLOW } from '../../../utils/applicationStatuses';
import { ApplicationRow } from './ApplicationRow';

/** Applications to one job, with manual status changes for admins (T-068, T-065). */
export default function JobApplicationsPage() {
  const { jobId } = useParams();
  const { staff } = useStaffAuth();
  const [status, setStatus] = useState('');
  const job = useAsync(() => getAdminJob(jobId), [jobId]);
  const list = useAsync(() => listJobApplications(jobId, { status }), [jobId, status]);
  useDocumentTitle(t('adminApplications.title'));

  const error = job.error ?? list.error;
  const replace = (updated) =>
    list.setData({
      items: list.data.items.map((a) => (a.id === updated.id ? updated : a)),
    });

  const options = [
    { value: '', label: t('adminJobs.list.allStatuses') },
    ...[...STATUS_FLOW, REJECTED].map((value) => ({ value, label: t(`status.${value}`) })),
  ];

  return (
    <section className="page space-y-5 py-8">
      <Link to={paths.adminJob(jobId)} className="inline-flex items-center gap-1 font-medium">
        <Icon name="arrowLeft" size={16} />
        {t('adminApplications.backToJob')}
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl">{t('adminApplications.title')}</h1>
          {job.data && <p>{job.data.title}</p>}
        </div>
        <div className="w-full sm:w-64">
          <SelectField
            label={t('adminJobs.list.statusFilter')}
            options={options}
            value={status}
            onChange={setStatus}
          />
        </div>
      </div>

      {error && <ErrorState error={error} onRetry={list.reload} />}
      {!error && !list.data && <LoadingState />}
      {list.data && list.data.items.length === 0 && (
        <EmptyState title={t('adminApplications.empty')} />
      )}
      {list.data && list.data.items.length > 0 && (
        <ul className="flex flex-col gap-3">
          {list.data.items.map((application) => (
            <ApplicationRow
              key={application.id}
              application={application}
              canChange={staff.role === 'admin'}
              onChanged={replace}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
