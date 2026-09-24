import { Link } from 'react-router-dom';
import { Badge } from '../../../components/common/Badge';
import { Icon } from '../../../components/common/Icon';
import { t } from '../../../i18n';
import { paths } from '../../../routes/paths';
import { daysUntil, formatRelative } from '../../../utils/format';
import styles from './JobSearchPage.module.css';

export function JobListItem({ job }) {
  const daysLeft = daysUntil(job.closingDate);
  const closingSoon = daysLeft <= 7;

  return (
    <li className={`${styles.item} ${closingSoon ? styles.itemClosingSoon : ''}`}>
      <div className={styles.itemMain}>
        <p className={styles.posted}>
          {t('jobs.posted', { when: formatRelative(job.publishedAt) })}
        </p>
        <h3 className={styles.itemTitle}>
          <Link to={paths.job(job.id)} className={styles.itemLink}>
            {job.title}
          </Link>
        </h3>
        <p className={styles.itemSummary}>
          <strong>{job.departmentName}</strong> · {job.summary}
        </p>
      </div>

      <div className={styles.itemFacts}>
        <p className={styles.fact}>
          <Icon name="briefcase" size={16} />
          {t(`employmentType.${job.employmentType}`)}
        </p>
        <p className={styles.fact}>
          <Icon name="mapPin" size={16} />
          {job.location}
        </p>
        <p className={styles.fact}>
          <Icon name="users" size={16} />
          {t('job.vacancies', { count: job.vacancies })}
        </p>
        <div className={styles.itemBadges}>
          <Badge variant="gold">{t('jobs.bps', { bps: job.bps })}</Badge>
          <span className={closingSoon ? styles.closingSoon : styles.closing}>
            {t('jobs.closesIn', { count: daysLeft })}
          </span>
        </div>
      </div>
    </li>
  );
}
