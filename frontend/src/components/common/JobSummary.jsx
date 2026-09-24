import { t } from '../../i18n';
import { cx } from '../../utils/cx';
import { formatDate } from '../../utils/format';
import { Badge } from './Badge';
import { DepartmentMark } from './DepartmentMark';
import { Icon } from './Icon';

const metaItem = 'inline-flex items-center gap-1 [&>svg]:text-heritage';

/** Job header: department mark, title and key badges. `as` sets the heading level. */
export function JobSummary({ job, as: Heading = 'h2', size = 'md' }) {
  return (
    <div className="flex items-start gap-4">
      <DepartmentMark code={job.department} name={job.departmentName} size={size} />
      <div className="flex min-w-0 flex-col gap-2">
        <Heading className={cx('text-black', size === 'lg' ? 'text-3xl sm:text-4xl' : 'text-xl')}>
          {job.title}
        </Heading>
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span className={metaItem}>
            <Icon name="building" size={16} />
            {job.departmentName}
          </span>
          <span className={metaItem}>
            <Icon name="mapPin" size={16} />
            {job.location}
          </span>
          {job.closingDate && (
            <span className={metaItem}>
              <Icon name="calendar" size={16} />
              {t('job.closesOn', { date: formatDate(job.closingDate) })}
            </span>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="gold">{t('jobs.bps', { bps: job.bps })}</Badge>
          {job.employmentType && (
            <Badge variant="outline">{t(`employmentType.${job.employmentType}`)}</Badge>
          )}
          {job.vacancies && (
            <Badge variant="soft">{t('job.vacancies', { count: job.vacancies })}</Badge>
          )}
        </div>
      </div>
    </div>
  );
}
