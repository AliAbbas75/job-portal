import { Link } from 'react-router-dom';
import { listMyApplications } from '../../api/applications';
import { Button } from '../../components/common/Button';
import { DepartmentMark } from '../../components/common/DepartmentMark';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/PageState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { t } from '../../i18n';
import { paths } from '../../routes/paths';
import { formatDate } from '../../utils/format';

export default function MyApplicationsPage() {
  useDocumentTitle(t('applications.title'));
  const { data, error, reload } = useAsync(listMyApplications, []);

  return (
    <div className="mx-auto flex w-full max-w-215 flex-col gap-5 px-4 pt-8">
      <div>
        <h1 className="text-2xl">{t('applications.title')}</h1>
        <p>{t('applications.lead')}</p>
      </div>

      {error && <ErrorState error={error} onRetry={reload} />}
      {!error && !data && <LoadingState />}
      {data?.length === 0 && (
        <EmptyState
          icon="briefcase"
          title={t('applications.emptyTitle')}
          description={t('applications.emptyDescription')}
          action={<Button to={paths.home}>{t('nav.findJobs')}</Button>}
        />
      )}
      {data?.length > 0 && (
        <ul className="border-t border-heritage">
          {data.map((application) => (
            <li
              key={application.id}
              className="group relative flex flex-wrap items-center gap-4 border-b border-dashed border-heritage px-3 py-4 hover:bg-surface sm:flex-nowrap"
            >
              <DepartmentMark
                code={application.job.department}
                name={application.job.departmentName}
              />
              <div className="min-w-0 flex-1">
                <h2 className="text-lg">
                  <Link
                    to={paths.application(application.id)}
                    className="text-black no-underline group-hover:underline after:absolute after:inset-0 after:content-['']"
                  >
                    {application.job.title}
                  </Link>
                </h2>
                <p className="text-sm">
                  {application.job.departmentName} · {application.job.location}
                </p>
                <p className="text-sm">
                  {t('applications.idAndDate', {
                    id: application.id,
                    date: formatDate(application.submittedAt),
                  })}
                </p>
              </div>
              <StatusBadge status={application.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
