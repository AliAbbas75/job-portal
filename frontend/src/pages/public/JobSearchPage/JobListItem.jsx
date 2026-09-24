import { Link } from 'react-router-dom';
import { Badge } from '../../../components/common/Badge';
import { Icon } from '../../../components/common/Icon';
import { t } from '../../../i18n';
import { paths } from '../../../routes/paths';
import { daysUntil, formatRelative } from '../../../utils/format';

export function JobListItem({ job }) {
  const daysLeft = daysUntil(job.closingDate);
  const closingSoon = daysLeft <= 7;

  return (
    <li
      className={`group relative grid grid-cols-1 items-center gap-x-5 gap-y-4 border-b [border-bottom-style:dashed] border-b-heritage py-5 px-4 transition-colors duration-200 md:grid-cols-[1fr_auto] ${
        closingSoon ? 'bg-[#f8d7da] hover:bg-[#f1aeb5]' : 'hover:bg-surface'
      }`}
    >
      <div className="min-w-0">
        <p className="text-xs">{t('jobs.posted', { when: formatRelative(job.publishedAt) })}</p>
        <h3 className="my-0.5 text-xl">
          <Link
            to={paths.job(job.id)}
            className="text-black no-underline group-hover:underline after:absolute after:inset-0 after:content-['']"
          >
            {job.title}
          </Link>
        </h3>
        <p className="text-sm">
          <strong>{job.departmentName}</strong> · {job.summary}
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-1 text-sm md:min-w-45">
        <p className="flex items-center gap-2 [&>svg]:text-heritage">
          <Icon name="briefcase" size={16} />
          {t(`employmentType.${job.employmentType}`)}
        </p>
        <p className="flex items-center gap-2 [&>svg]:text-heritage">
          <Icon name="mapPin" size={16} />
          {job.location}
        </p>
        <p className="flex items-center gap-2 [&>svg]:text-heritage">
          <Icon name="users" size={16} />
          {t('job.vacancies', { count: job.vacancies })}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Badge variant="gold">{t('jobs.bps', { bps: job.bps })}</Badge>
          <span className={closingSoon ? 'font-bold text-ember' : 'font-medium'}>
            {t('jobs.closesIn', { count: daysLeft })}
          </span>
        </div>
      </div>
    </li>
  );
}
