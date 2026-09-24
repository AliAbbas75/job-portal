import { t } from '../../i18n';
import { formatDate } from '../../utils/format';
import { Badge } from './Badge';
import { DepartmentMark } from './DepartmentMark';
import { Icon } from './Icon';
import styles from './JobSummary.module.css';

/** Job header: department mark, title and key badges. `as` sets the heading level. */
export function JobSummary({ job, as: Heading = 'h2', size = 'md' }) {
  return (
    <div className={`${styles.summary} ${styles[size]}`}>
      <DepartmentMark code={job.department} name={job.departmentName} size={size} />
      <div className={styles.body}>
        <Heading className={styles.title}>{job.title}</Heading>
        <p className={styles.meta}>
          <span>
            <Icon name="building" size={16} />
            {job.departmentName}
          </span>
          <span>
            <Icon name="mapPin" size={16} />
            {job.location}
          </span>
          {job.closingDate && (
            <span>
              <Icon name="calendar" size={16} />
              {t('job.closesOn', { date: formatDate(job.closingDate) })}
            </span>
          )}
        </p>
        <div className={styles.badges}>
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
