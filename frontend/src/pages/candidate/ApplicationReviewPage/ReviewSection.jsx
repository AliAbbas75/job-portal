import { Link } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { t } from '../../../i18n';
import styles from './ApplicationReviewPage.module.css';

/** One summary block on the review page. `rows` is [{ label, value }]; `children` overrides rows. */
export function ReviewSection({ title, editTo, rows, children }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {editTo && (
          <Link
            to={editTo}
            className={styles.edit}
            aria-label={t('review.editNamed', { name: title })}
          >
            <Icon name="edit" size={14} />
            {t('profile.edit')}
          </Link>
        )}
      </div>
      {children ?? (
        <dl className={styles.rows}>
          {rows.map((row) => (
            <div key={row.label} className={styles.row}>
              <dt>{row.label}</dt>
              <dd>{row.value || '—'}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
